# Baton duo quickstart (headless, no tmux)

Run a **duo** session (Dev + Reviewer) headlessly through Baton on Linux or
Windows Git Bash. This page covers setup, unattended issue delivery, monitoring,
and operator steering without a tmux server.

## 1. Prerequisites

- **baton ≥ 0.2.0** (the `service` control plane). **0.3.0** adds Windows
  service/task ownership — use 0.3.0+ on Windows. Verify: `baton service
  status --control ~/.baton/service` parses without an unknown-command error.
- **mat installed** (`mat --version`) with at least one backend nickname
  registered in `~/.config/mat/backends.json` whose **kind has a headless
  adapter**. A kind without one is refused at launch, naming role + nick +
  kind, before any mailbox or worktree exists.
- **`gh` authenticated** to the repo you will run against.
- **The repo**: a normal clone with a default branch. File your work as
  issues in it (`mat issue create --repo <owner>/<name>`), ready them
  (`mat issue ready <N>`); duo works the ready list.

## 2. The supervisor: automatic, or once per host by hand

You do not need to start anything. When a launch finds no live service on the
resolved endpoint, `mat` registers `baton service run --control <control>` with
the host's per-user supervisor — systemd on Linux, launchd on macOS, or Task
Scheduler on Windows — waits up to the default 30 seconds for liveness, and
then submits the serves. The supervisor restarts after an unexpected exit and
survives re-login; `mat` does not own it as a background child.

The control directory is resolved from `MAT_BATON_CONTROL_DIR`, then
`git config mat.batonControlDir`, then `~/.baton/service`. The default needs no
extra config; an override gives the session a separate service endpoint.

**Opt out** with `MAT_BATON_SERVICE_AUTO_START=0` (or the broader
`MAT_INSTALL_SKIP_SYSTEMD=1`, which disables every host-supervisor
registration mat performs). Then a live service is a precondition, not a
fallback, and a launch without one fails fast and cleanly, creating nothing: the
error names the control path, tells you to start a supervisor with
`baton service run --control <control>`, and states that auto-start is disabled
by `MAT_BATON_SERVICE_AUTO_START=0`.

**Manual path.** If auto-start is disabled or no per-user supervisor is
available, start and inspect the service yourself:

```bash
baton service run --control ~/.baton/service &
baton service status --control ~/.baton/service
```

`service run` blocks forever. Keep it alive with your OS service manager; see
[baton's service docs](https://github.com/shukebeta/baton/blob/main/docs/service.md)
for systemd, launchd, and Windows setup. A manually started service is reused
by `mat` after its liveness is confirmed.

## 3. Launch the session

From inside the repo's working tree:

```bash
MAT_DRIVER=baton mat duo <dev-nick> <reviewer-nick>
```

(Or persist the driver for the repo: `git config mat.driver baton`, then a
bare `mat duo`.) The launch prints the two backends and the teardown command:

```
duo (baton) started.
dev - <dev>
reviewer - <reviewer>
teardown - "mat baton teardown <project>_duo_<dev>_<reviewer>"
```

The launch boots the Dev with a bootstrap kick; its first turn runs
`mat next-work` and claims the top ready issue on its own — no manual wake
needed for the first task.

## 4. Feed it work

File and ready issues as usual:

```bash
mat issue create --repo <owner>/<name> --title "…" --body-file <file>
mat issue ready <N> --repo <owner>/<name>
```

Within and between cycles, `mat` claims the issue, runs the plan and review
gate, implements the change, opens and merges the PR, closes the issue, and
picks up the next ready issue under your `gh` account. The resident poller
wakes the Dev between cycles; `mat baton stop` or `mat baton teardown` cancels
it. A failed poller leaves an `exit:` reason in its log and makes
`mat baton status` report the idle session as `stranded`.

Every merged cycle also leaves two fixed comments on the GitHub issue: an
issue-side structured review verdict naming the PR before merge, and an issue-side
`## Cycle done` naming the PR and server merge SHA after merge. Missing either
comment is a failed cycle signal; PR comments are not the durable destination.

## 5. Watch it run

```bash
mat agents                 # live sessions, kind + status (standby/busy/stranded/live)
mat baton status           # detailed read-only per-role health; add --json for automation
mat baton watch            # repaint the same health view every 2 seconds (TTY only)
mat baton show <session>   # backends, mailbox, worktree, serve sessions + pids
mat baton logs <session>   # one breadcrumb per operator action
```

`mat baton watch` is read-only and refreshes the same health view every two
seconds. It needs a TTY; use `--interval N` for a different positive interval.
`[!!]` marks a stranded, crashed, stale, or otherwise degraded session.
`Ctrl-C` exits cleanly. Use `mat baton status <session>` for one session and
`mat baton show <session>` for its worktree, mailbox, and current transcripts;
these status commands do not modify the session or query GitHub.

## 6. Intervene mid-run

The operator surface is `mat baton <verb> <session>` (interactive umbrella:
`mat baton manage`):

- **Steer a running cycle** — `mat baton send <session> dev "<instruction>"`.
  Use `--inbox` only for a wedged role when normal routing cannot deliver.
- **Reply from Telegram** — reply directly to a Baton-origin message such as
  `[baton:<session>:dev] ...`; the relay routes the reply to that role. A
  literal TUI command such as `/clear` is refused because Baton has no pane.
- **Rescue a role** — `mat baton restart <session>` re-arms both serves from
  the saved session state.
- **Stop or reap** — `mat baton stop <session>` (halts serves, keeps state)
  preserves state; `mat baton teardown <session>` stops the services and removes
  the session state, mailbox, and launch-created worktree. Neither command
  touches the repo root.
  Both fail closed: if a background task cannot be verified as finished, the
  command exits non-zero, says which task host it left running, and keeps that
  session's state, mailbox, and worktree so the task is not stranded. Re-run it
  once the task settles.

## 7. Known boundaries

- **Windows residue**: serve sessions replaced by `restart` linger in
  `baton service status` as `liveness: "unresolved"` (fail-closed — baton
  will neither clear nor signal what it cannot prove dead). Harmless; gone
  after teardown.

## Troubleshooting

### `bg-run` says it must run inside a baton-hosted role

`bg-run` is available only from a role that the Baton driver launched. It is
not available from an operator shell, even when that shell is open in the same
repository. Start the session with `mat duo` or `mat team` under
`MAT_DRIVER=baton` (or set the repository `mat.driver` to `baton`), then run
`bg-run` from the launched role.

### `bg-run` says the state file records no `task_host_session`

The session state is missing its `task_host_session`, the Baton task host
assigned to the running role. The state may predate task-host support or may
have lost that value. Run `mat baton restart <session>` to re-arm the session.
If the task host is still missing, run `mat baton teardown <session>` and
launch the session again.

## Related pages

- [Linux quickstart](quickstart-linux.md) / [macOS quickstart](quickstart-macos.md)
  — for the base install this guide assumes.
