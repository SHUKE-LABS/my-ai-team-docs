#!/usr/bin/env node
// Builds the tracking-issue body from the output of `pnpm audit --json`.
//
// The scheduled `Dependency audit` workflow (.github/workflows/docs-audit.yml)
// runs the audit outside the publication lane, so a high-severity advisory can
// no longer freeze publication. It reports the finding here instead: one
// tracking issue that names every advisory, updated by later failing runs.
//
// The report is a separate script so the reporting path is unit-testable and
// so the workflow does not carry parsing logic in YAML.
//
// Usage: node scripts/audit-report.mjs <audit.json>
// The body is printed to stdout; diagnostics go to stderr.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPORTED_SEVERITIES = ['high', 'critical'];

const WORKFLOW_PATH = '.github/workflows/docs-audit.yml';

function normalizeAdvisory(entry) {
  const findings = Array.isArray(entry.findings) ? entry.findings : [];
  const paths = [
    ...new Set(
      findings.flatMap((finding) => (Array.isArray(finding.paths) ? finding.paths : [])),
    ),
  ];
  return {
    id: entry.github_advisory_id || (entry.id === undefined ? 'unknown' : String(entry.id)),
    module: entry.module_name || 'unknown',
    vulnerable: entry.vulnerable_versions || 'unknown',
    patched: entry.patched_versions || 'unknown',
    severity: entry.severity || 'unknown',
    title: entry.title || 'unknown',
    url: entry.url || '',
    paths,
  };
}

// The audit prints JSON on stdout, but a progress or warning line can precede
// it, so the object is cut out of the text before it is parsed.
export function parseAuditJson(raw) {
  const text = String(raw ?? '').trim();
  if (!text) {
    return { parsed: false, advisories: [], metadata: null };
  }
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  const candidates = [];
  if (first !== -1 && last > first) {
    candidates.push(text.slice(first, last + 1));
  }
  candidates.push(text);
  for (const candidate of candidates) {
    let parsed;
    try {
      parsed = JSON.parse(candidate);
    } catch {
      continue;
    }
    if (!parsed || typeof parsed !== 'object') {
      continue;
    }
    const advisories = Object.values(parsed.advisories ?? {})
      .map(normalizeAdvisory)
      .filter((advisory) => REPORTED_SEVERITIES.includes(advisory.severity));
    return {
      parsed: true,
      advisories: advisories.sort((a, b) => a.module.localeCompare(b.module) || a.id.localeCompare(b.id)),
      metadata: parsed.metadata ?? null,
    };
  }
  return { parsed: false, advisories: [], metadata: null };
}

function advisorySection(advisory) {
  const heading = advisory.url
    ? `### [${advisory.id}](${advisory.url})`
    : `### ${advisory.id}`;
  const lines = [
    heading,
    '',
    `- Package: \`${advisory.module}\``,
    `- Vulnerable: \`${advisory.vulnerable}\` — patched: \`${advisory.patched}\``,
    `- Severity: \`${advisory.severity}\``,
    `- Title: ${advisory.title}`,
  ];
  if (advisory.paths.length > 0) {
    lines.push('- Affected paths:');
    for (const affectedPath of advisory.paths) {
      lines.push(`  - \`${affectedPath}\``);
    }
  }
  return lines.join('\n');
}

export function buildIssueBody(raw) {
  const { parsed, advisories, metadata } = parseAuditJson(raw);
  const footer = [
    '---',
    '',
    `_Opened by the \`Dependency audit\` workflow (\`${WORKFLOW_PATH}\`). Later failing runs comment on this issue instead of opening a second one; close it once the advisories are lifted._`,
  ];

  if (!parsed) {
    return [
      'The scheduled dependency audit failed, but its JSON report could not be parsed.',
      '',
      '`pnpm audit --audit-level=high --json` did not produce readable JSON, so no advisory could be named here. The raw output is in the workflow run log.',
      '',
      ...footer,
    ].join('\n');
  }

  if (advisories.length === 0) {
    const summary = metadata?.vulnerabilities
      ? ` The parsed report counts ${Object.entries(metadata.vulnerabilities)
          .map(([severity, count]) => `${count} ${severity}`)
          .join(', ')}.`
      : '';
    return [
      'The scheduled dependency audit failed, but the parsed report names no high-severity advisory.',
      `${summary} The raw output is in the workflow run log.`,
      '',
      ...footer,
    ].join('\n');
  }

  const count = advisories.length;
  return [
    `The scheduled dependency audit found ${count} high-severity ${count === 1 ? 'advisory' : 'advisories'}.`,
    '',
    '`pnpm audit --audit-level=high` failed on the frozen lockfile of `docs-site/`. The publication lane is not blocked by these advisories — this issue tracks them until the overrides in `docs-site/pnpm-workspace.yaml` are lifted to the patched floors.',
    '',
    '## Advisories',
    '',
    advisories.map(advisorySection).join('\n\n'),
    '',
    ...footer,
  ].join('\n');
}

function main(argv) {
  const source = argv[0];
  let raw = '';
  if (source) {
    try {
      raw = fs.readFileSync(path.resolve(source), 'utf8');
    } catch (error) {
      process.stderr.write(`audit-report: cannot read ${source}: ${error.message}\n`);
    }
  }
  process.stdout.write(`${buildIssueBody(raw)}\n`);
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  main(process.argv.slice(2));
}
