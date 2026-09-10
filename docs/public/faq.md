# FAQ

Answers for evaluating and operating `my-ai-team`. Use the [user guide](user-guide.md)
for reference tasks, or follow the [Linux](quickstart-linux.md),
[macOS](quickstart-macos.md), or [WSL2](quickstart-wsl2.md) quickstart to
install it.

## What is my-ai-team?

`my-ai-team` runs structured AI-agent sessions against a GitHub repo. Agents
claim `ready` tickets, implement changes, open PRs, and merge them while you
set direction and intervene on decisions. The optional Telegram relay lets you
drive sessions remotely. See [the mode table](#what-are-the-modes-and-how-many-agents-does-each-use).

## How is it different from bare Claude Code (or hand-run agents)?

Bare Claude Code is a single interactive coding CLI. `my-ai-team` adds:

- **Async sessions** — drive and intervene remotely over Telegram.
- **Issue handoff** — agents pass work through GitHub issues and labels;
  claiming a ticket swaps `ready` for `assigned_to:<lock>`.
- **Role separation** — investigation, implementation, and review use separate
  modes and backend slots.

It runs *on top of* a backend CLI (`claude`, `codex`, `copilot`, `pi`, `opencode`, or `freebuff`) — it does
not replace one.

## Which platforms are supported?

| Platform | Support |
|----------|---------|
| Linux | Supported |
| macOS | Supported (bash ≥ 4.3 required — stock macOS bash is 3.2; install a newer one via Homebrew) |
| Windows Git Bash | Supported |
| WSL2 | Supported — installs like Linux; see the [WSL2 quickstart](quickstart-wsl2.md) |

Commercial install (the LemonSqueezy release tarball, first install and
`mat upgrade` alike) works on every supported platform above. The tarball ships
its symlinks resolved to file copies, so Windows Git Bash needs no elevation or
Developer Mode; a tarball built before that change is refused there fail-closed
rather than installed with paths missing. The `tg-relay` Telegram relay installs
automatically as a logon-triggered HKCU Run key entry on Windows Git Bash —
no manual restart required after reboot.

## Which backends and models does it use? Do I bring my own tokens?

You bring your own account and token/login. Supported CLIs are `claude`,
`codex`, `copilot`, `pi`, `opencode`, and `freebuff`; configure each backend in
`backends.json`. `default_model` and `default_effort` pass through to the
native CLI where supported; an omitted or empty effort defaults to `high` except
for `pi`.
See [Backend and user config](user-guide.md#backend-and-user-config) for the
per-kind table.

## What does it cost to run?

The license unlocks upgrades (see below). Beyond that, running cost is **your own
backend token spend** — the API/subscription usage of whichever backend account
you configure. `my-ai-team` adds no metered runtime fee of its own.

See the [SHUKE LABS store](https://shukelabs.lemonsqueezy.com) for price, seat,
and refund details.

## How does licensing work?

Licensing uses one honor-system LemonSqueezy **license key**. It is not DRM or
GitHub org membership. It unlocks **upgrades** but does not gate an
already-installed copy:

- `mat activate <LICENSE_KEY>` — activates the key on this machine and records it
  locally. Activating on more machines than the license's activation limit is
  rejected.
- `mat license deactivate` — releases this machine's activation slot for
  migration to another machine.

First install does **not** require activation; only an activated machine can run
`mat upgrade`.

## How do I upgrade or roll back?

- **Check:** `mat upgrade --check` prints installed and offered versions and
  changes nothing.
- **Upgrade:** `mat upgrade` installs the latest release for your stored license;
  an identical version is a no-op, while `mat upgrade --force` reinstalls it.
- **List:** `mat upgrade --list` prints the versions the release store still
  holds for your license, newest first, and installs nothing.
- **Roll back:** `mat upgrade --to <version>` installs that exact version through
  the same verified path as a normal upgrade. A downgrade is always something you
  ask for — plain `mat upgrade` follows the latest release and never rolls you
  back on its own. How far back you can go is bounded by the store's retention:
  a version that is no longer held is refused and nothing is installed. Beyond
  that, unpack the earlier release tarball and run its `./install.sh`.

## What is the privacy / phone-home posture?

Day-to-day runtime makes **zero network calls**:

- **Runtime never phones home.** Plain `mat` and mode invocations
  (`mat duo`, `mat adhoc`, …) work fully offline. License validation happens
  *only* at `mat upgrade` time.
- **License verbs** — `mat activate`, `mat upgrade` (including
  `mat upgrade --check`, `--list`, and `--to`), `mat license deactivate` — talk
  to LemonSqueezy and
  the release Worker, whose endpoint ships inside the release rather than as
  buyer configuration. That is the only outbound traffic the entitlement path
  makes. Update discovery is a verb you run, never a background poll.
- **The statusline** polls a usage-quota gateway **only when
  `MAT_GATEWAY_QUOTA_URL` is configured** (opt-in). With no gateway set, a
  native Anthropic backend (`ANTHROPIC_BASE_URL` unset or
  `https://api.anthropic.com`) omits the quota segment; third-party and other
  no-source backends render `n/a`. Neither path makes a usage-API call.

(Your configured backend CLI makes its own API calls to its own provider with
your token — that is the backend's traffic, not the framework's.)

## Does mat touch files outside its own directories?

One: your personal `~/.claude/CLAUDE.md`. On every claude-kind launch mat moves
its content to a backup and leaves the file empty.

Claude Code loads this file into every session regardless of `CLAUDE_CONFIG_DIR`,
so it would otherwise be added to every agent's constitution.

**What happens to your content.** Nothing is deleted. It is moved to
`~/.claude/CLAUDE.md.mat-backup-<UTC>` before the file is truncated; if a backup
with that name already exists, a `-N` counter is appended, so an earlier backup is
never clobbered. The terminal you ran `mat <mode>` in prints the backup path when
this happens. Restore it with `mv` whenever you want it back — mat will move it
aside again on the next claude-kind launch.

Only that file is affected. Per-project `CLAUDE.md` files and per-role homes are
untouched; non-Claude launches and `mat --dry-run` do not touch it.

**Where personal instructions belong instead.** Not in this file — it is emptied on
every launch, and your own non-mat `claude` sessions read the emptied copy too. To
customise what mat's agents read, use the prompt-override tiers:
`~/.config/my-ai-team/<mode>.md` for a personal role prompt, or a project-local
`.my-ai-team/<mode>.md` for a repo-scoped one. Precedence and the per-fragment
override rules are in the user guide's
[Prompt overrides](user-guide.md#prompt-overrides) section.

## Where do mat's agent homes live?

Every mat-managed role home lives under `~/.mat-agent-home/`. Your canonical
backend homes (`~/.claude`, `~/.codex`, `~/.copilot`, `~/.pi/agent`, `~/.grok`) are not moved;
role homes link credentials from them.

Older installations may have homes at top-level paths such as `~/.claude-dev`.
The first launch migrates such a home under the root and leaves a symlink at the
old path. It never merges, overwrites, or deletes an existing destination.

If a launch is killed mid-migration, the data remains at the new path and the next
launch uses it directly. Recreate the old link only if another tool needs it, e.g.
`ln -s ~/.mat-agent-home/claude-dev ~/.claude-dev`.

On Windows, an open legacy tree can prevent the move. Stop the process holding it
and relaunch; if it remains locked, mat copies the tree under the root and leaves
the old tree in place for manual cleanup.

## What are the modes, and how many agents does each use?

| Mode | Agents | Role |
|------|--------|------|
| `explore` | 1 | investigate a question, file a ticket (runtime read-only when the backend kind provides `role_guard`; guardless restricted kinds warn and run full-auto) |
| `caucus` | 2 | proposer + challenger deliberate a topic into ticket(s) |
| `audit` | 1 | self-arming cadence audit of merged work, files triage tickets |
| `live` | 1 | `/live` selects direct current-branch work or patch delivery |
| `adhoc` | 1 | claim ticket → implement → PR → merge → notify |
| `duo` | 2 | dev (plan+implement) → independent reviewer |
| `team` | 3 | planner → dev → reviewer |

See the user guide for per-mode details.

`explore` is runtime read-only only when the selected backend kind provides
`role_guard`: those guards block tracked-file edits and delivery commands. A
restricted backend kind without that guard, such as OpenCode, warns at
admission and continues full-auto with unrestricted write access. See
[Explore mode](user-guide.md#explore-mode) and the [OpenCode
backend documentation](user-guide.md#opencode-workers) for the full boundaries.

## How do I install and get to a first session?

Follow the OS quickstart end-to-end — install → `mat activate` → Telegram loop →
first session + verify:

- [Linux quickstart](quickstart-linux.md)
- [macOS quickstart](quickstart-macos.md)
- [WSL2 quickstart](quickstart-wsl2.md) (Windows Subsystem for Linux 2)

To run a headless duo session (no tmux) once installed, see the
[baton duo quickstart](quickstart-baton-duo.md).

## What are the common gotchas?

See the [Troubleshooting section of the user guide](user-guide.md#troubleshooting)
— `mat`/tmux launcher resolution, Git Bash `/tmp` handoff, Git Bash Bash-tool
selection (agents getting PowerShell instead of bash), and licensed-upgrade
issues are all covered there.

On Windows Git Bash specifically: Claude Code enables the PowerShell tool by
default alongside Bash, and its probe can miss a Git installed elsewhere (e.g.
via scoop). Without an explicit opt-out, every launched agent may then run
under `pwsh` — breaking POSIX prompts and silently disabling the
`matcher: "Bash"` PreToolUse hooks. When a Git Bash path is confirmed, mat
exports both `CLAUDE_CODE_GIT_BASH_PATH` and
`CLAUDE_CODE_USE_POWERSHELL_TOOL=0`; `mat doctor` reports that decision and the
resolved path. See
[Windows Git Bash: agents get the Bash tool, not PowerShell](user-guide.md#windows-git-bash-agents-get-the-bash-tool-not-powershell)
for the override (`CLAUDE_CODE_USE_POWERSHELL_TOOL=1`) and the manual
`CLAUDE_CODE_GIT_BASH_PATH` option. If no Git Bash path is available, mat leaves
the PowerShell setting untouched so Claude still has a shell tool.

If Git Bash and the MSYS2 shell are both in use, they must resolve the *same*
Git for Windows executable: they share one `~/.gitconfig`, and an MSYS2-native
`git` rejects the `http.sslbackend=schannel` that Git for Windows needs. See
[Windows: one Git for Git Bash and the MSYS2 shell](user-guide.md#windows-one-git-for-git-bash-and-the-msys2-shell)
for the PATH, verification, and credential-helper commands; `mat doctor` reports
the unsupported combination.

## Where do I ask questions or get help?

The community GitHub Discussions board:
<https://github.com/SHUKE-LABS/my-ai-team-community/discussions>
