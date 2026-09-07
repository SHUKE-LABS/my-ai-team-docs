#!/usr/bin/env node
// Leak guard: fails (exit 1) if the public documentation site would publish
// anything it must not, and confirms the required site-wide elements are
// present. All rules are driven by content-manifest.mjs.
//
//   Guard A (source): the approved sources exist and are disjoint from the
//     excluded set, AND the generated src/content/docs/ tree contains exactly
//     the approved generated pages plus the preserved hand-authored files —
//     so an ignored/stale generated file under an excluded prefix cannot slip
//     into the site source undetected. It also asserts that docs/public/ holds
//     only published pages and that every internal doc under docs/ is named in
//     the exclusion set (which is what Guard D's forbidden-name list derives
//     from).
//
//   Guard B (output): a recursive scan of dist/ — no output path/filename may
//     belong to an excluded doc route or directory (checked for every file,
//     text or binary, with any extension stripped), and no text asset (HTML,
//     JS, JSON, CSS, XML, SVG, MD) may contain a proprietary marker. Pagefind's
//     index/fragment payloads under dist/pagefind/ are gzip-compressed binary:
//     a literal marker string cannot survive compression intact, so they are
//     covered by the path/filename check only, not a text scan — the content
//     they are compiled from is the already-marker-scanned HTML pages, which
//     Guard A's exact generated-tree check keeps limited to the approved set.
//
//   Guard C (rendered links): no content page's HTML may contain an
//     unrewritten RELATIVE `.md` href — every intra-repo link must be either
//     rewritten to a site route (approved doc) or stripped to plain text
//     (excluded doc / other repo path) by sync-content.mjs; a surviving
//     relative `.md` href means that rewrite silently failed to fire. An
//     absolute external `.md` link (another repository's docs, say) is
//     legitimate and is not flagged.
//
//   Guard D (customer prose): no rendered content page may name an internal-only
//     document or carry an internal issue/PR reference. Both rules apply to the
//     generated Changelog page as much as to the authored pages — the Changelog
//     is published, and its release subjects historically carry both — so a
//     future release subject that names an internal doc fails the docs build
//     rather than shipping it.
//
//   Presence: every rendered content page must carry the version badge and the
//     CC-BY licence link, proving both are inherited site-wide via the header,
//     and the resolved version must name a real release (`vX.Y.Z`) — never a
//     `git describe` string with a `-N-g<sha>` suffix. It must also carry the
//     header's Buy Now checkout link verbatim, and no output file may carry a
//     raw-bracket checkout query (see "Purchase CTA" below).
//
// `--self-test` runs the pure functions against synthetic fixtures to prove the
// guard rejects violations and accepts clean input, without touching the tree.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  APPROVED_DOCS,
  APPROVED_EXAMPLES,
  README_SRC,
  EXCLUDED_PATHS,
  PROPRIETARY_MARKERS,
  PUBLIC_DOCS_DIR,
  excludedSlugs,
  excludedDirs,
  approvedPageSlugs,
  internalDocNames,
  internalPathPrefixes,
} from '../content-manifest.mjs';
import { isStableVersion, DEV_VERSION } from './sync-content.mjs';
import { CHECKOUT_URL } from '../src/purchase.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(HERE, '..');
const REPO_ROOT = path.resolve(SITE_ROOT, '..');
const DIST_DIR = path.join(SITE_ROOT, 'dist');
const GEN_DIR = path.join(SITE_ROOT, 'src', 'content', 'docs');
const VERSION_FILE = path.join(SITE_ROOT, 'src', 'version.json');

const PRESERVED_GENERATED = new Set(['index.mdx', '.gitignore']);
const LICENSE_NEEDLE = 'creativecommons.org/licenses/by/4.0';
const TEXT_EXT = new Set([
  '.html', '.htm', '.js', '.mjs', '.cjs', '.json', '.css', '.xml', '.svg', '.txt', '.map', '.md',
]);

function approvedSources() {
  return [
    ...APPROVED_DOCS.map((d) => d.src),
    ...APPROVED_EXAMPLES.map((e) => e.src),
    README_SRC,
  ];
}

function isUnderExcluded(srcPath, excluded) {
  return excluded.some((ex) =>
    ex.endsWith('/') ? srcPath.startsWith(ex) : srcPath === ex,
  );
}

// Segments (route names / directory names) that must never appear anywhere in a
// dist path: every excluded doc's route slug plus every excluded directory's
// name (rfcs, presentation, agents, skills, ...).
function bannedSegments() {
  return new Set([...excludedSlugs(), ...excludedDirs().map((d) => path.basename(d))]);
}

// --- Pure guard logic (unit-testable via --self-test) ---------------------

// Guard A, part 1. `existsFn(path)->bool` is injectable.
export function checkManifest(approved, excluded, existsFn) {
  const violations = [];
  for (const src of approved) {
    if (!existsFn(src)) violations.push(`approved source missing: ${src}`);
    if (isUnderExcluded(src, excluded)) {
      violations.push(`approved source is also excluded: ${src}`);
    }
  }
  return violations;
}

// Guard A, part 3: the customer-facing directory and the exclusion set must not
// overlap, and every Markdown file sitting in the customer-facing directory must
// actually be published. The first half catches an internal doc moved into
// docs/public/ while still listed as excluded; the second catches a page that
// lands in the customer tree but never reaches the site (a silent no-op that
// would read as "published" to whoever put it there). `publicNames` is the
// directory listing; `approvedSrcs` the manifest's resolved sources.
export function checkPublicDir(publicNames, approvedSrcs, excluded, dir = PUBLIC_DOCS_DIR) {
  const violations = [];
  const approved = new Set(approvedSrcs);
  for (const name of publicNames) {
    if (!name.endsWith('.md')) continue;
    const src = `${dir}/${name}`;
    if (isUnderExcluded(src, excluded)) {
      violations.push(`customer-facing doc is also excluded: ${src}`);
    }
    if (!approved.has(src)) {
      violations.push(`customer-facing doc is not published: ${src}`);
    }
  }
  return violations;
}

// Guard A, part 4: every internal doc must be COVERED by the exclusion set.
// The directory allowlist already keeps an unlisted internal doc off the site,
// but Guard D's forbidden-name list is derived from EXCLUDED_PATHS — so an
// internal doc nobody excluded is one a customer page may freely name in prose
// without the guard noticing. `docsPaths` is repo-root-relative and recursive,
// so a doc added under a NEW subdirectory of docs/ is caught too: coverage
// means an exact `.md` entry or an excluded directory prefix, and a fresh
// subdirectory has neither.
export function checkExclusionCoverage(docsPaths, excluded) {
  const listed = new Set(excluded);
  const violations = [];
  for (const src of docsPaths) {
    if (!src.endsWith('.md')) continue;
    if (src.startsWith(`${PUBLIC_DOCS_DIR}/`)) continue;
    if (listed.has(src) || isUnderExcluded(src, excluded)) continue;
    violations.push(`internal doc is not in the exclusion set: ${src}`);
  }
  return violations;
}

// Every `.md` under `dir`, repo-root-relative, recursively.
export function markdownPathsUnder(root, dir) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return [];
  const found = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) found.push(...markdownPathsUnder(root, rel));
    else if (entry.name.endsWith('.md')) found.push(rel);
  }
  return found;
}

// Guard A, part 2: the generated source tree must be EXACTLY the approved pages
// plus the preserved hand-authored files — no more (leak), no less (a dropped
// page passing silently).
export function checkGeneratedTree(entryNames, approvedSlugs, preserved) {
  const approvedFiles = approvedSlugs.map((s) => `${s}.md`);
  const required = [...preserved, ...approvedFiles];
  const allowed = new Set(required);
  const present = new Set(entryNames);
  const violations = [];
  for (const name of entryNames) {
    if (!allowed.has(name)) {
      violations.push(`unexpected file in generated source tree: ${name}`);
    }
  }
  for (const name of required) {
    if (!present.has(name)) {
      violations.push(`required generated file missing: ${name}`);
    }
  }
  return violations;
}

// Guard B: recursive output scan. `files` is [{ path, text }] where path is a
// dist-relative POSIX path and text is the file text (undefined for binary).
export function scanTree(files, markers, banned) {
  const violations = [];
  for (const { path: rel, text } of files) {
    for (const seg of rel.split('/')) {
      // Strip ANY extension (not just .html/.htm) before comparing to the
      // banned-segment set, so ci.json, ci.md, ci.js, etc. are all caught —
      // not only an HTML route.
      const name = seg.replace(/\.[^./]+$/, '');
      if (banned.has(name)) {
        violations.push(`excluded path segment "${seg}" in output: ${rel}`);
        break;
      }
    }
    if (text !== undefined) {
      for (const marker of markers) {
        if (text.includes(marker)) {
          violations.push(`proprietary marker "${marker}" found in ${rel}`);
        }
      }
    }
  }
  return violations;
}

// Guard C: no rendered content page may contain an unrewritten RELATIVE
// Markdown link. Every approved intra-repo link is rewritten to a site route
// (no .md suffix) at build time; any surviving `href="....md"` with no
// scheme means the sync's link-rewrite silently failed to fire (e.g. a link
// label/target split across a code span or a soft line break) and an
// internal path — approved or excluded — is shipping as a raw, clickable
// relative link. An absolute external link ending in `.md` (e.g. a GitHub
// blob URL on another repo) is legitimate and must not be flagged.
const ABSOLUTE_HREF_RE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

export function scanForUnrewrittenMdLinks(contentPages) {
  const violations = [];
  const hrefRe = /href="([^"]+\.md)(?:#[^"]*)?"/g;
  for (const { path: rel, text } of contentPages) {
    hrefRe.lastIndex = 0;
    let m;
    while ((m = hrefRe.exec(text)) !== null) {
      const href = m[1];
      if (ABSOLUTE_HREF_RE.test(href)) continue; // external — not a leak
      violations.push(`unrewritten relative .md link in output: ${rel} -> ${href}`);
    }
  }
  return violations;
}

// Guard D, part 1: no rendered content page may name an internal-only document.
// The site has no route for one, so the name reads to a customer as a path they
// cannot follow — and link neutralization deliberately turns such a link into
// exactly that: dead plain text.
export function scanForInternalDocNames(contentPages, names) {
  const violations = [];
  for (const { path: rel, text } of contentPages) {
    for (const name of names) {
      if (text.includes(name)) {
        violations.push(`internal document name "${name}" in customer page: ${rel}`);
      }
    }
  }
  return violations;
}

// Guard D, part 3: no rendered content page may name a path under an internal
// tree (`agents/…`, `skills/…`, `docs/rfcs/…`, `bin/…`, `lib/…`). Those
// directories hold internal prompt/skill sources, runtime implementation and
// internal documents whose BASENAMES are too
// generic to ban (a customer's own `.my-ai-team/dev.md` override is correct
// documentation), so the path prefix is what distinguishes an implementation
// path from legitimate customer instructions.
// The prefix must START a path. Anything path-like before it means a different
// path, and that includes a leading slash: `.agents/skills`, `~/.claude/skills`
// and `${XDG_CONFIG_HOME}/mat/skills/` are all directories on the customer's
// own machine that merely contain `agents/` or `skills/` as a segment. So this
// rule catches the repo-root form an internal path is actually written in
// (`agents/shared/stance.md`), and a page must not spell one as
// `<install-root>/agents/...` to slip past it.
export function scanForInternalPaths(contentPages, prefixes) {
  const violations = [];
  const patterns = prefixes.map((prefix) => [
    prefix,
    new RegExp(`(?<![\\w./-])${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
  ]);
  for (const { path: rel, text } of contentPages) {
    for (const [prefix, re] of patterns) {
      if (re.test(text)) {
        violations.push(`internal path "${prefix}" in customer page: ${rel}`);
      }
    }
  }
  return violations;
}

// Guard D, part 2: no rendered content page may carry an internal issue/PR
// reference. This repository's tracker is private, so `#3610` is unresolvable
// noise to a customer.
//
// The threshold is three digits or more, and it is a deliberate line rather
// than a shortcut. `#` followed by a short number is legitimate customer
// content that must keep working: a tmux pane reference in the relay's own
// output and reply syntax (`#12 adhoc claude — busy`, `#6 please review the
// API design`) and an illustrative issue number in a sample command
// (`issue #42: pytest hangs`) — the reader's own issue, not ours. Every
// internal reference this repository has ever written into its docs is three
// or four digits, so the threshold catches all of them without banning the
// forms a customer needs. An `id="..."`/`href="#..."` anchor is HTML plumbing
// rather than prose, and a `:` immediately before the `#` is excluded because
// that is a CSS declaration (`color:#111111`, `--1:#403`) — the syntax-
// highlighting theme Astro inlines is full of all-digit hex colours, which are
// otherwise indistinguishable from an issue number.
const ISSUE_REF_IN_PROSE_RE = /(?:^|[^\w"/=&;:-])#\d{3,}\b/;

export function scanForIssueRefs(contentPages) {
  const violations = [];
  for (const { path: rel, text } of contentPages) {
    const m = text.match(ISSUE_REF_IN_PROSE_RE);
    if (m) {
      violations.push(`internal issue reference "${m[0].trim()}" in customer page: ${rel}`);
    }
  }
  return violations;
}

// Presence, part 1: the resolved version must name a real release. `dev` is the
// one accepted non-release value (a checkout with no reachable release tag); a
// `git describe` string, a prerelease tag, or anything else fails closed.
export function checkVersionShape(version) {
  const value = String(version || '').trim();
  if (!value) return []; // checkPresence already fails closed on an empty version
  if (value === DEV_VERSION || isStableVersion(value)) return [];
  return [
    `resolved version "${value}" is not a release version (vX.Y.Z) — the badge must not ship a git-describe or prerelease string`,
  ];
}

// Presence: every content page must include the version and the licence link.
// Fails CLOSED on a missing/empty version — an unresolved version must never
// silently skip the per-page check, it must flag every page as unverifiable.
export function checkPresence(contentPages, version, licenseNeedle) {
  const violations = [];
  if (!version) {
    violations.push('resolved version is missing or empty — cannot verify the version badge on any page');
  }
  for (const { path: rel, text } of contentPages) {
    if (!version) {
      violations.push(`page unverifiable without a resolved version: ${rel}`);
    } else if (!text.includes(version)) {
      violations.push(`page missing version badge (${version}): ${rel}`);
    }
    if (!text.includes(licenseNeedle)) {
      violations.push(`page missing CC-BY licence link: ${rel}`);
    }
  }
  return violations;
}

// --- Purchase CTA ---------------------------------------------------------

// Purchase CTA, part 1: every rendered content page must carry the header's
// checkout link with the exact percent-encoded URL — the CTA lives in the site
// header, so a page without it proves the header override stopped being
// inherited site-wide (the same mechanism the presence check above uses for the
// version badge and licence link).
export function checkBuyCta(contentPages, checkoutNeedle = CHECKOUT_URL) {
  const violations = [];
  for (const { path: rel, text } of contentPages) {
    if (!text.includes(checkoutNeedle)) {
      violations.push(`page missing header Buy Now checkout link (${checkoutNeedle}): ${rel}`);
    }
  }
  return violations;
}

// Purchase CTA, part 2: a raw-bracket checkout query (`checkout[...]`) gets
// truncated by chat clients and linkifiers before the URL reaches LemonSqueezy,
// which then opens checkout with an empty discount code — only the
// percent-encoded form (%5B / %5D) may ship, anywhere in the output, in any
// text asset. The encoded URL itself never matches, and the plain store link
// (no query) never matches either.
export function scanForUnencodedCheckout(files) {
  const violations = [];
  for (const { path: rel, text } of files) {
    if (/checkout\[[^\]]*\]/.test(text)) {
      violations.push(`raw-bracket checkout query (must be %5B/%5D-encoded): ${rel}`);
    }
  }
  return violations;
}

// --- Real-tree collectors -------------------------------------------------

function walkFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else {
        const rel = path.relative(DIST_DIR, full).split(path.sep).join('/');
        const isText = TEXT_EXT.has(path.extname(entry.name).toLowerCase());
        out.push({ path: rel, text: isText ? fs.readFileSync(full, 'utf8') : undefined });
      }
    }
  };
  walk(dir);
  return out;
}

// Rendered content pages: .html not under pagefind/ or _astro/.
function contentPages(files) {
  return files.filter(
    (f) =>
      f.path.endsWith('.html') &&
      !f.path.startsWith('pagefind/') &&
      !f.path.startsWith('_astro/'),
  );
}

function readVersion() {
  try {
    return JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8')).version || '';
  } catch {
    return '';
  }
}

// --- Self-test ------------------------------------------------------------

function selfTest() {
  let failures = 0;
  const assert = (cond, msg) => {
    if (!cond) {
      console.error(`self-test FAIL: ${msg}`);
      failures += 1;
    }
  };
  const banned = bannedSegments();

  // Guard A part 1.
  assert(
    checkManifest(['docs/public/faq.md', 'docs/ci.md'], ['docs/ci.md'], () => true)
      .some((v) => v.includes('also excluded')),
    'checkManifest flags an excluded approved path',
  );
  assert(
    checkManifest(['docs/public/faq.md'], EXCLUDED_PATHS, () => false)
      .some((v) => v.includes('missing')),
    'checkManifest flags a missing source',
  );
  assert(
    checkManifest(['docs/public/faq.md'], ['docs/ci.md'], () => true).length === 0,
    'checkManifest accepts a clean manifest',
  );

  // Guard A part 2.
  assert(
    checkGeneratedTree(['faq.md', 'ci.md', 'index.mdx', '.gitignore'], ['faq'], PRESERVED_GENERATED)
      .some((v) => v.includes('ci.md')),
    'checkGeneratedTree flags a stale/excluded generated file',
  );
  assert(
    checkGeneratedTree(['index.mdx', '.gitignore'], ['faq'], PRESERVED_GENERATED)
      .some((v) => v.includes('faq.md') && v.includes('missing')),
    'checkGeneratedTree flags a missing approved page (exact-set equality)',
  );
  assert(
    checkGeneratedTree(['faq.md', 'index.mdx', '.gitignore'], ['faq'], PRESERVED_GENERATED)
      .length === 0,
    'checkGeneratedTree accepts approved pages + preserved files',
  );

  // Guard B: excluded route (top-level and nested), excluded dir, non-HTML marker.
  assert(
    scanTree([{ path: 'ci/index.html', text: 'ok' }], PROPRIETARY_MARKERS, banned)
      .some((v) => v.includes('excluded path segment')),
    'scanTree flags an excluded route directory',
  );
  assert(
    scanTree([{ path: 'rfcs/0001/index.html', text: 'ok' }], PROPRIETARY_MARKERS, banned)
      .some((v) => v.includes('rfcs')),
    'scanTree flags a nested excluded directory',
  );
  assert(
    scanTree(
      [{ path: '_astro/app.js', text: 'x = "proprietary and confidential";' }],
      PROPRIETARY_MARKERS,
      banned,
    ).some((v) => v.includes('marker')),
    'scanTree flags a proprietary marker in a non-HTML asset',
  );
  assert(
    scanTree(
      [{ path: 'pagefind/index.json', text: undefined }],
      PROPRIETARY_MARKERS,
      banned,
    ).length === 0,
    'scanTree ignores binary assets and clean paths',
  );
  assert(
    scanTree(
      [{ path: 'faq/index.html', text: 'documentation licensed under CC BY 4.0' }],
      PROPRIETARY_MARKERS,
      banned,
    ).length === 0,
    'scanTree accepts a clean content page',
  );
  assert(
    scanTree([{ path: 'ci.json', text: '{}' }], PROPRIETARY_MARKERS, banned)
      .some((v) => v.includes('excluded path segment')),
    'scanTree flags an excluded name with a non-HTML extension (ci.json)',
  );
  assert(
    scanTree([{ path: 'ci.md', text: 'x' }], PROPRIETARY_MARKERS, banned)
      .some((v) => v.includes('excluded path segment')),
    'scanTree flags an excluded name with a .md extension (ci.md)',
  );

  // Guard C: unrewritten relative .md links in rendered output.
  assert(
    scanForUnrewrittenMdLinks([
      { path: 'user-guide/index.html', text: 'See <a href="duo-protocol.md">docs</a>' },
    ]).some((v) => v.includes('duo-protocol.md')),
    'scanForUnrewrittenMdLinks flags a surviving relative .md href',
  );
  assert(
    scanForUnrewrittenMdLinks([
      { path: 'faq/index.html', text: 'See <a href="/user-guide/">docs</a>' },
    ]).length === 0,
    'scanForUnrewrittenMdLinks accepts a rewritten site route',
  );
  assert(
    scanForUnrewrittenMdLinks([
      {
        path: 'quickstart-baton-duo/index.html',
        text: 'See <a href="https://github.com/shukebeta/baton/blob/main/docs/service.md">docs</a>',
      },
    ]).length === 0,
    'scanForUnrewrittenMdLinks accepts an absolute external .md URL',
  );

  // Guard A part 3.
  assert(
    checkPublicDir(['faq.md'], ['docs/public/faq.md'], ['docs/public/faq.md'], 'docs/public')
      .some((v) => v.includes('also excluded')),
    'checkPublicDir flags a customer-facing doc that is also excluded',
  );
  assert(
    checkPublicDir(['newpage.md'], ['docs/public/faq.md'], EXCLUDED_PATHS, 'docs/public')
      .some((v) => v.includes('not published')),
    'checkPublicDir flags a customer-facing doc that is not published',
  );
  assert(
    checkPublicDir(['faq.md', 'notes.txt'], ['docs/public/faq.md'], EXCLUDED_PATHS, 'docs/public')
      .length === 0,
    'checkPublicDir accepts a published doc and ignores non-Markdown files',
  );

  // Guard A part 4.
  assert(
    checkExclusionCoverage(['docs/rfcs/new-rfc.md'], EXCLUDED_PATHS).length === 0,
    'checkExclusionCoverage accepts a nested doc covered by an excluded directory prefix',
  );
  assert(
    checkExclusionCoverage(['docs/notes/scratch.md'], EXCLUDED_PATHS).some((v) =>
      v.includes('docs/notes/scratch.md'),
    ),
    'checkExclusionCoverage flags a doc under a new, unexcluded subdirectory',
  );
  assert(
    checkExclusionCoverage([`${PUBLIC_DOCS_DIR}/faq.md`], EXCLUDED_PATHS).length === 0,
    'checkExclusionCoverage ignores the customer-facing directory',
  );
  assert(
    scanForInternalPaths(
      [{ path: 'user-guide/index.html', text: 'edit agents/shared/personality-dev.md' }],
      internalPathPrefixes(),
    ).some((v) => v.includes('agents/')),
    'scanForInternalPaths flags an internal source path in customer prose',
  );
  assert(
    scanForInternalPaths(
      [{ path: 'user-guide/index.html', text: 'create .my-ai-team/dev.md in your repo' }],
      internalPathPrefixes(),
    ).length === 0,
    'scanForInternalPaths accepts a customer-owned override path with an internal basename',
  );
  assert(
    scanForInternalPaths(
      [{ path: 'user-guide/index.html', text: 'Codex-native .agents/skills is not an input' }],
      internalPathPrefixes(),
    ).length === 0,
    'scanForInternalPaths accepts a customer path that merely contains the prefix',
  );
  assert(
    checkExclusionCoverage(['docs/ci.md', 'docs/newthing.md'], EXCLUDED_PATHS).some((v) =>
      v.includes('newthing.md'),
    ),
    'checkExclusionCoverage flags an internal doc missing from the exclusion set',
  );
  assert(
    checkExclusionCoverage(['docs/ci.md', 'docs/README.txt'], EXCLUDED_PATHS).length === 0,
    'checkExclusionCoverage accepts a listed internal doc and ignores non-Markdown files',
  );

  // Guard D part 1: internal document names in customer pages.
  assert(
    scanForInternalDocNames(
      [{ path: 'changelog/index.html', text: 'restructure install-topology.md on a spine' }],
      internalDocNames(),
    ).some((v) => v.includes('install-topology.md')),
    'scanForInternalDocNames flags an internal doc name on the generated Changelog page',
  );
  assert(
    scanForInternalDocNames(
      [{ path: 'faq/index.html', text: 'see the <a href="/user-guide/">user guide</a>' }],
      internalDocNames(),
    ).length === 0,
    'scanForInternalDocNames accepts a page naming only published pages',
  );

  // Guard D part 2: internal issue references, in each published form.
  for (const [label, text] of [
    ['trailing reference', 'bake its URL (#3629)'],
    ['conventional-commit scope', 'docs(#778): a walk-through'],
    ['annotated reference', 'bake its URL (#3138 A2/A3)'],
    ['bare prose reference', 'delivered in #1443 for Git Bash'],
    ['historical three-digit reference', 'see #620 for the rationale'],
  ]) {
    assert(
      scanForIssueRefs([{ path: 'changelog/index.html', text }]).length === 1,
      `scanForIssueRefs flags an internal issue reference (${label})`,
    );
  }
  assert(
    scanForIssueRefs([
      {
        path: 'faq/index.html',
        text: '<a id="install" href="#install">Install</a> costs $29 and uses #fff',
      },
    ]).length === 0,
    'scanForIssueRefs ignores HTML anchors and hex colours',
  );
  assert(
    scanForIssueRefs([
      {
        path: 'user-guide/index.html',
        text: '<code>#12 adhoc claude</code> and <code>issue #42: pytest hangs</code>',
      },
    ]).length === 0,
    'scanForIssueRefs allows pane numbers and an illustrative issue number',
  );

  // Presence part 1: the version badge must name a real release.
  for (const bad of ['v3.13.13-2-g5bad266a', 'v0.1.0-beta', '5bad266a', 'latest']) {
    assert(
      checkVersionShape(bad).length === 1,
      `checkVersionShape rejects a non-release version (${bad})`,
    );
  }
  assert(
    checkVersionShape('v3.14.2').length === 0 && checkVersionShape('dev').length === 0,
    'checkVersionShape accepts a release version and the no-tag "dev" fallback',
  );

  // Presence.
  assert(
    checkPresence(
      [{ path: 'faq/index.html', text: 'header v1.2.3 ... creativecommons.org/licenses/by/4.0' }],
      'v1.2.3',
      LICENSE_NEEDLE,
    ).length === 0,
    'checkPresence accepts a page with version + licence',
  );
  assert(
    checkPresence(
      [{ path: 'faq/index.html', text: 'no badge here' }],
      'v1.2.3',
      LICENSE_NEEDLE,
    ).length === 2,
    'checkPresence flags a page missing both version and licence',
  );
  assert(
    checkPresence(
      [{ path: 'faq/index.html', text: `v1.2.3 ${LICENSE_NEEDLE}` }],
      '',
      LICENSE_NEEDLE,
    ).length === 2, // top-level "version missing" + per-page "unverifiable"
    'checkPresence fails closed (does not skip) when version is empty',
  );

  // Purchase CTA.
  assert(
    checkBuyCta([{ path: 'faq/index.html', text: `<a href="${CHECKOUT_URL}">Buy Now</a>` }])
      .length === 0,
    'checkBuyCta accepts a page carrying the encoded checkout link',
  );
  assert(
    checkBuyCta([{ path: 'faq/index.html', text: 'header without the CTA' }]).length === 1,
    'checkBuyCta flags a page missing the header checkout link',
  );
  assert(
    checkBuyCta([{ path: 'faq/index.html', text: CHECKOUT_URL.replace('%5B', '[').replace('%5D', ']') }])
      .length === 1,
    'checkBuyCta rejects a raw-bracket form of the checkout link',
  );
  assert(
    scanForUnencodedCheckout([
      { path: 'faq/index.html', text: '<a href="https://x/checkout/buy/y?checkout[discount_code]=50OFF">' },
    ]).length === 1,
    'scanForUnencodedCheckout flags a raw-bracket checkout query',
  );
  assert(
    scanForUnencodedCheckout([
      { path: 'faq/index.html', text: `<a href="${CHECKOUT_URL}">Buy Now</a> at https://shukelabs.lemonsqueezy.com` },
    ]).length === 0,
    'scanForUnencodedCheckout accepts the encoded checkout link and the plain store link',
  );

  if (failures) {
    console.error(`leak-guard self-test: ${failures} failure(s)`);
    process.exit(1);
  }
  console.log('leak-guard self-test: all checks passed');
}

// --- Main -----------------------------------------------------------------

function main() {
  const violations = [];

  // Guard A.
  violations.push(
    ...checkManifest(approvedSources(), EXCLUDED_PATHS, (p) =>
      fs.existsSync(path.join(REPO_ROOT, p)),
    ),
  );
  if (!fs.existsSync(GEN_DIR)) {
    violations.push(`generated source tree missing (${GEN_DIR}) — run sync-content before the leak guard`);
  } else {
    violations.push(
      ...checkGeneratedTree(fs.readdirSync(GEN_DIR), approvedPageSlugs(), PRESERVED_GENERATED),
    );
  }
  const publicDir = path.join(REPO_ROOT, PUBLIC_DOCS_DIR);
  if (!fs.existsSync(publicDir)) {
    violations.push(`customer-facing docs directory missing (${publicDir})`);
  } else {
    violations.push(
      ...checkPublicDir(
        fs.readdirSync(publicDir),
        APPROVED_DOCS.map((d) => d.src),
        EXCLUDED_PATHS,
      ),
    );
  }
  violations.push(
    ...checkExclusionCoverage(markdownPathsUnder(REPO_ROOT, 'docs'), EXCLUDED_PATHS),
  );

  // Guard B + presence.
  if (!fs.existsSync(DIST_DIR)) {
    violations.push(`dist/ not found — run the build before the leak guard (${DIST_DIR})`);
  } else {
    const files = walkFiles(DIST_DIR);
    const pages = contentPages(files);
    const version = readVersion();
    violations.push(...scanTree(files, PROPRIETARY_MARKERS, bannedSegments()));
    violations.push(...scanForUnrewrittenMdLinks(pages));
    violations.push(...scanForInternalDocNames(pages, internalDocNames()));
    violations.push(...scanForInternalPaths(pages, internalPathPrefixes()));
    violations.push(...scanForIssueRefs(pages));
    violations.push(...checkVersionShape(version));
    violations.push(...checkPresence(pages, version, LICENSE_NEEDLE));
    violations.push(...checkBuyCta(pages));
    violations.push(...scanForUnencodedCheckout(files));
  }

  if (violations.length) {
    console.error('leak-guard: FAILED');
    for (const v of violations) console.error(`  - ${v}`);
    process.exit(1);
  }
  console.log('leak-guard: passed (manifest + public dir + generated tree + output + links + customer prose + presence + buy CTA clean)');
}

// Run only when invoked directly (not when imported by the test suite) — same
// guard as sync-content.mjs. Importing this module must be side-effect-free.
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  if (process.argv.includes('--self-test')) {
    selfTest();
  } else {
    main();
  }
}
