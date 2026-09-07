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
  buildOverviewPage,
  OVERVIEW_WORD_LIMIT,
  PRESERVED_GENERATED,
} from '../scripts/sync-content.mjs';

test('link to an approved doc becomes a site route', () => {
  assert.equal(transformProse('see [the FAQ](faq.md)'), 'see [the FAQ](/faq/)');
  assert.equal(
    transformProse('see [config](../docs/public/user-guide.md#install)'),
    'see [config](/user-guide/#install)',
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
    'see [`docs/public/faq.md`](/faq/) for details',
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
    'see the [OpenCode\nbackend](/user-guide/#x) for details',
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

test('cleanGeneratedTree removes stale pages but preserves the landing page', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gen-'));
  fs.writeFileSync(path.join(dir, 'index.mdx'), 'landing');
  fs.writeFileSync(path.join(dir, '.gitignore'), '*');
  fs.writeFileSync(path.join(dir, 'faq.md'), 'stale');
  fs.mkdirSync(path.join(dir, 'rfcs'));
  fs.writeFileSync(path.join(dir, 'rfcs', 'leak.md'), 'stale nested');

  cleanGeneratedTree(dir);

  const left = fs.readdirSync(dir).sort();
  assert.deepEqual(left, ['.gitignore', 'index.mdx']);
  for (const name of left) assert.ok(PRESERVED_GENERATED.has(name));
  fs.rmSync(dir, { recursive: true, force: true });
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
  assert.equal(resolveVersion({}, () => ['v3.14.2', 'v3.13.13']), 'v3.14.2');
  // A prerelease tag sorts above nothing useful — it must be skipped, not taken.
  assert.equal(resolveVersion({}, () => ['v0.1.0-beta', 'v3.13.13']), 'v3.13.13');
  assert.equal(resolveVersion({}, () => []), 'dev');
  assert.equal(resolveVersion({ DOCS_VERSION: 'v9.9.9' }, () => tags), 'v9.9.9');
  for (const bad of ['v3.13.13-2-g5bad266a', 'v0.1.0-beta', '5bad266a']) {
    assert.throws(() => resolveVersion({ DOCS_VERSION: bad }, () => tags), /DOCS_VERSION/);
  }
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
  fs.rmSync(dir, { recursive: true, force: true });
});
