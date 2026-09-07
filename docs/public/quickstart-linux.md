# Linux quickstart (commercial customer)

Install the commercial release on Linux, activate it, connect Telegram, and
run your first agent. Every command is copy-pastable.

## 1. Prerequisites (apt)

Install the runtime dependencies:

```bash
sudo apt update
sudo apt install -y git bash tmux jq curl tar diffutils
```

These tools cover installation and the end-to-end path. `mat doctor`
([step 2](#verify-the-install-with-mat-doctor)) reports on every row after install:

| Tool | Needed for | Enforced by |
|------|-----------|-------------|
| `jq` | JSON config the runtime reads | `install.sh` fails fast if missing; `mat doctor` |
| `cmp` | guarded byte-for-byte configuration and prompt reconciliation | `diffutils`; `install.sh` fails fast if missing |
| `curl` | downloading the tarball and later `mat upgrade` | `install.sh` (fetch path); `mat doctor` |
| `tar` | extracting the release tarball | used during install |
| `tmux` | the whole framework runs in tmux panes | `install.sh` warns if missing; `mat doctor` |
| `git` | repo operations (`install.sh` does **not** check for it) | runtime; `mat doctor` |
| `bash` ≥ 4.3 | the interpreter (namerefs, `mapfile`); Ubuntu/Debian ship a new enough bash | runtime; `mat doctor` |

You also need:

- **`gh`** (GitHub CLI) — required for the issue/PR workflow. It ships from
  GitHub's own apt repository, not the default archive; follow
  [cli.github.com](https://cli.github.com) to add the repo, then
  `sudo apt install gh`.
- **A backend CLI** — one of `claude` (Claude Code), `codex`, `copilot`, `pi`, `opencode`, or `freebuff`.
  This quickstart assumes the default `claude` backend; see
  [First session](#5-first-session--verify-the-telegram-round-trip) for auth.

## 2. Obtain and install

Your LemonSqueezy purchase grants a downloadable product file — the release
tarball — plus a license key. Download the tarball, extract it, and run the
bundled installer (substitute your actual downloaded filename for
`mat.tar.gz`):

```bash
tar -xzf mat.tar.gz
cd my-ai-team
./install.sh
```

The tarball is `.git`-less with a baked `VERSION`, so `install.sh`
auto-detects a local-payload install — no flag required. It copies the runtime
into `~/.local/share/my-ai-team`, links commands into `~/.local/bin`, and (on
systemd hosts) installs the Telegram relay user service (or the OpenRC user
service on OpenRC hosts; see step 4). If
`~/.local/bin` is not on your `PATH`, the installer prints the export needed to
make `mat` discoverable and leaves your shell configuration unchanged.

When `~/.config/mat/backends.json` does not exist, the installer also writes a
minimal inspectable Claude registry with `default_effort` set to `high`. Existing
or migrated backend configuration is preserved.

The tarball is self-contained: it carries the runtime, the product skills, and
the relay service templates, and `install.sh` needs no network access.

### Verify the install with `mat doctor`

```bash
mat doctor
```

One read-only pass that names every unmet prerequisite at once — the tools from
step 1, `gh` authentication, `~/.local/bin` on `PATH` with the linked commands
resolving to this install, the resolved backend token, Telegram credentials, and
the relay unit. It exits non-zero if anything FAILs, and each FAIL line carries
the fix to run. It changes nothing and prints no secret value.

Right after install the backend-token, Telegram-credential, and relay-unit checks
are expected to FAIL — steps 3–5 below are what satisfy them. Re-run `mat doctor`
at the end; a clean `All checks passed.` means the machine is fully set up. For
the full check list and the `ok` / `warn` / `FAIL` vocabulary, see
[`mat doctor`](user-guide.md#mat-doctor) in the user guide.

### The one file mat manages

On every claude-kind launch, mat empties your personal `~/.claude/CLAUDE.md`.
Claude Code loads it into every session regardless of `CLAUDE_CONFIG_DIR`, so it
would otherwise be added to every agent's constitution:

- Nothing is deleted. The content moves to
  `~/.claude/CLAUDE.md.mat-backup-<UTC>`, with a `-N` counter appended rather than
  clobbering an existing backup, and the launching terminal prints the backup path.
- It runs on every launch, not just at install — if the file re-populates (a
  dotfiles run, a manual edit), it is moved aside again.
- Per-project `CLAUDE.md` files are untouched; only the one super-global file is.
- Your own non-mat `claude` sessions see the emptied file too; mat cannot keep it
  out of agent prompts and in yours at the same time.
- Use `~/.config/my-ai-team/<mode>.md` or a project-local
  `.my-ai-team/<mode>.md` for agent prompt customisation; see
  [Prompt overrides](user-guide.md#prompt-overrides).

## 3. Activate your license

```bash
mat activate <LICENSE_KEY>
```

`mat` runs immediately after install without activation, but only an activated
machine can `mat upgrade` later (step 6) — so activate now. `mat activate`
records the key and instance id in `~/.config/mat/license.conf`.

## 4. Bring up the Telegram loop

The Telegram relay is the remote-control channel: your replies route back into
the running agent's tmux pane, so you drive sessions from your phone.

**First, create the bot and set credentials.** Do this **before** the next
step — the relay refuses to start without a per-host token.

1. **Create the bot.** In Telegram, open a chat with
   [@BotFather](https://t.me/BotFather), send `/newbot`, and give it a display
   name plus a username ending in `bot`. BotFather replies with an HTTP API
   token in the form `123456:abc...` — copy it and treat it as a password.
2. **Wake the bot.** From the Telegram account you want the relay to message,
   open a chat with your new bot and send anything (`/start` is fine). Telegram
   only delivers updates from accounts that have contacted the bot first.
3. **Get your numeric chat id.** Open [@GetIDs Bot](https://t.me/getidsbot),
   send `/start`, and read the `Your ID` field — that value is your
   `TG_CHAT_ID`. Do not try to read it from `getUpdates`: once the relay is
   running it long-polls that endpoint continuously, so a manual call returns an
   empty result or `409 Conflict`.
4. **Derive `<HOST_KEY>`.** Run `hostname` on the mat host and replace every
   character outside `[A-Za-z0-9_]` with a single `_` — `XE-5CD423DJ98` becomes
   `XE_5CD423DJ98`, `my-laptop` becomes `my_laptop`. The per-host token is named
   after it, so one shared secret file can hold bots for several hosts.
5. **Append the credentials** to `~/.bashrc.secret` (append — do not overwrite):

   ```bash
   export TG_CHAT_ID="123456789"
   export TG_CHAT_TOKEN_XE_5CD423DJ98="123456:abc..."
   ```

6. **Verify the exports load.** `source ~/.bashrc.secret`, then echo both
   variables. An empty line means the file path is wrong or the export is
   malformed — fix it before continuing.


**Then verify the resident relay.** On Linux, `install.sh` already installed,
enabled, and started the `tg-relay` user service for you — you do not set it up
by hand. On a systemd host, confirm it is running:

```bash
systemctl --user status tg-relay   # expect: Active: active (running)
```

On an OpenRC host, use the user-service command instead:

```bash
rc-service --user tg-relay status   # expect: status: started
```

Within a few seconds the bot messages you `[tg-relay] active on <host>`. The
systemd install also enables linger automatically so the relay survives logout;
OpenRC keeps the user service enabled in the user's default runlevel. If the
service is not started, re-run `mat doctor` for the platform-specific fix. A
missing `TG_CHAT_TOKEN_<HOST_KEY>` is the usual credentials problem.

## 5. First session + verify the Telegram round-trip

Authenticate your backend once — two steps for the default `claude` backend:

```bash
claude setup-token                                    # prints a long-lived token
echo 'export CLAUDE_CODE_OAUTH_TOKEN=<paste-token>' >> ~/.bashrc.secret
```

The launcher sources `~/.bashrc.secret` and reads `CLAUDE_CODE_OAUTH_TOKEN`; a
tokenless Claude backend fails fast at launch. The installer has already written
the inspectable default `backends.json`; use it for multi-account or
third-party-endpoint changes, as described in
[Backend and user config](user-guide.md#backend-and-user-config).

Then launch an agent in any git repo:

```bash
cd ~/path/to/your/repo
adhoc
```

A new tmux session opens with the agent. Now verify the loop end-to-end:

1. From the Telegram account you wired up in step 4, send the bot a message.
2. Confirm it appears in the agent's tmux pane (prefixed `[relay]`).
3. Confirm the agent's reply comes back to you on Telegram.

A completed round-trip means install, activation, and the relay are all live.
Re-run `mat doctor` now: with the backend token, Telegram credentials, and relay
unit all in place, it should report `All checks passed.`

## 5a. Optional: keep the tmux server alive with no sessions

If a named `mat` server should survive a drop to zero sessions, tmux provides a
manual opt-in without a resident service:

```bash
tmux -L mat set-option -g exit-empty off
```

Pane and window IDs then grow until an operator runs
`tmux -L mat kill-server`; the next server starts with reset counters.

## 6. Upgrades

See whether a newer release is on offer, without installing anything:

```bash
mat upgrade --check
```

That prints your installed version alongside the offered one and stops. To
actually install it:

```bash
mat upgrade
```

`mat upgrade` reuses your stored key, installs only when a different version is
offered (`--force` reinstalls the current one), and restarts the relay so the
daemon picks up the new code. The license-gating Worker it contacts ships its
endpoint inside the release, so there is nothing for you to configure.
