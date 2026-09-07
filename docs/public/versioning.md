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
mat upgrade            # fetch and install the latest release
mat upgrade --check    # report only; change nothing
mat --version          # the version currently installed
```

`mat upgrade` is in-place: it replaces the installed runtime under
`~/.local/share/my-ai-team/` and leaves your configuration and agent homes
untouched. Running agents keep the runtime they launched with — a new version
takes effect at the next session launch, so upgrade between cycles rather than
mid-cycle.

To roll back, unpack the earlier release tarball you were sent and run its
`./install.sh` again; keep the tarball of the release you are running before
upgrading, since that copy is the rollback path. Configuration is forward- and
backward-compatible within a major, so a rollback does not require reverting
config files.

The [user guide](user-guide.md#upgrading) covers the upgrade flags in full.
