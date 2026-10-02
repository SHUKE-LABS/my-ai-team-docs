import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import {
  transformProse,
  neutralizeLinks,
  stripLeadingH1,
  cleanGeneratedTree,
  writeVersion,
  stripIssueRefs,
  replaceInternalDocNames,
  replaceInternalPaths,
  sanitizeGeneratedSource,
  resolveVersion,
  selectStableVersion,
  PROJECTED_VERSION_FILE,
  buildOverviewPage,
  OVERVIEW_WORD_LIMIT,
  pageFrontmatter,
} from '../scripts/sync-content.mjs';
import {
  README_CUT_AT,
  REFERENCE_DIR,
  approvedPageSlugs,
  referenceRedirects,
  referenceOrder,
} from '../content-manifest.mjs';

test('link to an approved doc becomes a /reference/ site route', () => {
  assert.equal(transformProse('see [the FAQ](faq.md)'), 'see [the FAQ](/reference/faq/)');
  assert.equal(
    transformProse('see [config](../docs/public/user-guide.md#install)'),
    'see [config](/reference/user-guide/#install)',
  );
});

test('link to an excluded doc or arbitrary repo path is stripped to text', () => {
  assert.equal(transformProse('see [CI](ci.md)'), 'see CI');
  assert.equal(transformProse('see [licence](../LICENSE)'), 'see licence');
  assert.equal(transformProse('see [prompts](agents/reviewer.md)'), 'see prompts');
});

test('external links and autolinks are preserved', () => {
  assert.equal(
    transformProse('[home](https://example.com)'),
    '[home](https://example.com)',
  );
  assert.equal(
    transformProse('mail <user@example.com> or <https://x.io>'),
    'mail <user@example.com> or <https://x.io>',
  );
});

test('non-HTML angle-bracket placeholders are escaped, real HTML is kept', () => {
  assert.equal(transformProse('run mat claim <N>'), 'run mat claim &lt;N&gt;');
  assert.equal(transformProse('the <session> pane'), 'the &lt;session&gt; pane');
  assert.equal(
    transformProse('<a href="https://x.io">x</a>'),
    '<a href="https://x.io">x</a>',
  );
  assert.equal(transformProse('row <tr> cell'), 'row <tr> cell');
});

test('placeholders inside code spans and fenced blocks are left untouched', () => {
  assert.equal(neutralizeLinks('use `<session>` here'), 'use `<session>` here');
  const fenced = ['```', 'mat claim <N>', '[x](ci.md)', '```'].join('\n');
  assert.equal(neutralizeLinks(fenced), fenced);
});

test('a link whose label contains a code span still has its href rewritten/stripped', () => {
  assert.equal(
    neutralizeLinks('see [`docs/duo-protocol.md`](duo-protocol.md) for details'),
    'see `docs/duo-protocol.md` for details',
  );
  assert.equal(
    neutralizeLinks('see [`docs/public/faq.md`](faq.md) for details'),
    'see [`docs/public/faq.md`](/reference/faq/) for details',
  );
});

test('a literal link example fully inside a code span is left untouched', () => {
  assert.equal(
    neutralizeLinks('write `[x](ci.md)` literally'),
    'write `[x](ci.md)` literally',
  );
});

test('a link whose label wraps across a soft line break still has its href rewritten/stripped', () => {
  assert.equal(
    neutralizeLinks('see the [OpenCode\nbackend](user-guide.md#x) for details'),
    'see the [OpenCode\nbackend](/reference/user-guide/#x) for details',
  );
  assert.equal(
    neutralizeLinks('see the [baton\nsession manager](baton-session-manager.md#x) for details'),
    'see the baton\nsession manager for details',
  );
});

test('a link whose closing bracket and opening paren are split by a soft line break is still rewritten', () => {
  assert.equal(
    neutralizeLinks('See [service docs]\n(baton-session-manager.md) for setup'),
    'See service docs for setup',
  );
  assert.equal(
    neutralizeLinks('See [baton\'s service docs]\n(https://github.com/shukebeta/baton/blob/main/docs/service.md) for setup'),
    'See [baton\'s service docs](https://github.com/shukebeta/baton/blob/main/docs/service.md) for setup',
  );
});

test('a blank line between two bracket-like fragments never combines into a false link', () => {
  const input = 'para one ends with a bracket [oops\n\nnew paragraph](faq.md) continues';
  assert.equal(neutralizeLinks(input), input);
});

test('stripLeadingH1 removes only the first top-level heading', () => {
  assert.equal(stripLeadingH1('# Title\n\nbody\n# later'), 'body\n# later');
  assert.equal(stripLeadingH1('intro\n# Title'), 'intro\n# Title');
});

test('cleanGeneratedTree cleans only reference/ and preserves hand-authored pages', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gen-'));
  fs.writeFileSync(path.join(dir, 'index.mdx'), 'landing');
  fs.writeFileSync(path.join(dir, '.gitignore'), '*');
  fs.writeFileSync(path.join(dir, 'notes.md'), 'hand-authored');
  fs.mkdirSync(path.join(dir, REFERENCE_DIR));
  fs.writeFileSync(path.join(dir, REFERENCE_DIR, 'faq.md'), 'stale');
  fs.mkdirSync(path.join(dir, 'evaluator'));
  fs.writeFileSync(path.join(dir, 'evaluator', 'index.md'), 'hand-authored group');

  cleanGeneratedTree(dir);

  // Only the generated reference subtree is removed; every hand-authored page
  // outside it (and the landing page/.gitignore) survives.
  assert.deepEqual(fs.readdirSync(dir).sort(), ['.gitignore', 'evaluator', 'index.mdx', 'notes.md']);
  assert.equal(fs.readFileSync(path.join(dir, 'notes.md'), 'utf8'), 'hand-authored');
  assert.ok(fs.existsSync(path.join(dir, 'evaluator', 'index.md')));
  assert.ok(!fs.existsSync(path.join(dir, REFERENCE_DIR)));
  fs.rmSync(dir, { recursive: true, force: true });
});

test('reference page frontmatter carries the ordered sidebar position', () => {
  assert.equal(referenceOrder('overview'), 1);
  assert.equal(referenceOrder('changelog'), 11);
  assert.equal(referenceOrder('brand-new'), undefined);
  assert.match(pageFrontmatter('overview', 'Product overview'), /sidebar:\n  order: 1\n/);
  assert.match(pageFrontmatter('changelog', 'Changelog'), /sidebar:\n  order: 11\n/);
  // A newly added public page gets no order and still renders after the ordered
  // entries — the acceptance path for a docs/public/ addition with no config edit.
  const newPage = pageFrontmatter('brand-new', 'Brand new');
  assert.doesNotMatch(newPage, /sidebar:/);
  assert.match(newPage, /title: "Brand new"/);
});

test('referenceRedirects covers every current route derived from approvedPageSlugs()', () => {
  const redirects = referenceRedirects();
  const slugs = approvedPageSlugs();
  assert.deepEqual(
    Object.keys(redirects).sort(),
    slugs.map((slug) => `/${slug}/`).sort(),
  );
  for (const slug of slugs) {
    assert.equal(redirects[`/${slug}/`], `/reference/${slug}/`);
  }
  // The former top-level routes the release tarball and root README link must
  // all be covered by the map.
  for (const slug of [
    'overview',
    'user-guide',
    'faq',
    'examples',
    'versioning',
    'changelog',
    'quickstart-agent-assisted',
    'quickstart-linux',
    'quickstart-macos',
    'quickstart-wsl2',
    'quickstart-baton-duo',
  ]) {
    assert.ok(slugs.includes(slug), slug);
    assert.equal(redirects[`/${slug}/`], `/reference/${slug}/`);
  }
});

test('writeVersion emits the resolved version as JSON', () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ver-')), 'version.json');
  const info = writeVersion('v9.9.9', file);
  assert.equal(info.version, 'v9.9.9');
  assert.equal(JSON.parse(fs.readFileSync(file, 'utf8')).version, 'v9.9.9');
  fs.rmSync(path.dirname(file), { recursive: true, force: true });
});

test('stripIssueRefs removes every published reference form and tidies up', () => {
  assert.equal(stripIssueRefs('- feat(x): subject (#849)'), '- feat(x): subject');
  assert.equal(
    stripIssueRefs('- docs(#778): a walk-through (#849)'),
    '- docs: a walk-through',
  );
  assert.equal(
    stripIssueRefs('- feat(entitlement): bake its URL (#3138 A2/A3) (#3629)'),
    '- feat(entitlement): bake its URL (A2/A3)',
  );
  assert.equal(stripIssueRefs('- fix: dupes (#12) (#12)'), '- fix: dupes');
  assert.equal(stripIssueRefs('- fix: mid #620 sentence'), '- fix: mid sentence');
  assert.equal(stripIssueRefs('- fix: nothing to strip'), '- fix: nothing to strip');
});

test('replaceInternalDocNames neutralizes an internal doc name with or without a path', () => {
  assert.equal(
    replaceInternalDocNames('- docs: fix claims in session-modes.md baton section'),
    '- docs: fix claims in an internal document baton section',
  );
  assert.equal(
    replaceInternalDocNames('- docs: rewrite docs/entitlement.md'),
    '- docs: rewrite an internal document',
  );
  assert.equal(
    replaceInternalDocNames('- docs: rewrite user-guide.md'),
    '- docs: rewrite user-guide.md',
  );
});

test('replaceInternalPaths neutralizes a path under an internal tree', () => {
  assert.equal(
    replaceInternalPaths('- refactor: split agents/shared/stance.md'),
    '- refactor: split an internal path',
  );
  // The runtime trees are internal too, in every form a release subject
  // writes them: a file, and the bare directory.
  assert.equal(
    replaceInternalPaths('- refactor: extract lib/relay/summon.sh'),
    '- refactor: extract an internal path',
  );
  assert.equal(
    replaceInternalPaths('- fix: route every bare jq in bin/ + lib/ through _mat_jq'),
    '- fix: route every bare jq in an internal path + an internal path through _mat_jq',
  );
  // The customer's own override path shares the basename but not the prefix.
  assert.equal(
    replaceInternalPaths('- docs: document .my-ai-team/dev.md'),
    '- docs: document .my-ai-team/dev.md',
  );
  // Real customer-facing paths that merely END in one of the segments must
  // survive: the guide names both of these.
  assert.equal(
    replaceInternalPaths('- fix: treat /usr/bin/bash without .exe as unset'),
    '- fix: treat /usr/bin/bash without .exe as unset',
  );
  assert.equal(
    replaceInternalPaths('- fix: relink ~/.local/bin/mat on reinstall'),
    '- fix: relink ~/.local/bin/mat on reinstall',
  );
});

test('sanitizeGeneratedSource strips refs, doc names and internal paths together', () => {
  assert.equal(
    sanitizeGeneratedSource('- docs: rewrite docs/ci.md and skills/live/SKILL.md (#3200)'),
    '- docs: rewrite an internal document and an internal path',
  );
  assert.equal(
    sanitizeGeneratedSource('- refactor(relay): move the guard into lib/relay/dispatch.sh (#3201)'),
    '- refactor(relay): move the guard into an internal path',
  );
});

test('resolveVersion picks the highest stable tag and rejects a bad override', () => {
  const tags = ['v0.1.0-beta', 'v3.14.2', 'v3.13.13'];
  // The projected-version reader is stubbed in every case, so the assertions
  // describe the resolver rather than whatever the checkout happens to carry.
  const none = () => '';
  assert.equal(resolveVersion({}, () => ['v3.14.2', 'v3.13.13'], none), 'v3.14.2');
  // A prerelease tag sorts above nothing useful — it must be skipped, not taken.
  assert.equal(resolveVersion({}, () => ['v0.1.0-beta', 'v3.13.13'], none), 'v3.13.13');
  assert.equal(resolveVersion({}, () => [], none), 'dev');
  assert.equal(resolveVersion({ DOCS_VERSION: 'v9.9.9' }, () => tags, none), 'v9.9.9');
  for (const bad of ['v3.13.13-2-g5bad266a', 'v0.1.0-beta', '5bad266a']) {
    assert.throws(() => resolveVersion({ DOCS_VERSION: bad }, () => tags, none), /DOCS_VERSION/);
  }
});

test('the projected version file outranks tags and is validated like an override', () => {
  const tags = () => ['v3.14.2'];
  // A tag-less projected checkout is exactly the case the file exists for.
  assert.equal(resolveVersion({}, () => [], () => 'v4.0.1'), 'v4.0.1');
  // Present in a tagged checkout, the projected value still wins: the file
  // states what THIS tree publishes, and a bootstrap tag is not that.
  assert.equal(resolveVersion({}, tags, () => 'v4.0.1'), 'v4.0.1');
  // Trailing newline from the projected file is not part of the version.
  assert.equal(resolveVersion({}, tags, () => 'v4.0.1\n'), 'v4.0.1');
  // The operator override still outranks it.
  assert.equal(resolveVersion({ DOCS_VERSION: 'v9.9.9' }, tags, () => 'v4.0.1'), 'v9.9.9');
  // Absent file -> fall through to tags, which is this repository's own path.
  assert.equal(resolveVersion({}, tags, () => ''), 'v3.14.2');
  // A malformed projected value fails the build; it never degrades to a tag.
  for (const bad of ['dev', 'v0.1.0-beta', 'v3.13.13-2-g5bad266a', '5bad266a']) {
    assert.throws(
      () => resolveVersion({}, tags, () => bad),
      new RegExp(PROJECTED_VERSION_FILE.replace('.', '\\.')),
    );
  }
});

test('the projected version file is named once and read from the repo root', () => {
  // The name is a cross-repository contract: the projection writes this file and
  // the resolver reads it, so it is exported rather than spelled twice.
  assert.equal(PROJECTED_VERSION_FILE, '.docs-version');
  assert.equal(path.dirname(PROJECTED_VERSION_FILE), '.');
});

test('selectStableVersion never returns a git-describe string', () => {
  assert.equal(selectStableVersion(['v3.13.13-2-g5bad266a', 'v3.13.13']), 'v3.13.13');
  assert.equal(selectStableVersion(['5bad266a']), 'dev');
});

test('README-derived overview is one concise paragraph with a next step', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'overview-'));
  const generated = buildOverviewPage(undefined, dir);
  const page = fs.readFileSync(path.join(dir, 'overview.md'), 'utf8');
  assert.equal(page, generated);

  const body = page.replace(/^---[\s\S]*?---\n\n/, '').trim();
  assert.doesNotMatch(body, /The latest public product overview of my-ai-team\./);
  assert.match(body, /\/user-guide\//);
  assert.equal(body.split(/\n\s*\n/).length, 1);
  assert.ok(body.split(/\s+/).length <= OVERVIEW_WORD_LIMIT);
  assert.doesNotMatch(body, /(^|\n)#{1,6}\s|(^|\n)[-*]\s|```/m);
  assert.doesNotMatch(body, /Session modes|Lifecycle|Prerequisites/);

  // The overview is the slice of README.md before this heading, so a README
  // that lost the boundary would silently publish the whole document.
  const readme = fs.readFileSync(path.resolve(process.cwd(), '..', 'README.md'), 'utf8');
  assert.ok(readme.includes(`\n${README_CUT_AT}\n`));
  fs.rmSync(dir, { recursive: true, force: true });
});
