# User Guide

For installation, follow the [Linux](quickstart-linux.md) or
[macOS](quickstart-macos.md) quickstart. This guide covers configuration,
day-to-day commands, modes, Telegram control, and troubleshooting.

## Install

my-ai-team is distributed as a release tarball. After purchase you receive a
download link; unpack it anywhere and run its installer:

```bash
tar xzf my-ai-team-*.tar.gz
cd my-ai-team
./install.sh
```

The installer:

- copies a frozen runtime into `~/.local/share/my-ai-team`
- links the `mat` command and its helpers into `~/.local/bin`, pointing them at
  that frozen install root, and writes a version stamp you can print with
  `mat --version`
- writes **no** content under your personal `~/.claude`; each agent's home is
  built by the launcher on first launch, so nothing personal is rewritten
- on systemd hosts, installs and starts the Telegram relay service automatically
  (and restarts it on every later install so the running daemon picks up new
  code). Where no per-user service manager is reachable — some SSH and container
  hosts, and Windows Git Bash — it prints a note and skips the step; a failed
  service step never fails the install.

On the first interactive Linux or macOS install, it opens the platform
quickstart. Upgrades, reinstalls, and non-interactive installs skip it.

Set `AVAILABLE_AGENTS=claude,codex` before running `./install.sh` to provision
only selected backends. When `AVAILABLE_AGENTS` is unset, the installer scans for
existing backend config directories and provisions the ones it finds.

Agent homes are provisioned on first launch, not at install time, so an upgrade
takes effect the next time you start a session. Provisioning is idempotent and
self-repairing: it renders the role's prompt, writes the settings a long-running
unattended agent needs, installs mat's safety guards for backends that support
them, and marks the launched checkout trusted so the agent does not stop on a
trust prompt.

To upgrade later, run `mat upgrade` (see [Upgrading](#upgrading)); you can delete
the unpacked tarball directory once the install has completed.

## Backend and user config

`mat` reads optional user config from `${XDG_CONFIG_HOME:-~/.config}/mat/`.

- `backends.json` adds or overrides backend registry entries.
- `credentials.conf` lets two same-kind backends share one login.
- `user.conf` is a deprecated fallback for `MAT_DEFAULT_BACKEND` / `MAT_USER_NAME`.

Your default backend and display name are read from git config — the canonical
store:

```bash
git config --global mat.defaultBackend claude
git config --global mat.username "your name"
```

git config resolves system → global → local, so a per-repo override applies
inside that repo while global values apply everywhere else.

**The zero-config path.** The built-in registry contains a single Claude
backend. Run `claude setup-token`, export the result as `CLAUDE_CODE_OAUTH_TOKEN`
(mat sources `~/.bashrc.secret` at launch, so exporting it there is enough), and
you are ready — no `backends.json` required. Edit `backends.json` only for
multi-account setups, third-party endpoints, or other backend families.

A native Claude backend is token-auth only: with no token it fails fast at
launch rather than starting unauthenticated.

To reuse a multi-account setup, copy `examples/mat/backends.json` into
`~/.config/mat/backends.json` and trim the entries you do not want.
`examples/mat/user.conf` shows the supported `user.conf` exports.

### `backends.json` format

`backends.json` is a single object with a `backends` array. Each element is a
backend object:

```json
{
  "backends": [
    {
      "nickname": "ccw",
      "config_dir": "claudew",
      "auth_var": "CLAUDE_CODE_OAUTH_TOKEN_CCW",
      "prompt_file": "CLAUDE.md",
      "kind": "claude"
    },
    {
      "nickname": "ccd",
      "config_dir": "clauded",
      "auth_var": "DEEPSEEK_API_KEY",
      "prompt_file": "CLAUDE.md",
      "kind": "claude",
      "base_url_var": "DEEPSEEK_CLAUDE_BASE_URL"
    }
  ]
}
```

| Field | Meaning |
| --- | --- |
| `nickname` | Required. The CLI alias and the slot name used in commands and locks. |
| `config_dir` | Required. Home/config directory stem under `$HOME/.<config_dir>`. Kept independent from `nickname` on purpose. |
| `auth_var` | Optional. Name of the environment variable holding the auth token or API key. Omit it (or set `null`) when the backend uses its own login flow. A `claude` backend is token-auth only. |
| `prompt_file` | Required. Prompt filename written into that backend's home (`CLAUDE.md` for Claude, `AGENTS.md` for Codex, and so on). |
| `kind` | Required. Backend family: `claude`, `codex`, `copilot`, `pi`, `opencode`, `freebuff`, or `grok`. The family decides which modes a backend can run — see [the notes below](#opencode-workers) and each family's subsection. |
| `base_url_var` | Optional. Name of the environment variable whose value becomes the backend's API endpoint. Omit it for the default endpoint or a native login flow. |
| `base_url` | Optional literal endpoint for an explicit Codex or pi provider, or a Grok BYOK backend. Use `base_url` or `base_url_var`, not both. |
| `tier` | Optional. `strong` or `weak`. A `weak` backend is refused for `explore` and `audit` (those roles produce the tickets everyone else works from) but stays usable as a Developer under a strong reviewer. Defaults to `strong`. |
| `default_model` | Optional. Model applied at launch, passed through verbatim. Omit it to launch with the backend's default. |
| `default_effort` | Optional. Reasoning-effort level applied at launch. Omit it or set it to an empty string and effort falls back to `high`. On Claude, change it in-session with `/effort`. |
| `context_window_size` | Optional. Effective context window for auto-compaction: an integer (`250000`) or a `k`/`m` shorthand (`350k`, `1m`). Omit it and mat sets nothing. |

The auth and base-url variables name environment variables; mat reads their
values from `~/.bashrc.secret` when they are not already exported. mat records
the variable *name*, never the value.

A malformed backend object (a missing required field, an unsupported `kind`, an
invalid value) is warned about and skipped; the rest of the file still loads.
Invalid JSON, or a missing `backends` array, falls back to the built-in Claude
backend with a warning rather than aborting.

`MAT_USER_NAME` is rendered into prompt files anywhere `{{MAT_USER_NAME}}`
appears; when unset it falls back to `the user`.

### Codex backends

Codex has two credential modes:

- **Explicit provider.** An entry with any provider metadata (`base_url`,
  `base_url_var`, `model_provider`, `wire_api`) must be complete and uses a
  real role-local Codex config. Declare the key source and endpoint rather than
  putting the token in `backends.json`:

  ```json
  {
    "nickname": "codex-account-a",
    "config_dir": "codex-account-a",
    "auth_var": "CODEX_TOKEN_ACCOUNT_A",
    "base_url": "https://chatgpt.com/backend-api/codex",
    "prompt_file": "AGENTS.md",
    "kind": "codex",
    "model_provider": "codex-team"
  }
  ```

- **Personal-subscription legacy.** An entry with none of that metadata keeps
  Codex's own login: put `config.toml` in the backend's bare canonical home
  `~/.<config_dir>/`, and every role home links to it automatically. Add one
  entry per account to run multiple accounts.

Every Codex launch starts in Standard mode; `/fast on` inside a running session
switches that one session to Fast.

### pi workers

`pi` is a multi-provider AI coding assistant. Add a `kind: "pi"` entry:

```json
{ "nickname": "pi", "config_dir": "pi", "prompt_file": "SYSTEM.md", "kind": "pi" }
```

The `prompt_file` **must** be `SYSTEM.md` — pi loads its system prompt from that
filename and ignores any other.

pi backends have two credential modes:

- **Shared login (default).** An entry with no provider metadata links every
  role to the bare agent dir `~/.<config_dir>/agent`: log in once there (run
  pi with no role and use `/login`) and every pi role inherits that auth,
  model, and settings config.
- **Explicit provider.** An entry that declares any of `auth_var`, `base_url`,
  `base_url_var`, `model_provider`, or `wire_api` is provisioned per role
  instead. mat writes a role-local `models.json` when an endpoint is declared
  and detaches the shared `auth.json` link — an explicit entry gives up the
  shared `/login` auth set, while the shared settings file stays linked. The
  key is never written to disk or the command line: `models.json` stores only
  the `$VARIABLE` reference pi resolves at request time, and mat exports
  `auth_var` for it.

```json
{
  "nickname": "pi-proxy",
  "config_dir": "pi-proxy",
  "auth_var": "PI_PROXY_KEY",
  "base_url_var": "PI_PROXY_URL",
  "wire_api": "anthropic",
  "default_model": "myproxy/claude-sonnet-4-5",
  "prompt_file": "SYSTEM.md",
  "kind": "pi"
}
```

`wire_api` names the wire protocol, not the vendor: `anthropic` (Anthropic
Messages), `openai` (OpenAI Chat Completions — the format most
OpenAI-compatible proxies clone), `responses` (OpenAI Responses), or `google`
(Google Generative AI). When an endpoint is declared without `wire_api`, mat
defaults to `openai`. One provider per entry: `model_provider`, when set, and
the `provider/` prefix of `default_model` must agree — that agreement picks
the provider id written into `models.json`. `model_catalog_json` is not
supported for kind `pi`.

`default_model` and `default_effort` apply at launch like on any other backend:
the model forwards as `--model <provider/model-id>` (pass the model id exactly
as pi expects it, e.g. `deepseek/deepseek-v3`), and the effort forwards as
`--thinking <effort>` — always, falling back to `high` when `default_effort` is
unset. mat never passes `--provider` or an API key.

If pi is configured with an Anthropic-compatible provider, you can instead
register it as `kind: "claude"` with a `base_url_var` pointing at pi's endpoint —
no new config, reusing Claude's auth wiring.

### opencode workers

OpenCode workers are interactive-only. Register one with an API-key variable and
the nested prompt path OpenCode reads as its role instructions:

```json
{
  "nickname": "opencode",
  "config_dir": "opencode",
  "auth_var": "OPENCODE_API_KEY",
  "prompt_file": "config/opencode/AGENTS.md",
  "kind": "opencode",
  "default_model": "opencode/deepseek-v4-flash-free"
}
```

Each OpenCode role gets an isolated config tree, so its own config, skills, and
`AGENTS.md` stay per-role. mat writes the provider config with an env-backed key
and never puts the key on the command line. For an OpenAI-compatible BYOK
endpoint, add `base_url_var`:

```json
{
  "nickname": "opencode-byok",
  "config_dir": "opencode-byok",
  "auth_var": "OPENAI_API_KEY",
  "base_url_var": "OPENAI_BASE_URL",
  "prompt_file": "config/opencode/AGENTS.md",
  "kind": "opencode",
  "default_model": "opencode/my-model"
}
```

OpenCode has no write guard: the restricted modes (`explore`, `audit`, `review`)
continue after a warning that the agent has unrestricted write access, and the
headless delivery modes refuse an OpenCode backend outright. Keep OpenCode on
interactive modes, or leave worktree isolation on (the default) so a stray write
lands in a throwaway checkout rather than your main tree.

### freebuff workers

freebuff workers are interactive-only. Register one with:

```json
{
  "nickname": "freebuff",
  "config_dir": "freebuff",
  "auth_var": "-",
  "prompt_file": ".AGENTS.md",
  "kind": "freebuff",
  "tier": "strong"
}
```

The `prompt_file` **must** be `.AGENTS.md` — the leading dot is load-bearing;
freebuff reads a home-level dotfile and never a plain `AGENTS.md`. There is no
`auth_var`: authenticate each role once with an interactive `freebuff login`.

Three limits are worth knowing before you register one:

- **One active session per freebuff account.** Two panes on the same account
  evict each other — the later one takes over and the earlier stops responding.
  Running two freebuff roles at once needs two accounts.
- **No write guard.** Like OpenCode, freebuff runs restricted modes full-auto
  after a warning; keep it on interactive modes and leave worktree isolation on.
- **First launch downloads a ~140 MB binary** into each new role home.

freebuff's model catalog is re-tuned faster than a mat release, and a model can
be metered or closed for part of the day, so pin capability to the `tier` field
in `backends.json` rather than to a model name. Declare `weak` where the catalog
is limited — `explore` and `audit` gate on it.

### grok workers

Grok workers run the interactive Grok Build TUI. Register one with native
per-role login:

```json
{
  "nickname": "grok",
  "config_dir": "grok",
  "auth_var": null,
  "prompt_file": "AGENTS.md",
  "kind": "grok",
  "tier": "strong"
}
```

The equivalent compact registry entry is
`grok:grok:-:AGENTS.md:grok:-:strong`. Native login stores one identity in the
canonical `~/.grok/auth.json`; role homes link that file, so authenticate once
in the canonical Grok home rather than logging in separately for every role.

Grok supports three distinct authentication paths:

- Native login: omit `auth_var`, `base_url`, and `base_url_var` (or set
  `auth_var` to `null`).
- xAI API key: set `auth_var` to the key variable, such as `XAI_API_KEY`, and
  omit `base_url` and `base_url_var`.
- BYOK: set `auth_var` plus either a literal `base_url` or a `base_url_var`.
  mat exports both values as `XAI_API_KEY` and `GROK_MODELS_BASE_URL`.

For example, an xAI-key backend can use `"auth_var": "XAI_API_KEY"`; a BYOK
backend can use `"auth_var": "MY_GROK_KEY"` with either
`"base_url": "https://provider.example/v1"` or
`"base_url_var": "MY_GROK_BASE_URL"`.

Set `context_window_size` to configure Grok's auto-compaction window when
`default_model` is set. Grok applies the value to that selected model; without
`default_model`, mat leaves the native configuration unchanged.

The key and endpoint are read from the environment or `~/.bashrc.secret` when
needed and never appear on the command line. Ambient `XAI_API_KEY` and
`GROK_MODELS_BASE_URL` are scrubbed unless the backend declares the matching
path; a declared endpoint without a usable key, or an invalid endpoint, fails
closed rather than falling back to native login.

Grok workers serve both interactive sessions and the headless delivery modes
(the duo, team, and caucus baton relays). Headless grok turns are cold: each
turn runs on its own, with no session trail carried between turns, so a task
rebuilds context from the durable artifacts named in its prompt rather than
resuming an earlier conversation. Restricted interactive modes use a PreToolUse
write guard: tracked-file edits and delivery commands are refused, while
unrestricted roles keep their normal behavior. Each Grok role keeps mat's skills
in its own native skills directory, while Claude and Cursor compatibility scans
are disabled for the role so their operator-level instructions, skills, hooks,
and rules are not inherited.

### Light Anthropic gateway

Set the `MAT_ANTHROPIC_GATEWAY` environment variable to route native Claude
backends through a local companion gateway instead of talking to
`api.anthropic.com` directly. The gateway is a **separate companion service, not
bundled** with mat — this is only the integration point. Export it where the
launcher will see it (e.g. `~/.bashrc.secret`):

```text
export MAT_ANTHROPIC_GATEWAY=http://127.0.0.1:9949
```

Set it to the root origin of your gateway — no `/v1` or sub-path (Claude Code
appends `/v1/messages` itself).

- A backend with a `gateway_selector` field routes through the gateway (the
  selector is sent as the auth token, so a `base_url_var` on that backend is
  ignored). Point several workers at the same selector — most usefully the
  pooled `auto` selector — to let the gateway handle failover across them.
- A backend with a `base_url_var` and no `gateway_selector` ignores the gateway
  and uses its vendor endpoint directly.
- A backend with `auth_var: null` is selector-only: valid on the gateway path,
  and it fails fast at launch when the gateway is unset.

With the gateway unset, every backend behaves exactly as it does without this
feature.

`mat quota` (from your shell) and the agent statusline both read usage from the
gateway when it is active, printing per-window utilization and reset countdowns.
A gateway behind HTTP Basic auth is supported for Claude backends: declare the
credential in `user:pass` form as `MAT_ANTHROPIC_GATEWAY_BASIC_AUTH` next to the
gateway URL, and mat carries it through both the launch and the quota fetch
without ever placing it on a command line.

A Copilot backend cannot traverse a Basic-auth-protected gateway: the Copilot
CLI's BYOK provider has no custom-header channel to carry the edge credential,
so a Copilot pane on the gateway path fails fast at launch when
`MAT_ANTHROPIC_GATEWAY_BASIC_AUTH` is set instead of silently 401ing at the
edge. Relax the gateway edge to also accept Bearer selectors, or route the
Copilot backend outside that gateway.

## Configuration reference

These `mat.*` git-config keys show their environment aliases, purpose, and
defaults. Unless noted, Git resolves them from local to global configuration.

| Key | Env var | What it does | Default |
|-----|---------|--------------|---------|
| `mat.defaultBackend` | `MAT_DEFAULT_BACKEND` | Backend used when a command names none | claude |
| `mat.username` | `MAT_USER_NAME` | Your display name in prompts and notifications | — |
| `mat.enableWorktree` | `MAT_ENABLE_WORKTREE` (or `--worktree` / `--no-worktree`) | Run each mode in its own worktree | on |
| `mat.autoStart` | `-a` / `-n` flags | Start seeking work on launch | on |
| `mat.autoRefine` | `MAT_AUTO_REFINE` | Let a delivery agent refine an unpromoted backlog ticket when idle | on |
| `mat.autoNotifyUser` | `MAT_AUTO_NOTIFY_USER` | Emit the built-in PR/merge status notifications | on |
| `mat.verbose` | `MAT_VERBOSE` (or `--verbose`) | Show full per-step launch progress | off |
| `mat.driver` | `MAT_DRIVER` | Session driver: `tmux`, `local`, or `baton` | tmux |
| `mat.auditPollMinutes` | `MAT_AUDIT_POLL_MINUTES` | Audit broad-sweep interval, in minutes | 300 |
| `mat.personalPromptOverride` | — | Enable user-global prompt overrides (see [Prompt overrides](#prompt-overrides)) | off |
| `mat.personalSkillsOverride` | — | Let a personal skill override a product skill of the same name | off |
| `mat.stallWatchdog` | `MAT_STALL_WATCHDOG` | Nudge/escalate a stalled delivery turn | on |

Worktree selection has its own precedence: `MAT_ENABLE_WORKTREE` first (the
`--worktree` and `--no-worktree` flags set this value for that launch), then
`mat.enableWorktree` from local or global Git config, then the deprecated
per-mode key for `adhoc` or `explore`, and finally the default of on. The flag
therefore overrides an inherited environment value; this is the deliberate
exception to the table's usual Git configuration resolution.

Set a key locally for one repo (`git config --local mat.<key> <value>`) or
globally for the machine (`git config --global …`). The two override toggles
(`personalPromptOverride`, `personalSkillsOverride`) are git-config only — no env
var — so a stale environment value can never flip them.

## Your first project

1. `cd` into the repo you want to work on.
2. Start the relay session:

   ```bash
   team
   ```

The command is identical on Windows Git Bash. `team` derives the project identity
from the Git repository root; no project registration or name is required.

### Project naming

When a name *is* shown (session labels, worktree paths), mat uses lowercase
letters, digits, and `-`. It normalizes inputs like `my_project` to `my-project`.
Recommended names read like `my-project`, `customer-portal`, or `ops2`.

## Day-to-day commands

### The primary verbs

```bash
adhoc [-n] [--worktree|--no-worktree] [backend]
audit [--session] [backend]
team  [-n] [backends...]
explore [--worktree|--no-worktree] [backend]
live [--domain <name>] [backend]
duo [-n] [dev [reviewer]]
caucus [proposer [challenger]] [--topic-file <path>]
```

Run `adhoc`, `audit`, `team`, `duo`, and `caucus` from inside the repo you want
to work on. `explore` and `live` can run anywhere. `backend` defaults to your
`mat.defaultBackend`. `team` accepts 0–3 backends mapped to dev, plan, and
review in that order; `duo` accepts a dev and a reviewer.

Every mode launches its own tmux session, even when invoked from inside another
mat session. Reattach by rerunning the same command from the same repo, or
attach to the concrete session with `tmux -L mat attach -t <session>`. Stop one
by ending its agent or with `tmux -L mat kill-session -t <session>`.

**Auto-start** is the default: a fresh session claims work and begins on launch.
Pass `-n` / `--no-auto-start` to start cold and wake it later; `-a` /
`--autostart` forces it on for one launch. For a persistent opt-out, set
`git config --local mat.autoStart false`.

**Preview a launch** with `--dry-run` at any position — it prints what would be
spawned and exits without creating anything:

```bash
mat --dry-run duo
mat team --dry-run claude codex
```

### Status queries

Use these commands to inspect running sessions and their state:

```bash
mat agents        # every live agent session, grouped by project, with its state
mat agents --json # machine-readable: one JSON object per session
mat idle          # only the standby (idle) sessions
mat audit status  # audit poller, queue, and latest-wake diagnostics
```

Both `mat agents` and `mat idle` work outside a Git repository. Each row is
labelled by state:

- **standby** — idle with a poller available, waiting for ready work (shows a
  best-effort idle duration).
- **busy** — the agent is actively running a turn.
- **interactive** — an `explore` or `live` pane running a manual REPL, with no
  idle/busy claim.

If a supervised backend is exhausted or unusable before it can invoke its own
`/respawn`, an operator can request the same clean-slate boundary from any
shell by naming the session:

```bash
mat respawn <session>
```

This is available only for supervised `explore` and `adhoc` sessions. The
operator trigger validates the session state and published child pidfile,
writes the existing respawn sentinel, and then reaps the backend so the
supervisor launches a fresh child; it refuses `live`, `audit`, `team`, `duo`,
and `caucus` sessions. It also refuses the resident auto-refine worker
(`explore --auto-refine`) on every driver: that worker runs its own supervised
session with its own lifecycle, which this verb does not address. If the
backend reap cannot be arranged, the sentinel is removed without signaling the
backend, and the command returns non-zero.

A `team` (dev/plan/review) or `duo` (duo-dev/duo-review) session hosts several
supervised panes in one tmux session, so its respawn is per pane. Name the pane
with `--role`:

```bash
mat respawn <session> --role <role>
```

`<role>` is the supervisor role token — `dev`, `plan`, `review`, `duo-dev`, or
`duo-review` (not the `developer`/`reviewer` send-relay aliases). The trigger
rebirths only that pane: it writes the role's restart marker, reaps that pane's
backend, and confirms the supervisor has published a fresh child; the session's
other panes are untouched. The reborn pane comes back the way its role's cold
launch does — a coordinator (`plan`/`duo-dev`) self-driving, a passive pane
(`dev`/`review`/`duo-review`) idle — and reloads the currently installed runtime.
If the delayed reap cannot be arranged, the marker is removed without signaling
that pane's backend and the command returns non-zero.

`--role` is only for live `team`/`duo` sessions. It refuses an
`explore`/`adhoc`/`live`/`audit`/`caucus` session, a role outside the allowlist,
and a role with no live pane in that session (an already-down pane, or a role
that mode never runs — for example `--role dev` on a `duo` session). Each
refusal is non-zero with the reason on stderr and leaves every backend
untouched. If the reaped pane's supervisor does not republish a fresh child
within the verify window, the command fails loudly and leaves the marker and the
session event-log trail in place for manual recovery.

### Baton console

Baton sessions (`duo` and `caucus` on the baton driver) run headless, so there
is no tmux window to look at. The console is a web view of the same
information `mat baton status` prints, plus the relay timeline, a live tail of
each role, and the operator controls:

```bash
mat baton console              # serve on 127.0.0.1:7380 and open a browser
mat baton console --no-open    # print the URL only
mat baton console --port 7391  # pick another port
```

It needs Node.js 20 or newer on your `PATH`. If Node is missing or too old the
command prints a one-line hint and exits non-zero without starting a server.

The left rail lists every session `mat baton status` reports, grouped by
project, with its status, per-role queue depth, and how long ago its last
operator event was — `no events` for a session that has not had one yet.
Selecting a session shows its participants, a merged relay timeline — each message once, labelled with
its lane (pending, claimed, done, or outbox), with operator messages
highlighted and routine system wakes collapsed — and the controls below. When
a message is a handoff file reference, the console inlines the file's contents
(up to 64 KiB) if the file is still there and reports it as gone if it is not;
it will only read handoff files from the scratch directory, never an arbitrary
path a message names. New messages appear within a few seconds without a
reload.

Crashed and stale sessions are hidden until you turn on the dead-session
toggle.

Under the session header there is one column per configured role — two for a
duo or caucus session, three for a team. Each column tails what that role is
doing right now: its recent user and assistant turns, with every tool call
shown as a single line such as `Editing src/app.js`, `Reading README.md`,
`Running bash test/run.sh`, or `Searching TODO`. A tool the console does not
recognise is named outright (`Calling <tool>`), and a call it cannot describe
at all says `Unknown tool call running`. Tool inputs and outputs are never
shown — the one-line form is all a column carries. Columns update within a few
seconds of the role writing a new turn.

Not every backend records a transcript. A role that has none — a caucus role,
or a role that has not started one yet — says so and shows its latest sent
message plus the tail of its serve log instead of an empty panel. Every column
also has a *show stderr* toggle that swaps the turns for that role's own serve
log, which is where a backend that is failing to start says why.

When a role does have a transcript, its column carries a *Rewind* link that
opens that conversation in a local Rewind transcript viewer, assumed to be at
`http://localhost:7373`. Set `MAT_REWIND_URL` if yours listens elsewhere.
Clicking it checks whether Rewind is already running and starts it for you if
not, then opens the link once it answers; if Rewind never comes up, you get a
message telling you to start it yourself instead of a dead tab.

Some of this takes a moment, and the page says so rather than sitting still.
Picking a session shows its name and *Loading session…* until its detail
arrives — never the session you were looking at before — and a fetch that fails
says so in its place. A fleet refresh and a running action both show in the
status line at the top right, next to the live-connection state.

You can also intervene from the page. The composer sends a routed message to
one of the session's participants; *Inject to inbox* is a separate control
that bypasses topology routing and stays disabled until you acknowledge the
same unscoped-injection warning the CLI prints. The action bar offers wake,
restart, stop, and teardown: stop asks for a confirmation dialog, and teardown
asks you to type the session name. Every control runs the same `mat baton` verb
you would type in a terminal, and the verb's own output — including its
refusals, such as a caucus session refusing wake — is shown verbatim afterwards.

While a verb is running the controls are disabled and say which action it is;
one action runs at a time, and the console refuses a second one until the first
answers — including after you switch to another session, where the busy note
tells you which session is still working. Some verbs take minutes, so nothing
is lost by waiting; if the request never answers at all, that is reported in the
same place the verb's own output would have been.

The console is deliberately local: it binds the loopback interface only and
refuses requests that do not come from it. It never edits a session's state,
mailbox, or transcript itself — every session mutation is the existing verb,
which keeps writing the operator event trail. The one exception is the Rewind
link's own start-it-for-me step, which is not a session mutation at all.
Because it is unauthenticated, do not expose the port beyond your own machine.

### `mat backlog` — delivery queue view

`mat backlog` prints a read-only snapshot of open issues by lifecycle, followed
by open PRs. It never mutates anything; use `mat next-work` for work selection.

```bash
mat backlog                   # human-readable listing
mat backlog --json            # JSON object (repo, counts, issues[], prs[])
mat backlog ready             # show only the ready section
mat backlog --repo owner/name # override repo slug
```

Each issue lands in one bucket: `umbrella` (a tracker), `delivery` (claimed),
`refining`, `blocked`, `ready` (claimable now), `backlog`, or `other`. The
`ready` section is byte-identical to what `mat next-work` picks from.

### `mat doctor`

Use one read-only command to name every unmet prerequisite:

```bash
mat doctor
```

It checks, one report line each:

- `bash` ≥ 4.3, and `tmux` / `git` / `jq` / `curl` on `PATH`.
- `python3` and `PyYAML` (used by the GitHub issue helper), with a platform
  install hint when python3 is present but the `yaml` module is missing.
- `gh` present **and** authenticated — an unauthenticated `gh` otherwise shows
  up later as an agent dying on its first issue or PR call.
- The installed `gh` version against the floor the Reviewer's merge PR read
  needs (`>= 2.72.0`) — below it, a `warn` names the required version rather
  than letting the read fail as an unrelated-looking error.
- `~/.local/bin` on `PATH`, and every installed command resolving back to *this*
  install root — so a half-installed or stale link set is named.
- The installed version and activation state (no network; the license key is
  never printed).
- The resolved default backend: which registry entry is in effect and whether
  its auth actually resolves — a token variable, or [gateway
  routing](#light-anthropic-gateway).
- Telegram credentials and whether the relay service is loaded and active.
- The super-global `~/.claude/CLAUDE.md`: benign (absent or empty) or populated.
  See [the managed Claude file](quickstart-linux.md#the-one-file-mat-manages).
- On Windows Git Bash: the `bash.exe` mat exports so Claude Code picks the Bash
  tool, not PowerShell — see [Windows Git Bash: agents get the Bash tool, not
  PowerShell](#windows-git-bash-agents-get-the-bash-tool-not-powershell); whether
  the active `git` can honour the configured SSL backend — see [Windows: one Git
  for Git Bash and the MSYS2 shell](#windows-one-git-for-git-bash-and-the-msys2-shell);
  and whether `/tmp` resolves to one directory across bash, native tools, and the
  agent's Read/Write tools.

Three verdicts, one exit rule:

| Verdict | Meaning | Exit status |
|---------|---------|-------------|
| `ok` | the prerequisite is met | unaffected |
| `warn` | worth reading, not an unmet prerequisite (e.g. an unactivated install) | unaffected |
| `FAIL` | an unmet prerequisite, printed with a `fix:` line | non-zero |

`mat doctor` exits non-zero if **any** check FAILs and never stops at the first
failure, so it is safe as a script gate. It is strictly diagnostic: it creates
no session, writes no config, prints no secret value, and never remediates — each
FAIL line tells you the command to run yourself. No launch path gates on it.

### Worktree isolation

By default every worktree-creating mode — `adhoc`, `team`, `duo`, `audit`,
`explore`, `caucus` — runs in its own dedicated worktree or read-only snapshot,
isolating it from your main checkout. On a disk-constrained machine you can turn
this off for all of them at once:

```bash
git config --local  mat.enableWorktree false   # this repo
git config --global mat.enableWorktree false   # every repo on this machine
```

With worktrees disabled, the write-capable modes (`adhoc`/`team`/`duo`) share the
one main checkout, so mat refuses a second write-capable session against a repo
that already has a live one. Remove an inactive, clean worktree explicitly with
`mat remove-worktree <path>` (it refuses dirty worktrees and any path still used
by a live pane).

## Modes

Choose a mode that matches the work:

- **Team** and **Duo** — multi-agent issue-backed delivery with an independent
  reviewer gate.
- **Adhoc** — single-agent issue-backed delivery.
- **Explore** and **Audit** — investigation that produces tickets, not code.
- **Caucus** — a two-agent deliberation that converges a decision into tickets.
- **Live** — a hands-on single-agent session with no issue queue.

### Team mode

`team` is the 3-agent relay for issue-backed delivery in the current repo: a
planner, a dev, and an independent reviewer, each in its own pane. Only the
planner starts working on launch; the dev and reviewer panes start idle and wake
as work reaches them.

Each backend combination gets its own stable worktree, preserved when you close
the session and reused when you rerun the same `team …` command.

### Duo mode

`duo` is the 2-agent relay: a dev and an independent reviewer. It is the leaner
delivery loop when you do not need a separate planner — the dev plans and
implements, and the reviewer gates the plan and the implementation. Start it
with a dev and an optional reviewer backend:

```bash
duo                 # both roles on your default backend
duo claude codex    # dev on claude, reviewer on codex
```

Like `team`, `duo` runs issue-backed delivery in the current repo and keeps a
stable worktree per backend combination. See the [baton & duo
quickstart](quickstart-baton-duo.md) for a headless, tmux-free way to run it.

### Adhoc mode

`adhoc` is the single-agent delivery path: one agent claims a ticket, plans,
implements, opens the PR, and merges it. Name an existing `#N` on a direct turn
and adhoc handles only that issue; with auto-start it selects the next ready
ticket itself.

Each adhoc slot keeps a stable worktree, preserved for recovery when you close
the session and reused when you rerun the same repo and slot.

### Explore mode

`explore` is the open-ended investigation mode: it runs with or without a repo,
in its own dedicated home, and hands its findings off as tickets rather than
code. Explore-created tickets start in a `refining` state — re-read for missing
problem, approach, and acceptance detail before the session stops — and opening a
ticket ends the explore session instead of launching delivery.

Explore and Audit gather concrete source and runtime evidence, test the leading
conclusion, and report `confirmed`, `not confirmed`, or `insufficient evidence`
with a next action. They report findings; they never open a ticket themselves.

For a resident, repository-scoped explorer that walks the refining backlog on
its own, run `mat explore --auto-refine [backend]` (or `-a`). It launches a
fresh child per ticket, parks on relay wakes when idle, and never implements,
opens PRs, or merges.

Auto-refine runs under the baton driver too, and it is the one single-agent mode
that does: instead of a resident child in a pane, each ticket is refined over a
series of headless turns, every turn a whole process that starts and exits.
Continuity across those turns comes from the ticket's own conversation trail —
each turn resumes the previous one — rather than from a living child, so a turn
boundary is already a context boundary. Manual renewal (`/handover`,
`/respawn`) is therefore unavailable there: it refuses rather than restarting
the ticket. A ticket that never reaches an outcome is bounded by a per-ticket
turn budget; when the budget runs out the hold is released and the ticket is
left for the next pass. Set the budget with
`MAT_EXPLORE_AUTO_REFINE_MAX_TURNS`, and the per-turn time limit with
`MAT_EXPLORE_AUTO_REFINE_TURN_TIMEOUT`. Pick a backend whose CLI supports
headless turns; one that does not is refused at launch.

A headless refine pass can also stop and ask you something. When it does, you
get the usual notification, the worker stops taking turns, and it waits — it
will not carry on without your answer. Reply with:

```bash
mat baton send <session> explore "<your answer>"
```

Your text becomes the next turn, on the same ticket and with the same
conversation, so the pass picks up where it paused. The reply is only accepted
while that worker is running; if it has already exited, the command says so and
sends nothing.

### Audit mode

`audit` starts or reattaches a per-repo session in a dedicated worktree. Each
pass refreshes to the latest merged code and reviews it for quality problems,
filing tickets but never editing code, opening branches, or merging.

Audit runs on a cadence poller: after each pass it calls `start-audit-poll` and
waits, waking on a newly merged PR or on a periodic broad sweep (about every
5h by default; tune it per-repo with
`git config --local mat.auditPollMinutes <minutes>`). After five consecutive
cycles without a new merge, the poller becomes dormant: it stops broad-sweep
wakes but keeps watching the remote tip. A wake can file up to three quality-finding tickets and up to two CI-health tickets
(five total), then the session idles again. The auditor also watches the CI
surface and tickets red runs. Closing the session stops the pollers and
preserves the worktree for reuse.

`mat audit status` reports the poller state, queued-wake depth, current child
elapsed time, and the latest wake kind.

When a foreground (`mat.driver local`) audit's supervised child keeps running
while a wake is queued behind it, the framework escalates with
`notify-user --action`, naming the session, the child's elapsed time, and the
number of queued wakes. It never terminates the child on its own;
`mat audit status` shows the same stall. To recover, run
`mat audit revive <session>` — it re-checks the stall before reaping the
child, so it is a safe no-op when no stall is recorded.

Remote-tip/self-liveness heartbeat runs about every five minutes by default and
is tunable with `MAT_AUDIT_POLL_HEARTBEAT_MINUTES`. It independently checks
that the session is still alive and fetches the repository's remote tip without
waking an agent when nothing changed. When a merge is found, the session
refreshes its worktree and performs checkpoint reconciliation before the next
audit pass.

### Caucus mode

`caucus` starts a repo-scoped, 2-agent deliberation: a proposer and a challenger
converge one topic to a concrete conclusion, rendered as GitHub ticket(s) — no
delivery code. Each launch cuts a fresh read-only snapshot from the default
branch's tip and is deleted on session exit.

`caucus` always launches idle. Seed the opening topic by typing it into either
pane, or non-interactively with `caucus --topic-file <path>`. Alternatively,
`caucus --backfill` gives both agents a standing backlog-grooming duty and opens
immediately with no typed topic.

### Live mode

`live` starts a hands-on single-agent session and reattaches on later launches.
Unlike the delivery modes it has no issue queue, no reviewer, and no relay — it
is you and one agent working directly.

Live picks its own working posture and escalates it without asking:

- **direct** — hands-on in the current directory and branch: operational
  commands, testing, tracked-document updates, and other requested work,
  including edits on the default branch when the repository enforces no CI.
  It has no automatic branch, commit, PR, CI, or merge requirement.
- **patch** — for product-code delivery: it creates a task branch before tracked
  product-code edits (or any change to a repository that enforces CI), makes
  the change, validates, self-reviews, then makes one coherent commit
  with a clear message, pushes, and opens a PR. It merges only when the PR is
  mergeable and required CI is green. Missing or failing checks remain
  blockers: never merge around CI.

Live escalates to `patch` at the moment a tracked edit becomes necessary and
either the edit changes product code or the repository enforces CI, announcing
the switch rather than asking for it. Before substantial edits it records the
problem, investigation, and proposed solution; this is not an approval gate.

Live's one queue-like carve-out is issue *capture*: when it spots an incidental,
out-of-scope concern, it may open a `gh issue` to record it rather than dropping
it or scope-creeping. Capture only — live never implements the ticket it files.

Use `live --domain <name> claude` to attach a configured domain toolbox home
(its own `CLAUDE.md`, skills, and runbooks) while keeping the current repository
as the primary workspace. `--domain` is Claude-only and does not require any
extra consent gate; put domain-specific operating rules in the home repository's
own `CLAUDE.md`.

### Running a mode in the foreground

To run `explore`, `live`, or `audit` as a foreground process in the current
terminal without creating a tmux session, set
`git config [--local|--global] mat.driver local`. `mat.driver baton` runs those
same single-agent modes the same way, with one exception: the resident
auto-refine worker, which under baton has an engine of its own (see Explore
mode) and runs headless in the launching terminal. Only one foreground `audit`
runs per host at a time, and wakes are delivered into that terminal rather than
into a pane. If a later launch reports the singleton as already running and the
recorded supervisor's liveness is unprovable, `mat local-state clear <state-file>` clears
the state file named in that message; a proven-live supervisor is never
bypassed.

## Telegram relay

The Telegram relay lets you direct and answer your agents from your phone: every
agent notification arrives as a Telegram message, and your replies route straight
back to the exact agent that spoke.

### Enabling it

Follow your platform quickstart's Telegram step — it takes you from nothing to
`[tg-relay] active on <host>` arriving in Telegram. On Linux, the relay user
service is installed and started for you at install time: systemd is preferred,
with OpenRC user services used when no systemd user manager is reachable. The
reference below applies once the relay is running.

`mat doctor` reports whether your Telegram credentials are present and whether
the relay service is loaded and active.

### Managing the resident relay

`mat relay status | start | stop | restart` works the same way across every
platform (systemd, OpenRC, launchd, Windows) without needing to know which
service manager is in play:

```bash
mat relay status    # detected manager, verified process, singleton-lock state
mat relay start     # start the registered relay (fails closed if unregistered)
mat relay stop      # stop it; the registration itself stays in place
mat relay restart   # stop then start under one lock
```

`start`/`stop`/`restart` only ever act on a process it has freshly verified is
`tg-relay` — never a stale or recycled PID — and `stop` refuses to report
success while a relay you started by hand is still running outside the
manager's view, rather than silently leaving two pollers on the same bot
token. `start` refuses to launch an unregistered or out-of-date relay; re-run
`./install.sh` first if it does.

**One relay per bot token.** Telegram allows only ONE active long-poller per
token; a second relay (another host, a stray checkout, or a configured webhook)
makes both callers get HTTP `409` and your replies arrive late, out of order,
dropped, or duplicated. A same-host duplicate cannot start — it exits cleanly if
another relay already holds the lock — while a cross-host or webhook competitor
is surfaced as a throttled log line plus a one-shot ping. The fix is operator
action: ensure exactly one relay owns the token.

### Replying from Telegram

Every agent message is prefixed with its originating pane id and suffixed with a
single `(role - nick - project - host)` identity group, e.g.
`#5 hello (audit - cch - myproj - xps)`. To talk back to that exact agent, **reply** to
its message in Telegram — the relay routes your reply straight to that pane,
regardless of which project was last active.

After a successful reply, plain unprefixed follow-ups stay on that same pane. If
that pane has exited, the relay refuses the follow-up with recovery guidance
rather than sending it somewhere else. Re-target with `#<session>` or
`#<pane-number>`, or reply to a live agent message.

A team session announces its panes when it starts:

```
session #myproj_team_ccw started — dev %5, planner %6, reviewer %7
```

Reply to that start message to hand the team its first task (it lands on the
developer), or address a specific agent with its pane number, e.g. `#6 please
review the API design` to reach the planner.

Send `/agents` or `/idle` as a plain message to get the running-agents listing
back in Telegram without touching a pane.

When you are away and a directive arrives over Telegram, a routable mode (`team`,
`adhoc`, `audit`, `explore`, `live`) answers *over Telegram* — the substantive
reply comes back as a message, per follow-up, not into a pane you cannot see —
until you type into the pane directly or say you are back at the console.

If you reply to a message the relay can't place — a control message, or one that
has scrolled out of the index — it says so and asks you to re-send with an
explicit `#<session>` or `#<pane-number>` prefix rather than guessing.

### notify-user flags

Agents notify you with `notify-user`:

```bash
notify-user [--action|-a] [--message <text>] [--] "message"
```

The message body is normally positional (`notify-user "msg"`). `--action` / `-a`
marks a message that needs *you* to act. Every other `--*` token is rejected with
a usage error rather than being sent as text.

### The action-required marker

Most `notify-user` traffic is FYI — a PR opened, a cycle finished, a queue
idling. A few messages need *you*: a decision to make, a blocker to unblock, a
review only you can perform. Those carry a leading **`❗ACTION:`** marker, so you
can scan a stream of notifications and see at a glance which ones are waiting on
you. Reply to a marked message the same way you reply to any other — the marker
is a signal to you, not a change in routing.

## Advanced and customization

### Prompt overrides

You can replace the shipped prompt for a given mode with your own markdown file.

Resolution order:

1. Project override: `<project-root>/.my-ai-team/<mode>.md`
2. User-global override: `${XDG_CONFIG_HOME:-~/.config}/my-ai-team/<mode>.md` —
   **skipped unless `mat.personalPromptOverride=true`** (opt-in)
3. Shipped default: the `<mode>.md` prompt installed with mat

Supported mode filenames: `adhoc.md`, `dev.md`, `plan.md`, `review.md`,
`explore.md`, `audit.md`, `live.md`, `duo-dev.md`, `duo-review.md`,
`caucus-proposer.md`, `caucus-challenger.md`.

**Enabling user-global overrides.** The user-global (XDG) tier is off by default.
To activate it — so your hand-maintained copies under
`${XDG_CONFIG_HOME:-~/.config}/my-ai-team/` are used — set:

```bash
git config --global mat.personalPromptOverride true
```

**Drift warning:** a hand-maintained personal copy is not kept in sync
automatically — it drifts as my-ai-team ships prompt changes on upgrade,
producing hard-to-diagnose mismatches. Opt in only while you are actively
maintaining the copies. Project-local overrides (`.my-ai-team/<mode>.md`) are
unaffected by the toggle and always win.

The per-role personality hook (`shared/personality-<role>.md`, or
`shared/personality.md` for explore) is the exception: it stays overridable from
the user-global tier even when the toggle is off, because the built-in
personality files are empty hooks with nothing to drift from.

When an override is active, mat names it on the resolved launch line (the
`(personal override)` marker) so you can always tell which prompt is live.

### Skills overlay

Product skills are runtime-owned: the launcher builds each backend's skills
directory from the install on launch. To add personal, environment-specific
skills — internal DB-query or ticketing helpers that reference your own
infrastructure and do not belong in the product repo — drop them into an operator
skills overlay:

- **Source:** `${XDG_CONFIG_HOME:-~/.config}/mat/skills/`, one directory per
  skill. There is no configurable path.
- **Non-colliding skills are always provisioned** into every role home,
  regardless of any toggle — they carry no product-drift risk.
- **`mat.personalSkillsOverride`** — an opt-in git boolean, off by default —
  governs name collisions with a product skill. Off: the overlay skill is
  skipped and the product skill wins (the safe default). On: the overlay skill
  overrides the product one for that role.

  ```bash
  git config --global mat.personalSkillsOverride true
  ```

Adding, editing, or removing an overlay skill re-provisions role homes on the
next launch, and a collision prints one line naming the outcome so the resolution
is visible.

### bg-run — background commands

`bg-run` launches a long-running shell command, returns immediately, and delivers
milestone and completion notifications through the current turn's wake channel —
so an agent never blocks waiting for a slow build, test run, or deploy:

```bash
bg-run --cmd "make integration-tests" --milestones 15m,30m,45m --max 60m
```

Defaults are `--milestones 15m,30m,45m` and `--max 60m`; durations accept `s`,
`m`, or `h`. After launching, do useful work or end the turn and wait for the
wake — do not `sleep`, poll, or re-inspect status. The wake carries the
result-file path, and the persisted result JSON (task id, status, exit code,
elapsed time, and stdout/stderr tails) can be read when the completion wake
arrives.

**Failure diagnostics.** Wakes and results stay compact — they carry only a
short tail of each stream. When a task ends in any non-success terminal state
(`failed`, `timeout`, `cancelled`, or `aborted`), `bg-run` additionally
preserves the task's *full* stdout and stderr in local `0600` diagnostic files,
so you can read the actionable failure without rerunning the command. The result
and wake report seven extra fields for this:

- `stdout_log` / `stderr_log` — the diagnostic file path for each stream (empty
  unless the bytes were preserved).
- `stdout_log_state` / `stderr_log_state` — one of `closed` (full bytes
  preserved at the path), `absent` (the stream produced no output),
  `unreadable` (the source vanished or was only partially readable — a
  final state: the result still commits once, with an empty log path, and the
  raw provider output is kept until the retention lease), or `skipped` (a
  successful task — no diagnostic is written; success output is not preserved).
- `stdout_log_truncated` / `stderr_log_truncated` — `true` when a stream
  exceeded the per-stream byte cap and was head+tail truncated around an
  explicit marker, `false` otherwise.
- `log_max_bytes` — the per-stream cap in effect (default `10485760`, i.e.
  10 MiB; override with `BG_RUN_LOG_MAX_BYTES`, applied inclusively per stream).

Diagnostic files live under a private, per-user directory and share the result's
lifetime: they are removed only once the result ages past `BG_RUN_DEDUPE_LEASE`,
and `BG_RUN_DEDUPE_LEASE=0` keeps everything indefinitely. If a task is reclaimed
before it managed to publish a result, the diagnostics are materialized *before*
any raw source is deleted and re-anchored to the new result when one is finally
written; if the result write keeps failing, the raw source, diagnostic, and wake
are retained together while the publish is still retryable and removed together
only at the lease boundary. The full bytes always stay on the local host — only
the paths and the state fields above ever travel in a wake, result, or relay
payload.

**Session teardown.** When a session ends while one of its baton tasks is still
running, `bg-run` finalizes that task from the teardown itself rather than
leaving it orphaned: it stops the task and commits the durable result (and its
diagnostics) to the same result-file path the task was promised, so a later
reader finds the outcome where it was expected. Because the originating turn is
already gone, a teardown-finalized task records only the result — **no**
completion wake, envelope, or relay is sent. Two outcomes are distinct here:

- *The result commits, diagnostics may be `unreadable`.* If the diagnostic
  source cannot be read back at teardown, the result still commits **once**, with
  `stdout_log_state`/`stderr_log_state` of `unreadable` and an empty log path
  (the raw source is retained until the lease so the failure can still be
  investigated). The result file itself is there to read.
- *The result write itself fails.* If the result cannot be written at all (for
  example its path is briefly unwritable), there is **no** committed result. The
  task's retry state, raw source, and diagnostics — and any compact wake — are
  retained together for a later pass to finish, bounded by the same retention
  lease. Do not expect a result file for this task until that retry succeeds.

`bg-run` admits at most one in-flight task per (caller, command) pair: a second
submission of the same command returns the existing task rather than launching a
duplicate. A milestone or completion wake is evidence of an existing task — do
not resubmit the same command on a wake. Use `--retry` for a deliberate rerun.

`bg-run` is available on tmux and baton sessions, which have a wake channel. On a
headless local turn it is unavailable — use `nohup <command> >validation.log 2>&1
& disown` from a foreground call and confirm from the log instead.

To deliberately stop a task before it finishes, run `bg-run --cancel <task-id>`
(the task id from the original launch or a milestone wake, while the task is
still running). This delivers a `status: cancelled` completion wake instead of
waiting for the command to finish or `--max` to elapse; cancelling an unknown
or already-completed task id fails closed with a diagnostic and changes
nothing.

### Dispatch daemon

For always-on, hands-off delivery, a dispatch daemon can cold-launch or wake a
delivery session whenever a repo has claimable `ready` issues — no manual `duo` /
`team` required.

Watch one repo in the foreground:

```bash
dispatch-repo ~/projects/my-repo owner/my-repo --mode duo --interval 5
```

Watch many repos at once by listing them in
`${XDG_CONFIG_HOME:-~/.config}/mat/dispatch.json` and running `dispatch`:

```json
{
  "max_active_repos": 3,
  "repos": [
    { "repo": "owner/repo-a", "repo_root": "/home/user/projects/repo-a", "mode": "duo" },
    { "repo": "org/repo-b",  "repo_root": "/home/user/projects/repo-b",  "mode": "team",
      "backends": ["opus", "sonnet"] }
  ]
}
```

`max_active_repos` caps how many repos run at once (idle sessions are cheap and
do not count); repos over the cap are deferred and retried next tick. `dispatch`
validates the config before starting and exits non-zero on malformed JSON, a
missing `repo_root`, an unknown `mode`, or duplicate `repo`+`mode` pairs.

For a resident service instead of a foreground loop, register it with
`mat dispatch enable` (opt-in, never auto-enabled by the installer). Its verbs
are `watch`, `enable`, `disable`, `start`, `stop`, `status`, and `logs`.

Sessions the dispatcher owns that stay fully idle past a timeout (12 hours by
default) are archived and torn down automatically; a fresh session cold-launches
on the next tick that finds a `ready` issue. Sessions you started by hand are
never reaped.

## Troubleshooting

Start with [`mat doctor`](#mat-doctor); it names tools, `gh` auth, `PATH`/links,
backend token, Telegram credentials, and relay-unit failures in one read-only
pass.

**`mat` exits at once reporting that its launcher runtime is missing.**

- Check `readlink -f ~/.local/bin/mat` — it must resolve inside
  `~/.local/share/my-ai-team`.
- Re-run `./install.sh` from an unpacked release tarball to rebuild the install.

**`mat` starts on Windows Git Bash but a mode session fails immediately.**

- Check that `tmux` itself is installed and on `PATH`.
- Re-run `./install.sh` so `~/.local/bin/mat` points back at the launcher.

**`mat` reports that it cannot create a session temp directory.**

- Symptom: the launch stops with a `mat: cannot create session temp dir ...`
  diagnostic naming the directory and the filesystem reason.
- Cause: the per-user session-temp root is missing and cannot be created, or
  the launching user cannot write there. By default mat uses a private base
  under `${TMPDIR:-/tmp}/mat-sessions-<uid>` for the current user.
- Fix: make that root writable, or set `MAT_SESSION_TMP_DIR` to an absolute
  directory the launching user can create and write before launching again.

**`gh --body-file /tmp/x.md` fails with file-not-found even though `/tmp/x.md`
was just written.**

- Symptom: a Write tool creates `/tmp/x.md`, but `gh` cannot read it. On Windows
  Git Bash the MSYS `/tmp` mount maps to `%TEMP%`, while the Claude Write tool
  (native Node) resolves `/tmp` to `C:\tmp` — two different on-disk dirs for the
  same path. `mat doctor` reports this as a `tmp mount` FAIL on Windows.
- Fix: repoint the MSYS `/tmp` mount to a real NTFS dir so all three resolvers
  agree. Add one line to your per-user `fstab` (`<msys-prefix>/etc/fstab` or
  `%USERPROFILE%\.fstab`):

  ```
  C:/tmp /tmp ntfs binary,noacl,posix=0 0 0
  ```

  Create `C:/tmp` first if it doesn't exist. After this, `cygpath -w /tmp`
  returns `C:\tmp` and the Write/Read tools, bash, and `gh` all land on the same
  file.

### Windows Git Bash: agents get the Bash tool, not PowerShell

- Symptom: a launched agent runs its shell commands through PowerShell instead of
  bash. Prompts and skills that assume POSIX quoting, `$(...)`, and pipes behave
  differently, and the guards mat installs never fire.
- Cause: Claude Code enables its PowerShell tool by default on Windows Git Bash,
  alongside the Bash tool. Its startup probe can also miss a Git installed
  outside the standard locations — most commonly a scoop install under
  `~/scoop/apps/git/<ver>/` — so an agent may serve PowerShell even though Git
  Bash is available.
- What mat does: when a real `bash.exe` path is confirmed, it exports both
  `CLAUDE_CODE_GIT_BASH_PATH` and `CLAUDE_CODE_USE_POWERSHELL_TOOL=0` into every
  launched Claude agent. This selects the Bash tool deterministically, so the
  managed `matcher: "Bash"` hooks fire. If no Git Bash path is available, mat
  leaves the PowerShell setting untouched because disabling it would leave
  Claude without a shell tool. `mat doctor` reports the decision and path.
- Overrides: set `CLAUDE_CODE_USE_POWERSHELL_TOOL=1` to opt into PowerShell
  deliberately; mat then leaves the shell-tool choice alone. To keep Bash with
  a custom install, export `CLAUDE_CODE_GIT_BASH_PATH` yourself to a `bash.exe`
  that exists in Windows form (with a trailing `.exe`).

### Windows: Copilot-backed panes run shell commands through PowerShell

- Symptom: in a Copilot-backed session on Windows, the agent's shell commands
  run through PowerShell — there is no bash option in the Copilot CLI.
- What mat does: it routes Copilot's `powershell` tool calls through the same
  command guards as `bash`, so the delivery-command boundaries and destructive-command
  guards still apply on Windows. The guards scan command text with bash-syntax
  rules, so a delivery command written in PowerShell-only syntax (for example
  `$env:VAR = ...` rather than `export VAR=...`) may not be recognized — write
  shell commands in bash style even though PowerShell executes them.

### Windows: one Git for Git Bash and the MSYS2 shell

- Symptom, in either shell: `fatal: Unsupported SSL backend 'schannel'` on every
  HTTPS fetch, push, or clone — or, from a stale credential, GitHub's
  `remote: Repository not found` for a private repository the account can
  demonstrably read.
- Cause: Git for Windows and an MSYS2-native `git` package can both be installed,
  and Git Bash and the MSYS2 shell then resolve *different* `git.exe` while
  sharing one global `~/.gitconfig`. Git for Windows supports
  `http.sslbackend=schannel`; the MSYS2-native build links OpenSSL only and
  rejects that value. `mat doctor` reports the unsupported combination as a
  `git ssl` FAIL.
- The supported setup is **both shells resolving Git for Windows**, with the
  shared config selecting `schannel` plus exactly one credential helper.

Run in the **MSYS2 shell** only (Git Bash already resolves Git for Windows):

```bash
pacman -R git                                          # drop the MSYS2-native build
echo 'export PATH="/c/Program Files/Git/cmd:$PATH"' >> ~/.bashrc
exec bash -l                                           # reload PATH
```

Verify in **each shell** — both must print the same executable and a version
stamped `.windows.`:

```bash
type -a git
git --version        # expect: git version <x.y.z>.windows.<n>
```

Run once from **either shell** (`~/.gitconfig` is shared, so this configures
both):

```bash
git config --global http.sslbackend schannel
git config --global --unset-all credential.helper || true   # exit 5 = nothing configured
git config --global credential.helper manager
```

Certificate verification stays on throughout. `http.sslVerify=false` is never the
fix for this, and nothing in mat suggests it.

### Windows Git Bash: `cmp` installer prerequisite

`install.sh` needs `cmp` from the active shell. A Git for Windows `cmp.exe` does
not satisfy an MSYS2 shell if its directory is not on `PATH`; install the MSYS2
`diffutils` package there:

```bash
pacman -S diffutils
```

### tmux socket arbitration (Linux)

If tmux's socket file goes missing while its server keeps running — a crash that
skipped cleanup, or an `rm -rf /tmp` — the next `tmux new-session` can silently
fork a second, unreachable server at the same address, stranding the panes on
the original. On Linux, mat checks the resolved default socket before every
launch and, when it finds this data-loss state, tries to repair the original
server before refusing the launch. A refusal names the stale pid(s) and the
recovery: salvage anything needed from those panes, kill them, then relaunch. A
manually rebuilt session must keep its original name — relay routing keys off the
session name, not the pid. `mat doctor` surfaces the same classification.

### Optional tmux persistence

If a named `mat` server should survive a drop to zero sessions, opt in manually:

```bash
tmux -L mat set-option -g exit-empty off
```

This keeps the server alive without a resident session; run
`tmux -L mat kill-server` to reset it.

## Upgrading

```bash
mat upgrade [--list|--to <version>|--check|--force|--when-idle|--when-idle-unbounded|--override-locked]
mat upgrade --check       # report installed vs. offered version; change nothing
mat upgrade               # fetch and install the latest release for your license
mat upgrade --force       # reinstall even when already current
mat upgrade --list        # list the versions still available to your license
mat upgrade --to <ver>    # install that exact version instead of the latest
```

`mat upgrade` needs an activated machine (`mat activate <LICENSE_KEY>`, once per
host). It validates the license, fetches a signed release tarball, and installs
it in place over `~/.local/share/my-ai-team/`; your configuration and agent homes
are untouched. Plain `mat` and every mode invocation never touch the network.

Running agents keep the runtime they launched with, so upgrade between cycles. On
systemd and OpenRC hosts also restart the Telegram relay service so the daemon
runs the code you just deployed.

To roll back, pick a version from `mat upgrade --list` and install it with
`mat upgrade --to <version>`; it uses the same verified in-place path, and how
far back the list reaches is bounded by the release store's retention. Plain
`mat upgrade` always follows the latest release and never rolls back on its own.
Beyond what the list holds, unpack an earlier release tarball and run its
`./install.sh` again.
Before migrating a license to another machine, release this host's slot with
`mat license deactivate`.

On Windows, an in-place upgrade can hit files a running session still holds open.
`mat upgrade --when-idle` waits for running sessions to go quiet first (up to
five minutes; `--when-idle-unbounded` removes the ceiling). If a critical file is
still held, the install leaves a resumable journal and reports what it could not
replace. Retry when the host is idle, or use `--override-locked` when the failure
message suggests it and you deliberately accept a mixed runtime. In an interactive
terminal, the installer asks the equivalent yes/no question; `--override-locked`
accepts that decision without prompting. The upgrade continues with files it can
replace, while held files remain from the previous release. The new version is
recorded even though some files are still old.

After accepting a mixed runtime, a plain `mat upgrade` reports that the host is
already on the latest version and does nothing. Once every `mat` session on the
host has exited, run `mat upgrade --force` to restore a single-version install
root.

See [Versioning policy](versioning.md) for what a version number means and the
upgrade/rollback contract.
