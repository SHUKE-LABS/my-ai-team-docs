import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { CHECKOUT_URL } from '../src/purchase.mjs';
import { approvedPageSlugs } from '../content-manifest.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LANDING = path.join(HERE, '..', 'src', 'content', 'docs', 'index.mdx');

const MDX = fs.readFileSync(LANDING, 'utf8');

// Frontmatter cannot import `CHECKOUT_URL`, so the unit test reads the raw
// source and compares the written literal. This is the contract that keeps the
// hero CTA from drifting away from the header CTA in src/purchase.mjs.
function frontmatter(mdx) {
  const match = mdx.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  assert.ok(match, 'index.mdx must open with YAML frontmatter');
  return match[1];
}

function unquote(value) {
  return String(value ?? '')
    .trim()
    .replace(/^(['"])([\s\S]*)\1$/, '$2');
}

function frontmatterValue(front, key) {
  const match = front.match(new RegExp(`^\\s*${key}:\\s*(.+)$`, 'm'));
  assert.ok(match, `frontmatter must declare ${key}`);
  return unquote(match[1]);
}

// Only the shape this page uses: a YAML list of hero actions whose `text` and
// `link` are one scalar per line. Keeping the reader local avoids a YAML
// dependency for the one frontmatter field the acceptance calls out.
function heroActions(front) {
  const start = front.indexOf('actions:');
  assert.ok(start !== -1, 'frontmatter must declare hero actions');
  return front
    .slice(start + 'actions:'.length)
    .split(/\r?\n(?=\s*-\s)/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => ({
      text: unquote((item.match(/text:\s*(.+)/) || [])[1]),
      link: unquote((item.match(/link:\s*(.+)/) || [])[1]),
    }));
}

function normalizeRoute(link) {
  const [pathname] = link.split('#');
  return pathname.replace(/\/+$/, '') || '/';
}

const ACTIONS = heroActions(frontmatter(MDX));

test('the hero tagline is plain outcome language with no insider words', () => {
  const tagline = frontmatterValue(frontmatter(MDX), 'tagline');
  assert.ok(tagline.length > 0, 'hero tagline must not be empty');
  assert.ok(!tagline.includes('`'), `hero tagline must not contain backticks: ${tagline}`);
  for (const word of ['tmux', 'label', 'worktree', 'pane', 'session']) {
    assert.ok(
      !tagline.toLowerCase().includes(word),
      `hero tagline must not contain "${word}": ${tagline}`,
    );
  }
});

test('the first hero action is the checkout URL from src/purchase.mjs', () => {
  assert.ok(ACTIONS.length >= 1, 'the hero must have at least one action');
  assert.equal(ACTIONS[0].text, 'Buy Now');
  assert.equal(ACTIONS[0].link, CHECKOUT_URL);
});

test('the secondary hero actions point at the quickstart and How it works routes', () => {
  const byText = new Map(ACTIONS.map((action) => [action.text, action.link]));
  assert.equal(byText.get('Quickstart'), '/reference/quickstart-agent-assisted/');
  assert.equal(byText.get('How it works'), '/how-it-works/');
});

// The unit phase runs before the Astro build in CI, so it cannot read dist/.
// `approvedPageSlugs()` is the same manifest the build's generated-tree guard
// asserts against, and every approved slug becomes
// dist/reference/<slug>/index.html — so mapping each internal link to an
// approved slug is the build-time guarantee that the route file exists. The
// hand-authored evaluator routes map to their own source page the same way. The
// post-build `test -f dist/<path>/index.html` check is recorded in
// .orbi/test.log as the rendered-path evidence.
test('every internal link on the landing page resolves to a built route', () => {
  const slugs = new Set(approvedPageSlugs());
  const evaluator = new Set(['how-it-works', 'modes', 'compare']);
  const links = [
    ...[...MDX.matchAll(/\]\((\/[^)\s]+)\)/g)].map((m) => m[1]),
    ...[...MDX.matchAll(/href="(\/[^"]+)"/g)].map((m) => m[1]),
    ...ACTIONS.map((action) => action.link).filter((link) => link.startsWith('/')),
  ];
  assert.ok(links.length > 0, 'the landing page must carry internal links');
  for (const link of links) {
    const route = normalizeRoute(link);
    const match = route.match(/^\/reference\/([^/]+)$/);
    if (match) {
      assert.ok(slugs.has(match[1]), `internal link ${link} points at an unbuilt reference route`);
      continue;
    }
    const evaluatorSlug = route.replace(/^\//, '');
    assert.ok(
      evaluator.has(evaluatorSlug),
      `internal link ${link} is neither a reference route nor an evaluator page`,
    );
    assert.ok(
      fs.existsSync(path.join(HERE, '..', 'src', 'content', 'docs', `${evaluatorSlug}.md`)),
      `internal link ${link} points at a missing evaluator page`,
    );
  }
});

test('the landing page links the evaluator pages', () => {
  for (const route of ['/how-it-works/', '/modes/', '/compare/']) {
    assert.ok(MDX.includes(route), `landing page must link ${route}`);
  }
});
