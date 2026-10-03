import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const requireFromAstro = createRequire(require.resolve('astro'));
const CachePolicy = requireFromAstro('http-cache-semantics');

const request = {
  url: 'https://example.test/account',
  method: 'GET',
  headers: {},
};
const maxStaleRequest = {
  ...request,
  headers: { 'cache-control': 'max-stale=86400' },
};

test('max-stale cannot override shared response reuse restrictions', () => {
  const date = new Date().toUTCString();
  const restrictedResponses = [
    {
      date,
      'cache-control': 'max-age=3600',
      'set-cookie': 'session=another-user',
    },
    { date, 'cache-control': 'max-age=3600, proxy-revalidate' },
    { date, 'cache-control': 'no-cache' },
  ];

  for (const headers of restrictedResponses) {
    const policy = new CachePolicy(request, { status: 200, headers }, { shared: true });

    assert.equal(policy.maxAge(), 0);
    assert.equal(
      policy.satisfiesWithoutRevalidation(maxStaleRequest),
      false,
      JSON.stringify(headers),
    );
  }
});

test('max-stale still reuses ordinary and explicitly shareable responses', () => {
  const date = new Date().toUTCString();
  const allowedResponses = [
    { date, 'cache-control': 'max-age=0' },
    {
      date,
      'cache-control': 'max-age=0, public',
      'set-cookie': 'session=explicitly-public',
    },
    {
      date,
      'cache-control': 'max-age=0, immutable',
      'set-cookie': 'session=explicitly-immutable',
    },
  ];

  for (const headers of allowedResponses) {
    const policy = new CachePolicy(request, { status: 200, headers }, { shared: true });

    assert.equal(
      policy.satisfiesWithoutRevalidation(maxStaleRequest),
      true,
      JSON.stringify(headers),
    );
  }
});
