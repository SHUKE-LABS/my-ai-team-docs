import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  checkManifest,
  checkPublicDir,
  checkGeneratedTree,
  scanTree,
  scanForUnrewrittenMdLinks,
  scanForInternalDocNames,
  scanForIssueRefs,
  checkExclusionCoverage,
  scanForInternalPaths,
  checkVersionShape,
  checkPresence,
  checkBuyCta,
  scanForUnencodedCheckout,
} from '../scripts/leak-guard.mjs';
import { CHECKOUT_URL } from '../src/purchase.mjs';
import {
  EXCLUDED_PATHS,
  PROPRIETARY_MARKERS,
  excludedSlugs,
  excludedDirs,
  internalDocNames,
  internalPathPrefixes,
  publicDocEntry,
} from '../content-manifest.mjs';
import path from 'node:path';

const PRESERVED = new Set(['index.mdx', '.gitignore']);
const banned = new Set([...excludedSlugs(), ...excludedDirs().map((d) => path.basename(d))]);

test('checkManifest flags excluded and missing sources, accepts clean', () => {
  assert.ok(
    checkManifest(['docs/public/faq.md', 'docs/ci.md'], ['docs/ci.md'], () => true)
      .some((v) => v.includes('also excluded')),
  );
  assert.ok(
    checkManifest(['docs/public/faq.md'], ['docs/ci.md'], () => false).some((v) => v.includes('missing')),
  );
  assert.equal(checkManifest(['docs/public/faq.md'], ['docs/ci.md'], () => true).length, 0);
});

test('checkGeneratedTree rejects unexpected files, accepts approved + preserved', () => {
  assert.ok(
    checkGeneratedTree(['faq.md', 'ci.md'], ['faq'], PRESERVED).some((v) => v.includes('ci.md')),
  );
  assert.equal(
    checkGeneratedTree(['faq.md', 'index.mdx', '.gitignore'], ['faq'], PRESERVED).length,
    0,
  );
});

test('checkGeneratedTree requires exact set equality — flags a missing approved page', () => {
  assert.ok(
    checkGeneratedTree(['index.mdx', '.gitignore'], ['faq'], PRESERVED)
      .some((v) => v.includes('faq.md') && v.includes('missing')),
  );
});

test('scanTree flags excluded routes (top-level + nested) and excluded dirs', () => {
  assert.ok(scanTree([{ path: 'ci/index.html', text: '' }], PROPRIETARY_MARKERS, banned).length);
  assert.ok(
    scanTree([{ path: 'presentation/deck/index.html', text: '' }], PROPRIETARY_MARKERS, banned)
      .some((v) => v.includes('presentation')),
  );
  assert.ok(
    scanTree([{ path: 'entitlement.html', text: '' }], PROPRIETARY_MARKERS, banned).length,
  );
});

test('scanTree flags proprietary markers in non-HTML text assets, ignores binary', () => {
  assert.ok(
    scanTree(
      [{ path: '_astro/app.js', text: 'const x = "proprietary and confidential";' }],
      PROPRIETARY_MARKERS,
      banned,
    ).some((v) => v.includes('marker')),
  );
  assert.equal(
    scanTree([{ path: 'pagefind/x.pf_fragment', text: undefined }], PROPRIETARY_MARKERS, banned).length,
    0,
  );
});

test('scanTree flags an excluded name regardless of extension (ci.json, ci.md)', () => {
  assert.ok(
    scanTree([{ path: 'ci.json', text: '{}' }], PROPRIETARY_MARKERS, banned)
      .some((v) => v.includes('excluded path segment')),
  );
  assert.ok(
    scanTree([{ path: 'ci.md', text: 'x' }], PROPRIETARY_MARKERS, banned)
      .some((v) => v.includes('excluded path segment')),
  );
});

test('scanTree accepts a clean approved page', () => {
  assert.equal(
    scanTree(
      [{ path: 'faq/index.html', text: 'Documentation licensed under CC BY 4.0' }],
      PROPRIETARY_MARKERS,
      banned,
    ).length,
    0,
  );
});

test('scanForUnrewrittenMdLinks flags a surviving relative .md href, accepts a rewritten route', () => {
  assert.ok(
    scanForUnrewrittenMdLinks([
      { path: 'user-guide/index.html', text: 'See <a href="duo-protocol.md">docs</a>' },
    ]).some((v) => v.includes('duo-protocol.md')),
  );
  assert.equal(
    scanForUnrewrittenMdLinks([
      { path: 'faq/index.html', text: 'See <a href="/user-guide/">docs</a>' },
    ]).length,
    0,
  );
});

test('scanForUnrewrittenMdLinks accepts an absolute external .md URL', () => {
  assert.equal(
    scanForUnrewrittenMdLinks([
      {
        path: 'quickstart-baton-duo/index.html',
        text: 'See <a href="https://github.com/shukebeta/baton/blob/main/docs/service.md">docs</a>',
      },
    ]).length,
    0,
  );
});

test('checkPresence requires version badge and licence link on every page', () => {
  const needle = 'creativecommons.org/licenses/by/4.0';
  assert.equal(
    checkPresence(
      [{ path: 'faq/index.html', text: `v1.2.3 ${needle}` }],
      'v1.2.3',
      needle,
    ).length,
    0,
  );
  assert.equal(
    checkPresence([{ path: 'faq/index.html', text: 'nothing' }], 'v1.2.3', needle).length,
    2,
  );
});

test('checkPresence fails closed (does not skip) when version is empty', () => {
  const needle = 'creativecommons.org/licenses/by/4.0';
  const violations = checkPresence(
    [{ path: 'faq/index.html', text: `v1.2.3 ${needle}` }],
    '',
    needle,
  );
  assert.equal(violations.length, 2); // top-level "version missing" + per-page "unverifiable"
  assert.ok(violations.some((v) => v.includes('missing or empty')));
  assert.ok(violations.some((v) => v.includes('unverifiable')));
});

test('checkBuyCta requires the encoded checkout link on every page', () => {
  assert.equal(
    checkBuyCta([{ path: 'faq/index.html', text: `href="${CHECKOUT_URL}"` }]).length,
    0,
  );
  assert.equal(
    checkBuyCta([{ path: 'faq/index.html', text: 'header without the CTA' }]).length,
    1,
  );
  // The raw-bracket form of the same URL is not the URL: it does not satisfy the
  // presence check.
  assert.ok(
    checkBuyCta([{ path: 'faq/index.html', text: CHECKOUT_URL.replace('%5B', '[').replace('%5D', ']') }])[0].includes(
      'missing header Buy Now checkout link',
    ),
  );
});

test('scanForUnencodedCheckout flags a raw-bracket checkout query anywhere in dist', () => {
  assert.ok(
    scanForUnencodedCheckout([
      {
        path: 'faq/index.html',
        text: 'href="https://shukelabs.lemonsqueezy.com/checkout/buy/x?checkout[discount_code]=50OFF"',
      },
    ]).some((v) => v.includes('raw-bracket')),
  );
  assert.equal(
    scanForUnencodedCheckout([
      { path: 'faq/index.html', text: `<a href="${CHECKOUT_URL}">Buy Now</a>` },
      { path: 'index.html', text: 'plain store link https://shukelabs.lemonsqueezy.com stays unflagged' },
    ]).length,
    0,
  );
});

test('checkPublicDir flags an excluded or unpublished customer-facing doc', () => {
  assert.ok(
    checkPublicDir(['faq.md'], ['docs/public/faq.md'], ['docs/public/faq.md'], 'docs/public')
      .some((v) => v.includes('also excluded')),
  );
  assert.ok(
    checkPublicDir(['newpage.md'], ['docs/public/faq.md'], EXCLUDED_PATHS, 'docs/public')
      .some((v) => v.includes('not published')),
  );
  assert.equal(
    checkPublicDir(['faq.md', 'notes.txt'], ['docs/public/faq.md'], EXCLUDED_PATHS, 'docs/public')
      .length,
    0,
  );
});

test('scanForInternalDocNames flags an internal doc name on any customer page', () => {
  assert.ok(
    scanForInternalDocNames(
      [{ path: 'changelog/index.html', text: 'restructure install-topology.md on a spine' }],
      internalDocNames(),
    ).some((v) => v.includes('install-topology.md')),
  );
  assert.equal(
    scanForInternalDocNames(
      [{ path: 'faq/index.html', text: 'see the <a href="/user-guide/">user guide</a>' }],
      internalDocNames(),
    ).length,
    0,
  );
});

test('publicDocEntry requires a leading H1 even with a curated title override', () => {
  // `user-guide` HAS a PUBLIC_DOC_TITLES override; the override renames the
  // page for navigation and must not excuse an untitled source.
  assert.throws(
    () => publicDocEntry('user-guide.md', 'Body with no heading.\n'),
    /has no leading H1/,
  );
  assert.equal(publicDocEntry('user-guide.md', '# User Guide\n').title, 'User guide');
  // Without an override the H1 is the title.
  assert.equal(publicDocEntry('faq.md', '# FAQ\n').title, 'FAQ');
  assert.throws(() => publicDocEntry('faq.md', 'no heading\n'), /has no leading H1/);
});

test('checkExclusionCoverage requires every internal doc to be listed', () => {
  assert.ok(
    checkExclusionCoverage(['docs/ci.md', 'docs/newthing.md'], EXCLUDED_PATHS).some((v) =>
      v.includes('docs/newthing.md'),
    ),
  );
  assert.equal(checkExclusionCoverage(['docs/ci.md', 'docs/entitlement.md'], EXCLUDED_PATHS).length, 0);
  // The customer directory, docs covered by an excluded directory prefix, and
  // non-Markdown files are all outside the rule.
  assert.equal(
    checkExclusionCoverage(
      ['docs/public/faq.md', 'docs/rfcs/audit-agent-rfc.md', 'docs/notes.txt'],
      EXCLUDED_PATHS,
    ).length,
    0,
  );
  // A doc under a brand-new subdirectory has neither an exact entry nor a
  // prefix, so it is still caught.
  assert.ok(
    checkExclusionCoverage(['docs/notes/scratch.md'], EXCLUDED_PATHS).some((v) =>
      v.includes('docs/notes/scratch.md'),
    ),
  );
});

test('internalDocNames covers nested docs but never prompt-source basenames', () => {
  const names = internalDocNames();
  // Nested internal document, reached through the docs/rfcs/ prefix.
  assert.ok(names.includes('session-modes-rfc.md'));
  // Prompt sources under agents/ are NOT names: `dev.md` is what a customer
  // calls their own documented override file.
  assert.ok(!names.includes('dev.md'));
  assert.ok(!names.includes('SKILL.md'));
});

test('scanForInternalPaths flags internal paths, not customer override paths', () => {
  const prefixes = internalPathPrefixes();
  assert.ok(prefixes.includes('agents/'));
  assert.ok(
    scanForInternalPaths(
      [{ path: 'user-guide/index.html', text: 'see agents/shared/personality-dev.md' }],
      prefixes,
    ).some((v) => v.includes('agents/')),
  );
  assert.equal(
    scanForInternalPaths(
      [{ path: 'user-guide/index.html', text: 'write .my-ai-team/dev.md' }],
      prefixes,
    ).length,
    0,
  );
  // A customer path that merely contains the prefix as a substring.
  assert.equal(
    scanForInternalPaths(
      [{ path: 'user-guide/index.html', text: 'project .agents/skills is not an input' }],
      prefixes,
    ).length,
    0,
  );
  // A customer-owned directory ending in the same segment is not a violation.
  assert.equal(
    scanForInternalPaths(
      [{ path: 'user-guide/index.html', text: 'drop them in ~/.config/mat/skills/' }],
      prefixes,
    ).length,
    0,
  );
});

test('scanForInternalPaths covers the runtime trees but not customer bin paths', () => {
  const prefixes = internalPathPrefixes();
  assert.ok(prefixes.includes('bin/'));
  assert.ok(prefixes.includes('lib/'));
  for (const text of ['run bash bin/_mat', 'see lib/relay/summon.sh']) {
    assert.ok(
      scanForInternalPaths([{ path: 'user-guide/index.html', text }], prefixes).length > 0,
      text,
    );
  }
  // Both of these are real paths on the customer's machine that the guide has
  // to keep naming: the installed launcher symlink and a system bash.
  for (const text of [
    'check readlink -f ~/.local/bin/mat',
    'the POSIX /usr/bin/bash is treated as unset',
    'export PATH="$HOME/.local/bin:$PATH"',
  ]) {
    assert.equal(
      scanForInternalPaths([{ path: 'user-guide/index.html', text }], prefixes).length,
      0,
      text,
    );
  }
});

test('scanForIssueRefs flags every published reference form', () => {
  for (const text of [
    'bake its URL (#3629)',
    'docs(#778): a walk-through',
    'bake its URL (#3138 A2/A3)',
    'delivered in #1443 for Git Bash',
    'see #620 for the rationale',
  ]) {
    assert.equal(scanForIssueRefs([{ path: 'changelog/index.html', text }]).length, 1, text);
  }
  assert.equal(
    scanForIssueRefs([
      {
        path: 'faq/index.html',
        text: '<a id="install" href="#install">Install</a> costs $29 and uses #fff',
      },
    ]).length,
    0,
  );
  // Pane references and an illustrative issue number are legitimate content.
  assert.equal(
    scanForIssueRefs([
      {
        path: 'user-guide/index.html',
        text: '<code>#12 adhoc claude</code> and <code>issue #42: pytest hangs</code>',
      },
    ]).length,
    0,
  );
  // All-digit CSS hex colours from the inlined syntax-highlighting theme are
  // indistinguishable from an issue number except for the preceding colon.
  assert.equal(
    scanForIssueRefs([
      {
        path: 'examples/index.html',
        text: '<span style="--0:#D9F5DD;--1:#111111;color:#403">x</span>',
      },
    ]).length,
    0,
  );
});

test('checkVersionShape rejects git-describe and prerelease versions', () => {
  for (const bad of ['v3.13.13-2-g5bad266a', 'v0.1.0-beta', '5bad266a', 'latest']) {
    assert.equal(checkVersionShape(bad).length, 1, bad);
  }
  assert.equal(checkVersionShape('v3.14.2').length, 0);
  assert.equal(checkVersionShape('dev').length, 0);
  assert.equal(checkVersionShape('').length, 0); // checkPresence owns the empty case
});
