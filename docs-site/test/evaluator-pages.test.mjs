import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  internalDocNames,
  internalPathPrefixes,
} from '../content-manifest.mjs';
import {
  scanForInternalDocNames,
  scanForInternalPaths,
  scanForIssueRefs,
} from '../scripts/leak-guard.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.join(HERE, '..');
const DOCS = path.join(SITE, 'src', 'content', 'docs');
const REPO = path.join(SITE, '..');

const PAGES = ['how-it-works', 'modes', 'compare'];
const EVALUATOR_ROUTES = new Set(['/how-it-works', '/modes', '/compare']);
const USER_GUIDE = fs.readFileSync(path.join(REPO, 'docs', 'public', 'user-guide.md'), 'utf8');
const FAQ = fs.readFileSync(path.join(REPO, 'docs', 'public', 'faq.md'), 'utf8');
const ASTRO_CONFIG = fs.readFileSync(path.join(SITE, 'astro.config.mjs'), 'utf8');
const LANDING = fs.readFileSync(path.join(DOCS, 'index.mdx'), 'utf8');

const readPage = (slug) => fs.readFileSync(path.join(DOCS, `${slug}.md`), 'utf8');

// Frontmatter is YAML; the reader only needs the title/description scalars this
// suite asserts, so it stays local instead of pulling a YAML dependency.
function frontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  assert.ok(m, 'page must open with YAML frontmatter');
  return m[1];
}

function body(md) {
  return md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
}

// First non-empty paragraph after the frontmatter.
function firstParagraph(md) {
  return body(md)
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .find(Boolean);
}

// The `### <Name> mode` headings under the user guide's `## Modes` section, up
// to the next level-2 heading. The section also carries non-mode subsections
// (`The --lean startup profile`, …), which the ` mode` anchor excludes.
function userGuideModes() {
  const start = USER_GUIDE.indexOf('\n## Modes');
  assert.ok(start !== -1, 'user guide must have a ## Modes section');
  const rest = USER_GUIDE.slice(start + 1);
  const end = rest.indexOf('\n## ', 1);
  const section = end === -1 ? rest : rest.slice(0, end);
  return [...section.matchAll(/^###\s+(.+?)\s+mode\s*$/gm)].map((m) => m[1].trim());
}

function modeHeadings(md) {
  return [...body(md).matchAll(/^##\s+(.+?)\s+mode\s*$/gm)].map((m) => m[1].trim());
}

// Every claim on the page must be sourced from `docs/public/user-guide.md` or
// `docs/public/faq.md`; the FAQ ships the seven-mode agent table and the backend
// list, so the pages reusing those numbers are traceable by construction.
const FAQ_MODE_AGENTS = { explore: 1, caucus: 2, audit: 1, live: 1, adhoc: 1, duo: 2, team: 3 };

for (const slug of PAGES) {
  test(`${slug}.md exists and carries title + description frontmatter`, () => {
    const md = readPage(slug);
    const front = frontmatter(md);
    assert.match(front, /^title:\s*\S/m, 'page must declare a title');
    assert.match(front, /^description:\s*\S/m, 'page must declare a description');
  });

  test(`${slug}.md opens with one plain-language sentence and no inline code`, () => {
    const paragraph = firstParagraph(readPage(slug));
    assert.ok(paragraph, 'page must open with a body paragraph');
    assert.ok(!paragraph.includes('`'), `first paragraph must not use inline code: ${paragraph}`);
    assert.ok(
      paragraph.length > 20 && paragraph.length < 320,
      `first paragraph must be a one-sentence summary: ${paragraph}`,
    );
    // Exactly one sentence terminator (the final one): no internal `. `-style
    // sentence break that would make the "one sentence" promise false.
    const terminators = paragraph.match(/[.!?](?=\s+[A-Z0-9"'(]|\s*$)/g) || [];
    assert.equal(terminators.length, 1, `first paragraph must be one sentence: ${paragraph}`);
  });

  test(`${slug}.md is source-clean (no internal doc/path/issue reference)`, () => {
    const text = readPage(slug);
    assert.deepEqual(
      scanForInternalDocNames([{ path: slug, text }], internalDocNames()),
      [],
      'page must not name an internal document',
    );
    assert.deepEqual(
      scanForInternalPaths([{ path: slug, text }], internalPathPrefixes()),
      [],
      'page must not name an internal path',
    );
    assert.deepEqual(scanForIssueRefs([{ path: slug, text }]), [], 'page must not name an issue reference');
  });

  test(`${slug}.md links only to routes or external URLs (no relative .md link)`, () => {
    const links = [...body(readPage(slug)).matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]);
    for (const link of links) {
      assert.ok(
        !/\.md(?:[#?]|$)/.test(link),
        `${slug}.md must not carry a relative .md link: ${link}`,
      );
    }
  });
}

test('modes.md has exactly the seven user-guide mode sections, in order', () => {
  const expected = userGuideModes();
  assert.deepEqual(expected, ['Team', 'Duo', 'Adhoc', 'Explore', 'Audit', 'Caucus', 'Live']);
  assert.deepEqual(modeHeadings(readPage('modes')), expected);
});

test('each mode section states the FAQ agent count', () => {
  const md = readPage('modes');
  const sections = md.split(/^##\s+/m).slice(1);
  let seen = 0;
  for (const section of sections) {
    const heading = section.match(/^(.+?)\s+mode\s*$/m);
    if (!heading) continue; // the "which mode do I start with?" tail
    const name = heading[1].toLowerCase();
    assert.ok(name in FAQ_MODE_AGENTS, `unexpected mode section: ${name}`);
    seen += 1;
    assert.match(
      section,
      new RegExp(`\\b${FAQ_MODE_AGENTS[name]}\\b`),
      `mode section "${name}" must state its agent count (${FAQ_MODE_AGENTS[name]})`,
    );
  }
  assert.equal(seen, 7, 'every mode section must be covered');
  // The FAQ table is the source the agent counts are taken from.
  for (const [name, agents] of Object.entries(FAQ_MODE_AGENTS)) {
    assert.match(FAQ, new RegExp(`\\|\\s*\`?${name}\`?\\s*\\|\\s*${agents}\\s*\\|`, 'i'), name);
  }
});

test('modes.md ends by naming adhoc and linking the Linux quickstart', () => {
  const md = readPage('modes');
  const tail = md.slice(md.lastIndexOf('## '));
  assert.match(tail, /adhoc/);
  assert.match(tail, /\(\/reference\/quickstart-linux\/\)/);
  // The recommendation is grounded in the quickstart's first-session step.
  const quickstart = fs.readFileSync(
    path.join(REPO, 'docs', 'public', 'quickstart-linux.md'),
    'utf8',
  );
  assert.match(quickstart, /adhoc/, 'the Linux quickstart launches adhoc');
});

test('the Understand sidebar group lists the three pages above Reference', () => {
  const understand = ASTRO_CONFIG.indexOf("label: 'Understand'");
  const reference = ASTRO_CONFIG.indexOf("label: 'Reference'");
  assert.ok(understand !== -1, 'astro.config.mjs must declare an Understand group');
  assert.ok(reference !== -1, 'astro.config.mjs must declare a Reference group');
  assert.ok(understand < reference, 'Understand must sit above Reference');
  for (const slug of PAGES) {
    assert.match(
      ASTRO_CONFIG,
      new RegExp(`slug:\\s*'${slug}'`),
      `Understand group must list ${slug}`,
    );
  }
});

test('the landing hero points at How it works and the modes card at /modes/', () => {
  assert.ok(!LANDING.includes("link: /reference/faq/"), 'the FAQ hero action is replaced');
  assert.match(LANDING, /text: How it works/, 'hero must offer How it works');
  assert.match(LANDING, /link: \/how-it-works\//, 'hero must link /how-it-works/');
  assert.match(LANDING, /title="Understand the modes"/, 'landing must carry the modes card');
  assert.match(LANDING, /\/modes\//, 'the modes card must link /modes/');
  for (const route of EVALUATOR_ROUTES) {
    assert.ok(
      LANDING.includes(`${route}/`),
      `landing must link the evaluator route ${route}/`,
    );
  }
});
