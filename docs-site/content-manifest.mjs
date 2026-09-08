// Single source of truth for what the public documentation site publishes and
// what it must never publish. Both scripts/sync-content.mjs (which copies these
// sources into the Starlight content collection) and scripts/leak-guard.mjs
// (which verifies nothing outside this set leaks) import this manifest, so the
// allowlist and the guard can never drift apart.
//
// Paths are repo-root-relative (the scripts resolve them against `..`).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// The customer-facing documentation directory. Everything in it is published;
// everything outside it under docs/ is internal and never published. The
// allowlist is the DIRECTORY, not a per-file list, so adding a customer page is
// a single `git add` under docs/public/ with no manifest edit — and, conversely,
// an internal doc can only reach the site by being physically moved into the
// customer-facing tree.
export const PUBLIC_DOCS_DIR = 'docs/public';

// Site route -> page title, for the pages whose curated site title differs from
// the source doc's own H1 (which carries platform/audience qualifiers that read
// as noise in a navigation label). Any public doc without an entry here takes
// its leading H1 as the title; one with neither fails the build rather than
// shipping untitled.
export const PUBLIC_DOC_TITLES = {
  'user-guide': 'User guide',
  'quickstart-linux': 'Quickstart: Linux',
  'quickstart-macos': 'Quickstart: macOS',
  'quickstart-wsl2': 'Quickstart: WSL2',
  'quickstart-baton-duo': 'Quickstart: baton & duo',
};

// First `# ` heading of a Markdown source, or '' when it has none.
export function leadingH1(markdown) {
  for (const line of markdown.split('\n')) {
    if (line.trim() === '') continue;
    const m = line.match(/^#\s+(.+?)\s*$/);
    return m ? m[1] : '';
  }
  return '';
}

// Resolve one public doc's { src, slug, title } from its filename and body.
// Exported for direct unit testing (no filesystem needed).
export function publicDocEntry(filename, body) {
  const slug = filename.replace(/\.md$/, '');
  // The H1 is validated on its own, BEFORE any curated override applies: a
  // title override renames a page for navigation, it does not excuse a source
  // doc that opens without a heading. Validating the override too would let an
  // untitled page ship simply because it happens to have an entry here.
  if (!leadingH1(body)) {
    throw new Error(
      `${PUBLIC_DOCS_DIR}/${filename} has no leading H1 — ` +
        'a published page must not ship untitled',
    );
  }
  const title = PUBLIC_DOC_TITLES[slug] || leadingH1(body);
  return { src: `${PUBLIC_DOCS_DIR}/${filename}`, slug, title };
}

// Every Markdown file in the customer-facing directory, slug-ordered so the
// generated page set is stable across filesystems.
export function publicDocs(repoRoot = REPO_ROOT) {
  const dir = path.join(repoRoot, PUBLIC_DOCS_DIR);
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .map((name) => publicDocEntry(name, fs.readFileSync(path.join(dir, name), 'utf8')));
}

// Approved Markdown docs -> published pages. `slug` is the site route and the
// generated filename under src/content/docs/. The customer-facing directory
// supplies most of them; CHANGELOG.md keeps its repo-root source because the
// release tooling generates it there.
export const APPROVED_DOCS = [
  ...publicDocs(),
  { src: 'CHANGELOG.md', slug: 'changelog', title: 'Changelog' },
];

// Approved config examples -> rendered into a single "Configuration examples"
// page as fenced code blocks.
export const APPROVED_EXAMPLES = [
  { src: 'examples/mat/backends.json', label: 'examples/mat/backends.json', lang: 'json' },
  { src: 'examples/mat/user.conf', label: 'examples/mat/user.conf', lang: 'ini' },
];

// The product-overview page is derived from README.md, cut at the first heading
// in README_CUT_AT so only public product framing is included and the trailing
// proprietary copyright block is never carried over.
export const README_SRC = 'README.md';
export const README_CUT_AT = '## Install';
export const README_OVERVIEW = { slug: 'overview', title: 'Product overview' };

// Explicitly excluded internal paths (prefix match). No source under any of
// these may ever enter the published set; the leak guard asserts this
// independently of the approved list.
export const EXCLUDED_PATHS = [
  // Role / agent protocol documents and session internals.
  'docs/adhoc-protocol.md',
  'docs/duo-protocol.md',
  'docs/team-protocol.md',
  'docs/caucus-protocol.md',
  'docs/explore-protocol.md',
  'docs/subagent-protocol.md',
  'docs/session-modes.md',
  'docs/dispatch-daemon.md',
  'docs/baton-session-manager.md',
  'docs/telegram-relay-setup.md',
  'docs/evidence/team-baton-acceptance.md',
  'docs/evidence/windows-real-close-evidence-3021.md',
  'docs/evidence/startup-baseline-windows-git-bash.md',
  'docs/evidence/hook-fanout-baseline-windows-git-bash.md',
  'docs/evidence/relay-detector-matrix-2190.md',
  'docs/evidence/relay-detector-matrix-2190-evidence.md',
  'docs/demo-script.md',
  'docs/devops-helper.md',
  'docs/gh-issue-helper.md',
  'docs/evidence/driver-dispatch-inventory.md',
  'docs/test-framework-capabilities.md',
  'docs/test-framework-porting-guide.md',
  'docs/evidence/auto-refine-hold-arbitration-evidence-3731.md',
  // Internal infrastructure / security docs.
  'docs/ci.md',
  'docs/entitlement.md',
  'docs/credential-sharing.md',
  'docs/headless-agent-cli.md',
  'docs/install-topology.md',
  // Architecture proposals and internal presentations.
  'docs/rfcs/',
  'docs/presentation/',
  // Agent prompts and internal skills.
  'agents/',
  'skills/',
];

// Proprietary content markers. Guard B fails the build if any of these appears
// in the rendered output. Deliberately scoped to the proprietary LICENSE
// wording (not to bare "SHUKE LABS LTD", which legitimately appears in the
// CC-BY attribution) so approved prose that merely mentions an internal doc
// name is never falsely flagged.
export const PROPRIETARY_MARKERS = [
  'proprietary and confidential',
  'Unauthorised copying, distribution, or use is strictly prohibited',
  'All rights reserved',
];

// Excluded directory prefixes (e.g. rfcs/, presentation/, agents/, skills/).
// Guard B asserts no output path falls under any of these.
export function excludedDirs() {
  return EXCLUDED_PATHS.filter((p) => p.endsWith('/')).map((p) => p.replace(/\/$/, ''));
}

// Every `.md` under `dir`, repo-root-relative, recursively. Missing directory
// yields nothing so the manifest stays usable outside a full checkout.
function markdownUnder(absDir, relDir) {
  if (!fs.existsSync(absDir)) return [];
  const found = [];
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    const abs = path.join(absDir, entry.name);
    const rel = `${relDir}/${entry.name}`;
    if (entry.isDirectory()) found.push(...markdownUnder(abs, rel));
    else if (entry.name.endsWith('.md')) found.push(rel);
  }
  return found;
}

// Excluded directory prefixes that hold internal *documents* — prose a customer
// page could name. Separated from the excluded *source* directories (agents/,
// skills/) on purpose: see internalDocNames() for why their basenames cannot be
// used as a forbidden-name list.
function excludedDocDirs() {
  return excludedDirs().filter((d) => d.startsWith('docs/'));
}

// The internal-only document FILENAMES (basename with extension). Customer
// prose must never name one — not as a link, and not as plain text, since link
// neutralization would leave a dead path in the sentence. Derived from
// EXCLUDED_PATHS rather than hand-listed so the rule cannot drift away from
// what is actually excluded, and extended recursively into the excluded *doc*
// directories (docs/rfcs/, docs/presentation/) so a nested internal document is
// not a blind spot.
//
// Deliberately NARROW: the excluded source directories (agents/, skills/) are
// not scanned for names. Their basenames are `dev.md`, `review.md`, `audit.md`,
// `SKILL.md` and so on — exactly the filenames a customer legitimately writes
// when overriding a prompt (`.my-ai-team/dev.md` is a documented extension
// point), so banning those names would ban correct customer instructions. They
// are covered by internalPathPrefixes() as PATHS instead, which is the form
// that actually leaks implementation detail.
export function internalDocNames(repoRoot = REPO_ROOT) {
  const names = new Set(
    EXCLUDED_PATHS.filter((p) => p.endsWith('.md')).map((p) => p.replace(/^.*\//, '')),
  );
  for (const dir of excludedDocDirs()) {
    for (const rel of markdownUnder(path.join(repoRoot, dir), dir)) {
      names.add(rel.replace(/^.*\//, ''));
    }
  }
  return [...names].sort();
}

// Every internal tree's prefix as it would appear written into prose
// (`agents/`, `skills/`, `docs/rfcs/`, `bin/`, `lib/`). Customer pages must not
// name a path under one: that is how an internal source path leaks even when
// the basename is too generic to ban on its own.
export function internalPathPrefixes() {
  return [...excludedDirs().map((d) => `${d}/`), ...INTERNAL_SOURCE_DIRS.map((d) => `${d}/`)];
}

// The runtime source trees. They are not in EXCLUDED_PATHS — they hold no
// documents, so they were never candidates for publication — but a customer
// page must not name a path inside one either: `bin/_mat` and `lib/relay/` are
// implementation detail a customer has no reason to read. `test/` is
// deliberately absent: the guide's Git Bash troubleshooting entry names the
// suite a customer can run against their own install.
export const INTERNAL_SOURCE_DIRS = ['bin', 'lib', 'tools'];

// The neutral phrase an internal document name is replaced with when it appears
// in generated content the site cannot hand-edit (the release Changelog).
export const INTERNAL_DOC_PLACEHOLDER = 'an internal document';

// The same, for a path: a generated release subject naming an internal source
// path reads as prose, so the replacement has to as well.
export const INTERNAL_PATH_PLACEHOLDER = 'an internal path';

// Convenience: the slugs an excluded doc would occupy if it ever leaked as a
// route (basename without extension). Guard B asserts none of these exist in
// the build output.
export function excludedSlugs() {
  return EXCLUDED_PATHS
    .filter((p) => p.endsWith('.md'))
    .map((p) => p.replace(/^.*\//, '').replace(/\.md$/, ''));
}

// Every page slug the sync is allowed to generate as `<slug>.md` under
// src/content/docs/ (the hand-authored index.mdx is separate). Guard A asserts
// the generated source tree contains exactly these plus the preserved files.
export function approvedPageSlugs() {
  return [
    ...APPROVED_DOCS.map((d) => d.slug),
    'examples',
    README_OVERVIEW.slug,
  ];
}
