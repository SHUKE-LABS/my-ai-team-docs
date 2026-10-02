---
title: How it works
description: The ticket-to-merged-pull-request loop my-ai-team runs for you, and what you need to start it.
---

my-ai-team turns a backlog of GitHub issues into reviewed and merged pull requests while you set the direction.

## The delivery loop

You make one handoff; the steps after it run without you.

1. **You mark an issue `ready`.** That label is the whole handoff. Work passes
   through GitHub issues and labels: claiming a ticket swaps `ready` for a lock
   label naming the mode.
2. **An agent claims the ticket.** A launch selects the next `ready` issue and
   takes it, unless you name an issue directly on the turn.
3. **The agent works in its own worktree.** Every worktree-creating mode runs in
   a dedicated worktree or a read-only snapshot, isolated from your main
   checkout, so unrelated or uncommitted work stays out of the change.
4. **The agent implements the change and opens a pull request.** You see the
   pull request like any other.
5. **A separate reviewer checks the work, and the result is merged.** In `duo`
   and `team`, an independent reviewer gates the plan and the implementation
   before the merge.
6. **You are asked only at decisions.** Notifications and questions reach you,
   and you can answer them from your phone over the optional Telegram relay:
   every agent message arrives in Telegram, and your reply routes back to the
   exact agent that spoke.

## What you need

- A GitHub repository.
- One supported backend CLI: `claude`, `codex`, `copilot`, `pi`, `opencode`,
  `freebuff`, or `cmd` (Command Code). You bring your own account and token or
  login; my-ai-team runs on top of that CLI and does not replace it.
- Linux, macOS, WSL2, or Windows Git Bash.

Ready to run it? Follow the [Linux quickstart](/reference/quickstart-linux/) or
any of the other quickstarts under
[the product overview](/reference/overview/).
