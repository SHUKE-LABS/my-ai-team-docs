# my-ai-team-docs operator guide

This repository is the public publication target for the my-ai-team
documentation site at <https://mat-docs.shukelabs.com/>. It contains only the
curated public docs, the Astro/Starlight site, build verification, and the
metadata needed to publish them. The product source and private repository
history are not part of this checkout.

The docs and site materials are licensed under [CC BY 4.0](./LICENSE-DOCS).

## Public boundary

The tracked publication inputs are deliberately small:

- `docs/public/*.md` contains the customer-facing pages.
- `CHANGELOG.md` is a sanitized public release-history snapshot.
- `examples/mat/backends.json` and `examples/mat/user.conf` are the public
  configuration examples.
- The first product paragraph in the root `README.md`, before `## Install`,
  supplies the overview page.
- `docs-site/` contains the site implementation, manifest, tests, lockfile,
  and this operator guide.

The repository must not receive private product source, agent prompts, internal
documentation, credentials, or private Git history. The exclusion inventory in
`content-manifest.mjs` is retained as guard metadata: it supplies the forbidden
names and path prefixes used to verify the rendered boundary, not additional
content for publication.

## Projection contract

The private repository remains the source of truth during phase one. The
dependent projection slice is responsible for updating this repository with:

1. The approved Markdown pages under `docs/public/`.
2. A sanitized generated `CHANGELOG.md` with internal issue/PR references,
   internal document names, and internal source paths removed before commit.
3. The two approved configuration examples.
4. The public opening block of the root `README.md`, retaining the `## Install`
   boundary used by the overview sync.

The projection must not copy the private repository wholesale or add a private
checkout to any workflow. `scripts/sync-content.mjs` sanitizes the changelog
again while rendering, and `scripts/leak-guard.mjs` remains the final fail-closed
check, but source sanitization is still required because this repository is
public. New public pages need a deliberate sidebar entry in `astro.config.mjs`.

## Local development

```bash
cd docs-site
pnpm install
pnpm run dev
pnpm run build
pnpm run leak-guard:self-test
```

Requires Node 20+ and pnpm 11.11.0, as pinned by `package.json`; CI uses Node
22.19.0. The frozen
`pnpm-lock.yaml` and `pnpm-workspace.yaml` keep installation reproducible and
approve only the required dependency build step.

The bootstrap commit is tagged `v3.41.3`, so a checkout with fetched tags
renders a stable release badge. For a projected update, `DOCS_VERSION` may
override the tag, but it must match `vX.Y.Z`; invalid overrides fail the build.

## Verification and deployment

`.github/workflows/docs-deploy.yml` has no path filters: every pull request and
every push to `main` runs on `ubuntu-latest` and performs dependency
installation, the high-severity dependency audit, unit tests, the Astro build,
the postbuild leak guard, and the leak-guard self-test. Checkout uses full
history and tags (`fetch-depth: 0`, `fetch-tags: true`) so the stable badge is
available in both the PR lane and the main lane.

The deploy job runs only after verification succeeds and only for a push to the
trusted default branch `main`. It uploads `dist` to the existing Cloudflare
Pages project `mat-docs`, preserving `mat-docs.shukelabs.com`. It skips cleanly
until both repository secrets exist:

- `CLOUDFLARE_API_TOKEN` with Pages Edit permission.
- `CLOUDFLARE_ACCOUNT_ID` for the Pages account.

Those secrets are scoped to the deploy job, which is not created for fork pull
requests. Forks receive verification only and cannot receive deployment
credentials. Until the private repository's deployment cutover slice lands,
its existing workflow may also publish to `mat-docs`; operators should expect
last-write-wins on the shared Pages project during this interim.

## Licensing

`LICENSE-DOCS` covers the public docs and site materials in this repository.
No product source or separate software licence is included here.
