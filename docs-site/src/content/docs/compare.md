---
title: Compare
description: How my-ai-team differs from running a coding CLI or an IDE agent by hand.
---

my-ai-team is a managed delivery loop that runs on top of the agent CLI you already use, so it differs from driving a coding agent yourself.

The comparison is about the working style of each kind of tool, not the features
of a particular product or version.

| Capability | Hand-run CLI agent (Claude Code, Codex CLI) | IDE agent | my-ai-team |
| --- | --- | --- | --- |
| Runs unattended on a backlog | You start each task yourself in an interactive session. | You start each task yourself from inside the editor. | Agents select the next ready ticket and begin without you. |
| Issue handoff via labels | You paste the task into the session by hand. | You describe the task in the editor's assistant. | Marking an issue `ready` hands it off; claiming it swaps the label for a mode lock. |
| Role separation across modes | One session plays every role. | One assistant acts across the whole workflow. | Planning, implementation, and review run as separate modes and backend slots. |
| Remote control over Telegram | The terminal is the only control surface. | The editor is the only control surface. | An optional relay puts every notification and reply in Telegram. |
| Self-merging pull requests | You open the pull request and merge it yourself. | You merge from the editor's source-control view. | A separate reviewer gates the work and the merge happens without you. |
| Runs on top of your existing backend | The CLI is the backend you are driving. | The tool brings its own model access. | It runs on top of `claude`, `codex`, `copilot`, `pi`, `opencode`, `freebuff`, or `cmd` (Command Code). |

my-ai-team is not an editor, not a model, and not a replacement for the backend
CLI. It is the delivery loop around a backend you already run, with your own
account and token.
