# macOS quickstart (commercial customer)

Install the commercial release on macOS, activate it, connect Telegram, and run
your first agent. Every command is copy-pastable.

The resident relay is managed for you on macOS: `install.sh` registers it as a
login-time background service automatically. Step 4 only wires up the Telegram
credentials the relay needs — there is no service file to write by hand.

## 1. Prerequisites (Homebrew) — bash first

The headline macOS gotcha: stock macOS ships **bash 3.2** as `/bin/bash`, but
the framework requires **bash ≥ 4.3**. Fix this **before** anything else —
`./install.sh` itself only runs under bash ≥ 4.3. Run it under stock bash 3.2
and it fails fast with `mat: requires bash >= 4.3; found <v>` and a
`brew install bash` hint, changing nothing on disk.

Install [Homebrew](https://brew.sh) if you don't have it, then install a modern
bash and make it your interpreter:

```bash
brew install bash
sudo sh -c "echo $(brew --prefix)/bin/bash >> /etc/shells"
chsh -s "$(brew --prefix)/bin/bash"
```

`brew --prefix` resolves to `/opt/homebrew` on Apple Silicon and `/usr/local`
on Intel, so the commands above are correct on both. `chsh` makes the new bash
your login shell (and therefore the shell tmux panes run); open a new terminal
tab afterwards and confirm:

```bash
echo "$BASH_VERSION"   # expect 5.x, not 3.2
```

Then install the rest of the runtime set:

```bash
brew install git tmux jq gh
```

These tools cover installation and the end-to-end path. `install.sh` hard-checks
`jq` and soft-warns for missing `tmux` (`check_dependencies` in `install.sh`);
the other tools are used by the install or runtime but not guarded, so they are
listed here regardless —
`mat doctor` ([step 2](#verify-the-install-with-mat-doctor)) reports on every one
after install:

| Tool | Needed for | On macOS |
|------|-----------|----------|
| `bash` ≥ 4.3 | the interpreter (namerefs, `mapfile`) | **brew** — system bash is 3.2 |
| `jq` | JSON config the runtime reads | **brew** — `install.sh` fails fast if missing |
| `cmp` | guarded byte-for-byte configuration and prompt reconciliation | macOS `/usr/bin/cmp`; `install.sh` fails fast if missing |
| `tmux` | the whole framework runs in tmux panes | **brew**; `install.sh` warns if missing |
| `git` | repo operations (`install.sh` does **not** check for it, but the runtime needs it) | preinstalled with Xcode Command Line Tools; brew installs a newer one |
| `curl` | downloading the tarball and later `mat upgrade` | preinstalled |
| `tar` | extracting the release tarball | preinstalled (BSD tar reads `.tar.gz`) |

You also need:

- **`gh`** (GitHub CLI) — required for the issue/PR workflow (`brew install gh`,
  included above).
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
into `~/.local/share/my-ai-team` and links commands into `~/.local/bin`. If
`~/.local/bin` is not on your `PATH`, the installer prints the export needed to
make `mat` discoverable and leaves your shell configuration unchanged.

When `~/.config/mat/backends.json` does not exist, the installer also writes a
minimal inspectable Claude registry with `default_effort` set to `high`. Existing
or migrated backend configuration is preserved.

Like Linux, `install.sh` brings up the resident relay automatically — on macOS
it renders the bundled launchd LaunchAgent and `launchctl bootstrap`s it. If the
install runs with no reachable gui/login session (e.g. over SSH), it skips
cleanly and the first `adhoc`/`team`/`duo` launch in your gui session self-heals
it. Either way there is no manual `launchctl` step; step 4 only supplies the
Telegram credentials.

The tarball is self-contained: it carries the runtime, the product skills, and
the relay service templates, and `install.sh` needs no network access.

### Verify the install with `mat doctor`

```bash
mat doctor
```

One read-only pass that names every unmet prerequisite at once — the tools from
step 1 (including the bash ≥ 4.3 floor, so a shell that is still stock 3.2 is
named here), `gh` authentication, `~/.local/bin` on `PATH` with the linked
commands resolving to this install, the resolved backend token, Telegram
credentials, and the launchd relay agent. It exits non-zero if anything FAILs,
and each FAIL line carries the fix to run. It changes nothing and prints no
secret value.

Right after install the backend-token, Telegram-credential, and relay-agent
checks are expected to FAIL — steps 3–5 below are what satisfy them. Re-run
`mat doctor` at the end; a clean `All checks passed.` means the machine is fully
set up. On a host with no reachable gui/login session the relay-agent check is a
`warn`, not a FAIL, matching the install's own skip behaviour. For the full check
list and the `ok` / `warn` / `FAIL` vocabulary, see
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

## 4. Bring up the Telegram loop — resident relay via launchd

The Telegram relay is the remote-control channel: your replies route back into
the running agent's tmux pane, so you drive sessions from your phone.

`install.sh` already rendered and `launchctl bootstrap`ed the LaunchAgent
`~/Library/LaunchAgents/com.my-ai-team.tg-relay.plist` — the Darwin analog of
the Linux relay service. All that remains is to hand it your Telegram
credentials; it self-recovers onto them within seconds. (If the
install ran with no gui session — e.g. over SSH — the first `adhoc`/`team`/`duo`
launch in your desktop session materializes and bootstraps it instead.)

### 4a. Create the bot and set credentials

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

The relay sources `~/.bashrc.secret` on every (re)start and refuses to start
without a per-host token, so once the exports are in place, restart it to pick
them up:

```bash
launchctl kickstart -k gui/$(id -u)/com.my-ai-team.tg-relay
```

launchd's `KeepAlive` also respawns the relay automatically within ~10s, so it
recovers onto the new credentials even without the explicit kickstart.

### 4b. Verify and manage it

Prefer `mat relay` over the raw `launchctl` calls below — it works the same
way on every platform and verifies the process is actually `tg-relay` before
acting on it:

```bash
mat relay status    # detected manager, verified process, singleton-lock state
mat relay stop      # stop via launchd; the LaunchAgent stays registered
mat relay start     # start it (fails closed if the plist is missing/out of date)
mat relay restart   # stop then start under one lock
```

Known launchd limitation: the singleton-lock field in `mat relay status` is
best-effort on macOS. Linux verifies process identity down to sub-second
`/proc` timing; launchd exposes no equivalent, so a same-second PID
coincidence is a known, narrow gap here — it never affects whether `stop`
refuses to report success, only the diagnostic detail shown.

The raw `launchctl` equivalents, if you need them directly:

```bash
# Inspect state (look for "state = running" and a 0 last exit status):
launchctl print gui/$(id -u)/com.my-ai-team.tg-relay

# Force a restart after editing the plist or upgrading:
launchctl kickstart -k gui/$(id -u)/com.my-ai-team.tg-relay

# Stop + unload (do this before re-bootstrapping an edited plist):
launchctl bootout gui/$(id -u)/com.my-ai-team.tg-relay
```

Within a few seconds the bot messages you `[tg-relay] active on <host>`. If it
doesn't, tail the log:

```bash
tail -f ~/.local/state/my-ai-team/tg-relay.log
```

A `no token for host` or `TG_CHAT_ID unset` line means step 4a's exports aren't
reaching the relay — confirm they are in `~/.bashrc.secret` and that the plist's
`source "$HOME/.bashrc.secret"` line is intact.

### 4c. Optional: keep the tmux server alive with no sessions

If a named `mat` server should survive a drop to zero sessions, opt in manually:

```bash
tmux -L mat set-option -g exit-empty off
```

Pane and window IDs then grow until an operator runs
`tmux -L mat kill-server`; the next server starts with reset counters.

### Three things to know about the managed relay

- **Restarts never give up.** A relay that fails on every start is restarted
  indefinitely, roughly ten seconds apart. If the bot never announces itself,
  read the relay log rather than waiting it out.
- **No memory cap.** The service runs without an RSS ceiling, so a runaway
  relay is not stopped for you — check it if the machine starts swapping.
- **Sleep pauses it.** Idle sleep is held off so the Telegram long-poll keeps
  running, but closing the lid or a scheduled sleep still suspends the machine.
  On a laptop the relay pauses until wake; this is expected.

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

A completed round-trip means install, activation, and the resident relay are all
live. Re-run `mat doctor` now: with the backend token, Telegram credentials, and
launchd agent all in place, it should report `All checks passed.`

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

`mat upgrade` reuses your stored key and installs only when the offered release
is not already installed (`--force` reinstalls the current one); the
license-gating Worker it contacts ships its endpoint inside the release, so there
is nothing for you to configure. The install re-renders the LaunchAgent and
restarts the relay onto the new code for you (a long-running bash daemon does
not hot-reload), so no manual restart is needed. If you ever need to force one:

```bash
launchctl kickstart -k gui/$(id -u)/com.my-ai-team.tg-relay
```
