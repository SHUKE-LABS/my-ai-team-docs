import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import {
  DEPENDENCY_PATHS,
  isDependencyPath,
  parseArgs,
  resolveChangedFiles,
  shouldAudit,
} from '../scripts/audit-changes.mjs';

function git(args, cwd) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function makeRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-changes-'));
  git(['init', '--quiet'], dir);
  git(['config', 'user.email', 'audit@example.test'], dir);
  git(['config', 'user.name', 'Audit Test'], dir);
  git(['config', 'commit.gpgsign', 'false'], dir);
  fs.writeFileSync(path.join(dir, 'README.md'), 'one\n');
  git(['add', '.'], dir);
  git(['commit', '--quiet', '-m', 'first'], dir);
  return dir;
}

test('a changed dependency input runs the audit', () => {
  for (const dependencyPath of DEPENDENCY_PATHS) {
    assert.equal(isDependencyPath(dependencyPath), true, dependencyPath);
    assert.equal(shouldAudit([dependencyPath]), true, dependencyPath);
  }
});

test('a changed patch file runs the audit', () => {
  const patchPath = 'docs-site/patches/http-cache-semantics@4.2.0.patch';
  assert.equal(isDependencyPath(patchPath), true);
  assert.equal(shouldAudit([patchPath]), true);
});

test('a change outside the dependency inputs skips the audit', () => {
  const contentPaths = [
    'CHANGELOG.md',
    '.docs-version',
    'README.md',
    'docs-site/src/content/docs/index.mdx',
    'docs-site/scripts/sync-content.mjs',
    '.github/workflows/docs-deploy.yml',
  ];
  for (const contentPath of contentPaths) {
    assert.equal(isDependencyPath(contentPath), false, contentPath);
    assert.equal(shouldAudit([contentPath]), false, contentPath);
  }
});

test('a path that only looks like the patch directory does not run the audit', () => {
  assert.equal(isDependencyPath('docs-site/patches-old/x.patch'), false);
  assert.equal(shouldAudit(['docs-site/patches-old/x.patch']), false);
});

test('an undeterminable change set runs the audit', () => {
  assert.equal(shouldAudit(null), true);
  assert.equal(shouldAudit(undefined), true);
});

test('an empty change set skips the audit', () => {
  assert.equal(shouldAudit([]), false);
});

test('the base and head arguments are parsed', () => {
  assert.deepEqual(parseArgs(['--base', 'abc', '--head', 'def']), {
    base: 'abc',
    head: 'def',
  });
  assert.deepEqual(parseArgs(['--base=abc', '--head=def']), { base: 'abc', head: 'def' });
  assert.deepEqual(parseArgs([]), { base: '', head: '' });
});

test('the changed files of a real commit range are resolved', () => {
  const dir = makeRepo();
  const base = git(['rev-parse', 'HEAD'], dir).trim();
  fs.writeFileSync(path.join(dir, 'README.md'), 'two\n');
  fs.mkdirSync(path.join(dir, 'docs-site', 'patches'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'docs-site', 'patches', 'x.patch'), 'patch\n');
  git(['add', '.'], dir);
  git(['commit', '--quiet', '-m', 'second'], dir);
  const head = git(['rev-parse', 'HEAD'], dir).trim();

  const changed = resolveChangedFiles({ base, head, cwd: dir });
  assert.deepEqual(changed?.sort(), ['README.md', 'docs-site/patches/x.patch']);
  assert.equal(shouldAudit(changed), true);
});

test('an unknown or unresolvable base resolves to no change set', () => {
  const dir = makeRepo();
  const head = git(['rev-parse', 'HEAD'], dir).trim();

  assert.equal(resolveChangedFiles({ base: '', head, cwd: dir }), null);
  assert.equal(resolveChangedFiles({ base: '0'.repeat(40), head, cwd: dir }), null);
  assert.equal(resolveChangedFiles({ base: 'f'.repeat(40), head, cwd: dir }), null);
  assert.equal(resolveChangedFiles({ base: head, head: 'f'.repeat(40), cwd: dir }), null);
});

test('a change set that cannot be determined still runs the audit', () => {
  const dir = makeRepo();
  const head = git(['rev-parse', 'HEAD'], dir).trim();
  const changed = resolveChangedFiles({ base: 'f'.repeat(40), head, cwd: dir });
  assert.equal(shouldAudit(changed), true);
});
