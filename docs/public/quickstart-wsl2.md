# WSL2 quickstart (commercial customer)

WSL2 is the closest-to-Linux path on Windows: the whole framework sees a real
Linux environment, so you install and use it exactly as the
[Linux quickstart](quickstart-linux.md) describes. Follow that guide end-to-end
for install, license activation, the Telegram loop, and your first session —
this page covers only what is different inside WSL2.

## WSL2-specific notes

### Keep everything inside the WSL2 filesystem

Clone your repos and install mat under your Linux home (`~/…`), not under a
Windows drive mount (`/mnt/c/…`). Cross-filesystem access is slow, and Windows
mounts do not honor Linux file permissions or symlinks the way the framework
expects. `cd ~/path/to/your/repo` before launching an agent.

### Enable systemd so the Telegram relay installs as a service

The Linux quickstart's relay step assumes a systemd (or OpenRC) user service.
Modern WSL2 supports systemd, but it is not on in every distribution by
default. On the WSL2 side, add to `/etc/wsl.conf`:

```ini
[boot]
systemd=true
```

Then, from Windows (PowerShell or Command Prompt — outside WSL2), restart the
subsystem so it takes effect:

```powershell
wsl --shutdown
```

and reopen your WSL2 terminal. `install.sh` registers, enables, and starts the
`tg-relay` user service for you; on a WSL2 distribution without a reachable
systemd user manager it skips relay handling with a warning instead. Verify
with `systemctl --user status tg-relay` as in the Linux quickstart.

### WSL2 reads as plain Linux everywhere

`mat` makes no WSL2 distinction: installation, `mat doctor`, tmux sessions,
and the Telegram relay all follow the Linux behavior. In particular, a WSL2
session never claims Windows-specific work — that stays with a native Windows
Git Bash host. If you want that setup instead, see
[Windows Git Bash](faq.md#which-platforms-are-supported).
