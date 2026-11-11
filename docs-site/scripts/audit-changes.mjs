#!/usr/bin/env node
// Decides whether the high-severity dependency audit must run for a change.
//
// The publication lane used to run `pnpm audit --audit-level=high` on every
// pull request and every push, so a newly published advisory in a build-time
// dependency froze publication even for changes that touch no dependency at
// all — a projection PR cannot fix a lockfile. The audit now runs only for
// changes to a dependency input, and this script owns that rule in one place
// so it stays unit-testable.
//
// Fail-safe by construction: the audit runs unless the changed files are known
// and none of them is a dependency input. An unknown base, an unresolvable
// commit or a failed `git diff` all mean "cannot determine", so they widen the
// decision to "run the audit" instead of silently skipping it.
//
// Contract: prints exactly one line, `run=true` or `run=false`, on stdout.
// Diagnostics go to stderr and the exit code is always 0, so a failure of the
// detection can never fail the publication lane.

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The dependency inputs of the docs site, as repo-root-relative paths.
export const DEPENDENCY_PATHS = [
  'docs-site/package.json',
  'docs-site/pnpm-lock.yaml',
  'docs-site/pnpm-workspace.yaml',
];

// Directories whose contents are dependency inputs: pnpm applies the local
// patches it finds there when it installs.
export const DEPENDENCY_PATH_PREFIXES = ['docs-site/patches/'];

// A changed path is a dependency input when it is one of the files pnpm reads
// or one of the files it patches with.
export function isDependencyPath(changedPath) {
  const normalized = String(changedPath).replace(/^\.\//, '');
  if (DEPENDENCY_PATHS.includes(normalized)) {
    return true;
  }
  return DEPENDENCY_PATH_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

// `changedPaths === null` means the change set could not be determined, which
// must run the audit.
export function shouldAudit(changedPaths) {
  if (!Array.isArray(changedPaths)) {
    return true;
  }
  return changedPaths.some(isDependencyPath);
}

function git(args, cwd) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function repoRoot(cwd) {
  try {
    return git(['rev-parse', '--show-toplevel'], cwd).trim();
  } catch {
    return null;
  }
}

// Returns the changed paths between two commits, or null when the change set
// cannot be determined (missing or zero base, unresolvable commit, failed
// diff). The paths are repo-root-relative.
export function resolveChangedFiles({ base, head, cwd = process.cwd() } = {}) {
  if (!base || !head) {
    return null;
  }
  // A zero SHA is what the push event carries for the first push of a branch:
  // there is no base commit to diff against.
  if (/^0+$/.test(base) || /^0+$/.test(head)) {
    return null;
  }
  const root = repoRoot(cwd);
  if (!root) {
    return null;
  }
  try {
    git(['rev-parse', '--verify', '--quiet', `${base}^{commit}`], root);
    git(['rev-parse', '--verify', '--quiet', `${head}^{commit}`], root);
  } catch {
    return null;
  }
  try {
    const output = git(['diff', '--name-only', base, head, '--'], root);
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return null;
  }
}

export function parseArgs(argv) {
  const args = { base: '', head: '' };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const separator = arg.indexOf('=');
    const flag = separator === -1 ? arg : arg.slice(0, separator);
    const key = flag === '--base' ? 'base' : flag === '--head' ? 'head' : null;
    if (!key) {
      continue;
    }
    if (separator === -1) {
      index += 1;
      args[key] = argv[index] ?? '';
    } else {
      args[key] = arg.slice(separator + 1);
    }
  }
  return args;
}

function main(argv) {
  const { base, head } = parseArgs(argv);
  const changed = resolveChangedFiles({ base, head });
  process.stdout.write(`run=${shouldAudit(changed)}\n`);
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  main(process.argv.slice(2));
}
