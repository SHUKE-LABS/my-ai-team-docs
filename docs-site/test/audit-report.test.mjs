import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildIssueBody, parseAuditJson } from '../scripts/audit-report.mjs';

const auditJson = JSON.stringify({
  advisories: {
    1243066: {
      id: 1243066,
      github_advisory_id: 'GHSA-mrhx-c7xc-m3w5',
      module_name: 'zod',
      vulnerable_versions: '<4.6.6',
      patched_versions: '>=4.6.6',
      severity: 'high',
      title: 'Zod can exhaust memory while validating oversized constrained collections',
      url: 'https://github.com/advisories/GHSA-mrhx-c7xc-m3w5',
      findings: [
        { version: '4.5.4', paths: ['.>@astrojs/starlight>astro>zod', '.>astro>zod'] },
      ],
    },
    1243478: {
      id: 1243478,
      github_advisory_id: 'GHSA-qrxm-fqhp-jwvm',
      module_name: 'undici',
      vulnerable_versions: '<7.30.1',
      patched_versions: '>=7.30.1',
      severity: 'high',
      title: 'undici leaks cookie headers across redirects',
      url: 'https://github.com/advisories/GHSA-qrxm-fqhp-jwvm',
      findings: [{ version: '7.29.1', paths: ['.>wrangler>miniflare>undici'] }],
    },
    1243479: {
      id: 1243479,
      github_advisory_id: 'GHSA-moderate-only',
      module_name: 'devalue',
      vulnerable_versions: '<5.9.3',
      patched_versions: '>=5.9.3',
      severity: 'moderate',
      title: 'A moderate advisory that must not be reported as high',
      url: 'https://github.com/advisories/GHSA-moderate-only',
      findings: [{ version: '5.9.2', paths: ['.>astro>devalue'] }],
    },
  },
  metadata: { vulnerabilities: { info: 0, low: 1, moderate: 11, high: 2, critical: 0 } },
});

test('the report names the high-severity advisories', () => {
  const body = buildIssueBody(auditJson);

  assert.match(body, /found 2 high-severity advisories/);
  assert.match(body, /GHSA-mrhx-c7xc-m3w5/);
  assert.match(body, /GHSA-qrxm-fqhp-jwvm/);
  assert.match(body, /`zod`/);
  assert.match(body, /`<4\.6\.6`/);
  assert.match(body, /`>=4\.6\.6`/);
  assert.match(body, /\.>@astrojs\/starlight>astro>zod/);
  assert.doesNotMatch(body, /GHSA-moderate-only/);
});

test('a report that cannot be parsed says so plainly', () => {
  const body = buildIssueBody('not json at all');

  assert.match(body, /could not be parsed/);
  assert.doesNotMatch(body, /GHSA-/);
});

test('a report without a high-severity advisory says so plainly', () => {
  const body = buildIssueBody(JSON.stringify({ advisories: {}, metadata: {} }));

  assert.match(body, /names no high-severity advisory/);
});

test('a progress line before the JSON does not break the report', () => {
  const body = buildIssueBody(`Lockfile is up to date\n${auditJson}\n`);

  assert.match(body, /found 2 high-severity advisories/);
  assert.match(body, /GHSA-mrhx-c7xc-m3w5/);
});

test('the parsed report keeps only high-severity advisories', () => {
  const parsed = parseAuditJson(auditJson);

  assert.equal(parsed.parsed, true);
  assert.deepEqual(
    parsed.advisories.map((advisory) => advisory.id),
    ['GHSA-qrxm-fqhp-jwvm', 'GHSA-mrhx-c7xc-m3w5'],
  );
  assert.deepEqual(parsed.metadata.vulnerabilities.high, 2);
});
