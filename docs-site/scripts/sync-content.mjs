#!/usr/bin/env node
// Build-time content sync: copies the approved public subset (content-manifest.mjs)
// from the repo root into src/content/docs/ as Starlight pages. Single source of
// truth — the site never maintains a second copy of a doc, so it cannot drift.
//
// For every synced doc it:
//   - injects Starlight frontmatter (explicit title from the manifest),
//   - drops the source's leading H1 (Starlight renders the title itself),
//   - neutralizes intra-repo relative links: links to *approved* docs become
//     site routes; links to excluded docs or any other repo path are stripped
//     to plain text so no 404 and no clickable internal path ever ships.
//
// It also derives the product-overview page from README.md, renders the config
// examples page, and writes src/version.json from the newest stable release tag.

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  APPROVED_DOCS,
  APPROVED_EXAMPLES,
  README_SRC,
  README_CUT_AT,
  README_OVERVIEW,
  INTERNAL_DOC_PLACEHOLDER,
  INTERNAL_PATH_PLACEHOLDER,
  internalDocNames,
  internalPathPrefixes,
} from '../content-manifest.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(HERE, '..');
const REPO_ROOT = path.resolve(SITE_ROOT, '..');
const OUT_DIR = path.join(SITE_ROOT, 'src', 'content', 'docs');

// Map every approved doc's source basename -> site route, so a relative link in
// any doc (however many ../ it uses) can be resolved by basename alone.
const approvedBasenameToSlug = new Map(
  APPROVED_DOCS.map((d) => [path.basename(d.src), d.slug]),
);
// README overview is reachable too, under its own basename.
approvedBasenameToSlug.set(path.basename(README_SRC), README_OVERVIEW.slug);

function readRepoFile(rel) {
  return fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8');
}

// A published version badge must name a real release: `vMAJOR.MINOR.PATCH` and
// nothing else. `git describe --tags --always` was the wrong source — between a
// release tag and the next one it returns `v3.13.13-2-g5bad266a`, and with no
// tag fetched at all it returns a bare commit SHA, either of which reads to a
// customer as a build artefact rather than a release they can ask about.
export const STABLE_VERSION_RE = /^v\d+\.\d+\.\d+$/;
// The only non-release value: a checkout with no reachable release tag (a fresh
// clone with no tags, a local build off a topic branch).
export const DEV_VERSION = 'dev';

export function isStableVersion(value) {
  return STABLE_VERSION_RE.test(String(value || '').trim());
}

// Pick the highest stable release tag from a candidate list. The repository also
// carries 100+ historical prerelease tags (`v0.1.0-beta` …), so filtering to the
// stable shape — not merely taking the first line git prints — is what keeps a
// prerelease or a `-N-g<sha>` string out of the badge. Exported for unit testing.
export function selectStableVersion(tagLines) {
  for (const line of tagLines) {
    const tag = line.trim();
    if (isStableVersion(tag)) return tag;
  }
  return DEV_VERSION;
}

// DOCS_VERSION is an explicit operator override; it is validated on the same
// rule rather than passed through, so a typo or a `git describe` string piped
// into it fails the build instead of shipping as the badge.
export function resolveVersion(env = process.env, listTags = gitStableTags) {
  const override = (env.DOCS_VERSION || '').trim();
  if (override) {
    if (!isStableVersion(override)) {
      throw new Error(
        `DOCS_VERSION must be a stable release version (vX.Y.Z); got "${override}"`,
      );
    }
    return override;
  }
  return selectStableVersion(listTags());
}

// Release tags reachable from HEAD, highest first. `--merged HEAD` keeps a tag
// from an unmerged branch out of the badge.
function gitStableTags() {
  try {
    return execSync("git tag --list 'v*' --sort=-version:refname --merged HEAD", {
      cwd: REPO_ROOT,
      encoding: 'utf8',
    }).split('\n');
  } catch {
    return [];
  }
}

// The only generated files that survive a clean: the hand-authored landing page
// and the directory's own .gitignore.
export const PRESERVED_GENERATED = new Set(['index.mdx', '.gitignore']);

// Rewrite a single markdown link target. Returns { keep, href } where keep=false
// means the link should be stripped to plain text.
export function rewriteTarget(rawHref) {
  const href = rawHref.trim();
  // External, protocol, mail, or pure-anchor links pass through untouched.
  if (/^(https?:|mailto:|tel:|#)/i.test(href)) return { keep: true, href };
  // Split off any anchor / query.
  const m = href.match(/^([^#?]*)([#?].*)?$/);
  const filePart = m[1];
  const suffix = m[2] || '';
  if (!filePart) return { keep: true, href }; // e.g. "?x" — leave alone
  const base = path.basename(filePart);
  const slug = approvedBasenameToSlug.get(base);
  if (slug) return { keep: true, href: `/${slug}/${suffix}` };
  // Any other intra-repo path (excluded doc, agents/, skills/, LICENSE, ...) is
  // stripped: the link text is kept, the path is dropped.
  return { keep: false, href: '' };
}

// Known real HTML element names that appear in the source docs (links, raw
// tables). Angle-bracket tokens whose tag name is NOT one of these are treated
// as documentation placeholders (e.g. <session>, <N>, <lock>) and escaped so
// CommonMark renders them literally instead of silently dropping them as
// unknown HTML tags.
const HTML_TAGS = new Set([
  'a', 'abbr', 'b', 'blockquote', 'br', 'code', 'div', 'em', 'hr', 'i', 'img',
  'kbd', 'li', 'ol', 'p', 'pre', 'q', 's', 'small', 'span', 'strong', 'sub',
  'summary', 'details', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead',
  'tr', 'u', 'ul', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
]);

// CommonMark's soft line breaks don't end an inline link: a link's label or
// the gap between "]" and "(" may wrap across a source line (remark/Astro
// render these as a single link). `[^\]]`/`[^)]` are negated character
// classes, so — unlike `.` — they already match newlines; the only addition
// needed is optional whitespace (including a newline) between "]" and "(".
const linkRe = /(?<!\!)\[([^\]]*)\][ \t]*\n?[ \t]*\(([^)]+)\)/g;
// A <...> token: closing/opening tag optionally, name, then arbitrary attrs.
const angleRe = /<\/?([A-Za-z][A-Za-z0-9-]*)((?:[^<>])*)>/g;
// Code spans are not matched across lines (rare in these docs, and CommonMark
// itself treats an un-terminated span conservatively) — `.` intentionally
// does not match newlines here.
const codeSpanRe = /(`+)(.*?)\1/g;

function codeSpanRanges(text) {
  const ranges = [];
  codeSpanRe.lastIndex = 0;
  let m;
  while ((m = codeSpanRe.exec(text)) !== null) {
    ranges.push([m.index, m.index + m[0].length]);
  }
  return ranges;
}

function fullyInsideAnyRange(start, end, ranges) {
  return ranges.some(([s, e]) => start >= s && end <= e);
}

// Rewrite intra-repo links across a block of text (may span several source
// lines — see linkRe above). A link's label may itself contain a code span
// (e.g. "see `docs/x.md`(x.md)"); matching against the whole block — rather
// than only the prose between code spans — is required so such a link's href
// still gets resolved/stripped. A link written entirely INSIDE a single code
// span (a literal markdown-syntax example) is left untouched: it is not a
// real link, just quoted text.
function rewriteLinksInBlock(block) {
  const ranges = codeSpanRanges(block);
  return block.replace(linkRe, (whole, label, target, offset) => {
    if (fullyInsideAnyRange(offset, offset + whole.length, ranges)) return whole;
    const { keep, href } = rewriteTarget(target);
    return keep ? `[${label}](${href})` : label;
  });
}

function escapePlaceholders(text) {
  return text.replace(angleRe, (whole, name) => {
    if (HTML_TAGS.has(name.toLowerCase())) return whole; // real HTML — leave it
    // Leave <scheme://...> and <user@host> autolinks intact.
    if (/^<(?:[a-z][a-z0-9+.-]*:\/\/|mailto:|[^<>@\s]+@)/i.test(whole)) return whole;
    return whole.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  });
}

// Transform prose text: rewrite intra-repo links and escape non-HTML
// placeholder tokens. Exported for direct unit testing (no code-span
// awareness needed at this level — that's processBlock's job).
export function transformProse(text) {
  return escapePlaceholders(rewriteLinksInBlock(text));
}

// Process a block of consecutive non-fence lines (joined by "\n"): rewrite
// links across the whole block first (see rewriteLinksInBlock), then escape
// angle-bracket placeholders only in the prose outside inline code spans,
// which are left byte-for-byte.
function processBlock(block) {
  const rewritten = rewriteLinksInBlock(block);
  let out = '';
  let last = 0;
  let m;
  codeSpanRe.lastIndex = 0;
  while ((m = codeSpanRe.exec(rewritten)) !== null) {
    out += escapePlaceholders(rewritten.slice(last, m.index));
    out += m[0]; // inline code, verbatim
    last = m.index + m[0].length;
  }
  out += escapePlaceholders(rewritten.slice(last));
  return out;
}

// Neutralize links and escape placeholders across the doc, skipping fenced
// code blocks entirely. Image links (![alt](src)) are left untouched. Lines
// within one paragraph (no blank line between them, no fence) are merged
// into a single block before rewriting, since a link may span a soft line
// break (see linkRe) — CommonMark never lets a link span a paragraph break,
// so bounding the merge to one paragraph avoids over-matching across
// unrelated text.
export function neutralizeLinks(markdown) {
  const lines = markdown.split('\n');
  const out = [];
  let buffer = [];
  let inFence = false;
  const flush = () => {
    if (buffer.length) {
      out.push(processBlock(buffer.join('\n')));
      buffer = [];
    }
  };
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      flush();
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    if (line.trim() === '') {
      flush();
      out.push(line);
      continue;
    }
    buffer.push(line);
  }
  flush();
  return out.join('\n');
}

// Remove the first top-level H1 (the doc's own title line) to avoid a duplicate
// heading above Starlight's rendered page title.
export function stripLeadingH1(markdown) {
  const lines = markdown.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].trim() === '') continue;
    if (/^#\s+/.test(lines[i])) {
      lines.splice(i, 1);
      // also drop an immediately following blank line for tidiness
      if (lines[i] !== undefined && lines[i].trim() === '') lines.splice(i, 1);
      break;
    }
    break; // first non-blank line is not an H1 — nothing to strip
  }
  return lines.join('\n');
}

// --- Generated-source sanitization ---------------------------------------
//
// CHANGELOG.md is generated from release subjects, so it cannot be hand-edited
// the way an authored page can: every entry carries its `(#NNNN)` merge
// reference, and historical subjects name internal documents by filename. Both
// are meaningless to a customer — the issue tracker is private, and an internal
// doc has no site route, so link neutralization would leave a dead path sitting
// in the sentence. These transforms run on the rendered page only; the source
// changelog keeps its full references for the repository's own history.

// Remove every issue/PR reference, in each form the generated changelog
// actually produces: a trailing `(#849)`, a conventional-commit scope that is
// nothing but a reference (`docs(#778):`), an annotated reference sharing its
// parenthetical with real text (`(#3138 A2/A3)`), and adjacent or duplicated
// references. The tidy-up passes then remove the punctuation and whitespace the
// removal leaves behind, so no entry ends in `()` or a double space.
export function stripIssueRefs(text) {
  return text
    .replace(/([A-Za-z0-9])\(#\d+\)(?=:)/g, '$1')
    .replace(/#\d+/g, '')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/[ \t]*\(\)/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+$/gm, '');
}

// Replace any internal-only document filename (with an optional path prefix)
// with a neutral phrase, so a historical release subject cannot publish an
// internal document's name.
export function replaceInternalDocNames(
  text,
  names = internalDocNames(),
  placeholder = INTERNAL_DOC_PLACEHOLDER,
) {
  let out = text;
  for (const name of names) {
    const escaped = name.replace(/[.]/g, '\\.');
    out = out.replace(new RegExp(`(?:\\S*/)?${escaped}`, 'g'), placeholder);
  }
  return out;
}

// Replace any path under an internal tree (`agents/…`, `skills/…`,
// `docs/rfcs/…`, `bin/…`, `lib/…`) with a neutral phrase. Guard D rejects those paths on a
// rendered page, and generated release history cannot be hand-edited, so a
// release subject naming an internal source path must be neutralized here or it
// would fail the build with no fix available.
export function replaceInternalPaths(
  text,
  prefixes = internalPathPrefixes(),
  placeholder = INTERNAL_PATH_PLACEHOLDER,
) {
  let out = text;
  for (const prefix of prefixes) {
    const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Same anchoring as Guard D: the prefix must START a path, so a real
    // customer-facing path that merely ends in the same segment
    // (`/usr/bin/env`, `~/.local/bin/mat`) is left alone.
    out = out.replace(new RegExp(`(?<![\\w./-])${escaped}[^\\s)\`,;:]*`, 'g'), placeholder);
  }
  return out;
}

export function sanitizeGeneratedSource(text) {
  return replaceInternalPaths(replaceInternalDocNames(stripIssueRefs(text)));
}

// Slugs whose source is generated by the release tooling rather than authored,
// and therefore needs the sanitization above.
const SANITIZED_SLUGS = new Set(['changelog']);

function frontmatter(title, extra = '') {
  const safe = String(title).replace(/"/g, '\\"');
  return `---\ntitle: "${safe}"\n${extra}---\n\n`;
}

function writePage(slug, body, outDir = OUT_DIR) {
  fs.writeFileSync(path.join(outDir, `${slug}.md`), body, 'utf8');
}

// Remove every previously generated page so a page dropped from the manifest (or
// a renamed source) can never survive into the next build. Only the hand-authored
// landing page and the directory's .gitignore are preserved.
export function cleanGeneratedTree(outDir = OUT_DIR) {
  if (!fs.existsSync(outDir)) return;
  for (const entry of fs.readdirSync(outDir, { withFileTypes: true })) {
    if (PRESERVED_GENERATED.has(entry.name)) continue;
    fs.rmSync(path.join(outDir, entry.name), { recursive: true, force: true });
  }
}

function syncDoc(doc) {
  const raw = readRepoFile(doc.src);
  const source = SANITIZED_SLUGS.has(doc.slug) ? sanitizeGeneratedSource(raw) : raw;
  const body = neutralizeLinks(stripLeadingH1(source));
  writePage(doc.slug, frontmatter(doc.title) + body);
}

function buildExamplesPage() {
  let body = frontmatter('Configuration examples');
  body += 'Example configuration files shipped in `examples/mat/`.\n\n';
  for (const ex of APPROVED_EXAMPLES) {
    const content = readRepoFile(ex.src).replace(/\n+$/, '\n');
    body += `## ${ex.label}\n\n`;
    body += '```' + ex.lang + '\n' + content + '```\n\n';
  }
  writePage('examples', body);
}

export const OVERVIEW_WORD_LIMIT = 150;

// The overview is a signpost, not a second README. Keep only the first prose
// block before the existing install boundary; the README remains the source of
// the product description while operational detail stays in the guide and
// quickstarts.
export function buildOverviewBody(raw) {
  const cutIdx = raw.indexOf(`\n${README_CUT_AT}`);
  const slice = cutIdx === -1 ? raw : raw.slice(0, cutIdx);
  const firstBlock = stripLeadingH1(slice).split(/\n\s*\n/)[0].trim();
  const paragraph = firstBlock.replace(/\s+/g, ' ');
  if (!paragraph) throw new Error('README overview source has no opening paragraph');
  const body = neutralizeLinks(
    `${paragraph} Read the [user guide](docs/public/user-guide.md) or [Linux quickstart](docs/public/quickstart-linux.md) to get started.`,
  ).replace(/\n+$/, '\n');
  const words = body.trim().split(/\s+/).filter(Boolean);
  if (words.length > OVERVIEW_WORD_LIMIT) {
    throw new Error(
      `README overview must be at most ${OVERVIEW_WORD_LIMIT} words; got ${words.length}`,
    );
  }
  return body;
}

export function buildOverviewPage(raw = readRepoFile(README_SRC), outDir = OUT_DIR) {
  const body = buildOverviewBody(raw);
  const generated = frontmatter(README_OVERVIEW.title) + body;
  writePage(
    README_OVERVIEW.slug,
    generated,
    outDir,
  );
  return generated;
}

export function writeVersion(version, outFile = path.join(SITE_ROOT, 'src', 'version.json')) {
  const info = { version, date: new Date().toISOString().slice(0, 10) };
  fs.writeFileSync(outFile, JSON.stringify(info, null, 2) + '\n', 'utf8');
  return info;
}

// Astro's content layer caches the collection in a data store keyed by entry
// id. Regenerating a page in place leaves the previous entry in that store, and
// the loader then warns "Duplicate id ... later items overwrite earlier ones"
// and can render the STALE body — which would hand the leak guard output that
// does not match the sources it just checked. Drop the store so every sync is
// authoritative. CI builds start clean; a local rebuild does not.
export function clearContentCache(siteRoot = SITE_ROOT) {
  for (const dir of ['.astro', path.join('node_modules', '.astro')]) {
    fs.rmSync(path.join(siteRoot, dir), { recursive: true, force: true });
  }
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  clearContentCache();
  cleanGeneratedTree();
  for (const doc of APPROVED_DOCS) syncDoc(doc);
  buildExamplesPage();
  buildOverviewPage();
  const info = writeVersion(resolveVersion());
  const pages = APPROVED_DOCS.length + 2; // + examples + overview
  console.log(`sync-content: wrote ${pages} pages, version ${info.version}`);
}

// Run only when invoked directly (not when imported by the test suite).
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main();
}
