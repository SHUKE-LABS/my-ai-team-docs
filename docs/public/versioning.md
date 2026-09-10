# Versioning policy

Release versions are cut **automatically and unattended** on every accepted
change. The version number follows the mechanical rule below, not semver's
human-defined major/minor meaning.

## The rule: version encodes cumulative feature count

`major * 100 + minor` equals the number of released features. Each released
change advances the version by exactly one step:

```
feature:  minor += 1;  major += minor / 100;  minor %= 100;  patch = 0
other:    patch += 1
```

- A feature advances the feature count by one; every 100 features carries into
  the major (the 100th feature lands as `x.0`).
- Every other change advances `patch` only; `major` and `minor` are left
  untouched. `patch` is uncapped — it counts non-feature releases since the last
  feature.
- The bump is fully automatic, monotonic, and has **no human gate**.

## Breaking changes get no special treatment

Breaking changes bump like any other feature; they do not force a major version.
`mat` treats the version as a numeric release identifier:

- `mat upgrade` compares the version string it is offered against the one you
  have installed; it does not parse semver precedence.
- Version ordering is numeric across the three components, regardless of what
  they signify.

Read the [Changelog](../../CHANGELOG.md) to know what a version actually
contains.

## Upgrade and rollback

```bash
mat upgrade                 # fetch and install the latest release
mat upgrade --check         # report only; change nothing
mat upgrade --list          # list the versions still available to you
mat upgrade --to v3.49.0    # install that specific version instead of the latest
mat --version               # the version currently installed
```

`mat upgrade` is in-place: it replaces the installed runtime under
`~/.local/share/my-ai-team/` and leaves your configuration and agent homes
untouched. Running agents keep the runtime they launched with — a new version
takes effect at the next session launch, so upgrade between cycles rather than
mid-cycle.

To roll back, run `mat upgrade --to <version>` with a version from
`mat upgrade --list`. It installs that exact release through the same verified,
in-place path a normal upgrade uses. Going back is always something you ask for:
`mat upgrade` on its own follows the latest release and never rolls you back on
its own.

`mat upgrade --list` reports what the release store still holds, newest first.
Older releases are pruned on a rolling basis, so the list is how far back you can
go — a version that is no longer held is refused and nothing is installed. If you
need to go back further than the list reaches, unpack the earlier release tarball
you were sent and run its `./install.sh` again; keeping the tarball of the
release you are running is still worth doing before you upgrade. Configuration is
forward- and backward-compatible within a major, so a rollback does not require
reverting config files.

If `mat upgrade` fails with:

```
released payload is missing a baked VERSION stamp; refusing to install
```

your installed installer predates the single-top-level-directory release
layout and cannot consume the tarball it just downloaded. `mat upgrade`
cannot recover itself — it is the failing channel — so recover manually:
download a current release tarball, then

```bash
tar xzf <tarball>
cd my-ai-team
./install.sh
```

This replaces the installer with a current one; every `mat upgrade` afterward
works normally again.

The [user guide](user-guide.md#upgrading) covers the upgrade flags in full.
