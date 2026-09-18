# Agent-assisted quickstart

If you already work with a CLI coding agent (Claude Code, Codex CLI, GitHub
Copilot CLI, pi, OpenCode, freebuff, Grok Build, or Command Code) and have
downloaded the my-ai-team release archive into your `Downloads` folder, this
page gives you one prompt to paste. Your agent runs the whole first install
for you: dependency checks, installation, backend registration, and the final
health report.

This path is CLI-only: the agent needs shell access in a terminal on the
machine where mat will run. It works on Linux and WSL2; on macOS use the
[macOS quickstart](quickstart-macos.md) or follow this page and adapt the
package-manager commands. The existing per-OS walkthroughs
([Linux](quickstart-linux.md), [WSL2](quickstart-wsl2.md)) remain supported
alternatives.

## What you need before pasting

- The release archive (`.tar.gz`) already in your `Downloads` folder — the
  prompt never downloads a replacement payload from the internet.
- A terminal with a CLI agent that can run shell commands on the target
  machine.
- Nothing else: missing standard tools are detected and reported before
  anything is installed.

## What the prompt does and does not do

The prompt runs the install in ordered gates, and every gate reports its exit
status:

1. **Shell and archive check** — confirm the agent is operating in a CLI with
   shell access and find exactly one intended release archive.
2. **Pre-extraction dependency check** — verify the Bash version and
   extraction tools before unpacking.
3. **Installer preflight** — run the extracted payload's read-only
   `./install.sh --check-dependencies`, which reports the three dependency
   phases separately: install hard prerequisites, first-session/runtime tools,
   and account/configuration credentials.
4. **Package repair** — install only the standard packages the preflight
   names, using the platform package manager, then rerun the preflight until
   the hard install set passes. When no safe package-manager path exists, the
   prompt stops with the exact commands for you to run.
5. **Install** — run `./install.sh` from the extracted payload.
6. **Backend setup** — identify which CLI family the agent itself is running
   under and run `mat setup --backend <kind> --make-default`, which writes the
   canonical registry entry for that backend (naming the environment variable
   that will hold your token or API key — it never reads or copies a secret
   value) and makes it your default.
7. **Final doctor** — run `mat doctor` last. It is the only step that reports
   what still needs you: backend login or token, GitHub authentication,
   license activation, and Telegram credentials. The prompt never claims any
   of these is complete without evidence, and it never performs external
   account enrollment for you.

## The prompt

Paste this into your agent:

```text
You are helping me install my-ai-team from a local release archive. Work in
order through these gates and report each command's exit status. Stop and ask
me whenever a gate cannot be completed safely.

1. Confirm you are a CLI agent with shell access on this machine (not a web
   or sandboxed assistant), then locate exactly one my-ai-team release
   archive (a .tar.gz file) in my Downloads folder (~/Downloads). If you find
   none or more than one candidate, stop and ask me which to use.

2. Check that this shell is bash >= 4.3 and that tar (with gzip support) is
   available. If bash is too old or tar is missing, report what to install
   and stop — do not unpack yet.

3. Extract that archive into a new directory under my home directory, cd into
   the extracted payload, and run: ./install.sh --check-dependencies
   This preflight is read-only. It reports three groups separately:
   install hard prerequisites (bash >= 4.3, tar with gzip, jq, cmp),
   first-session/runtime tools (git, tmux, curl, gh, python3/PyYAML), and
   account/configuration steps that a package manager cannot install.

4. For every MISSING item in the install hard prerequisites and runtime tools
   groups, install the named standard package with this platform's package
   manager (apt/dnf/pacman on Linux and WSL2; brew on macOS). Never use curl
   | sh installers and never run interactive login commands. Then rerun
   ./install.sh --check-dependencies until it exits 0. If no safe
   package-manager path exists for a missing item, print its exact fix hint
   and stop.

5. Preflight passed: run ./install.sh and report its exit status. Do not
   continue past a failed install.

6. Identify which supported backend CLI family you are running under
   (claude, codex, copilot, pi, opencode, freebuff, grok, or commandcode),
   then run: mat setup --backend <that kind> --make-default
   This registers the canonical backend entry for your CLI family in
   ~/.config/mat/backends.json and sets it as the default. It only names the
   environment variable that will hold my token or API key — it never reads,
   prints, or stores any secret value. Report its exit status.

7. Finally run: mat doctor
   Report its full findings honestly. List every item it flags as still
   needing me — backend login or token (export the variable named in
   backends.json; I will paste the secret myself, never print it), GitHub
   authentication (gh auth login), license activation, and Telegram
   credentials. Do not claim any of these is done unless mat doctor shows it
   passing. Point me at the user guide's configuration section for the
   remaining credential steps.
```

## After the prompt finishes

Open a new terminal (so your shell picks up the new `PATH`) and run
`mat doctor` yourself. Whatever it still reports — backend token, GitHub
auth, license, Telegram — is the short list of steps only you can do; the
[configuration section of the user guide](user-guide.md) walks through each
one. Then start your first session with `mat duo` in any git repository.
