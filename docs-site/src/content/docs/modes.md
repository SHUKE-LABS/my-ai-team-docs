---
title: Modes
description: What each of the seven my-ai-team modes is for, when to use it, and how many agents it runs.
---

Each mode is a different shape of AI-agent session against your repository, from one agent working alone to a planner, developer, and reviewer relay.

Every mode launches its own session. The agent counts below are the ones in the FAQ mode table.

## Team mode

The three-agent relay for issue-backed delivery in the current repository: a
planner, a developer, and an independent reviewer, each in its own pane. Only
the planner starts working on launch; the developer and reviewer panes start
idle and wake as work reaches them.

Use it when a multi-file feature should be planned, built, and reviewed by
separate agents before it merges.

**Agents: 3** (planner, developer, reviewer).

## Duo mode

The leaner two-agent delivery loop: a developer who plans and implements, and
an independent reviewer who gates both the plan and the implementation. It runs
issue-backed delivery in the current repository and keeps a stable worktree per
backend combination.

Use it when you want an independent review gate but do not need a separate
planner.

**Agents: 2** (developer, reviewer).

## Adhoc mode

The single-agent delivery path: one agent claims a ticket, plans, implements,
opens the pull request, and merges it. With auto-start it selects the next ready
ticket itself.

Use it when a small, well-scoped issue can go from claim to merge in one pass.

**Agents: 1**.

## Explore mode

The open-ended investigation mode: it runs with or without a repository, in its
own dedicated home, and hands its findings off as tickets rather than code. A
finding is reported as confirmed, not confirmed, or insufficient evidence, with
a next action.

Use it when you have a question about a codebase or a bug report to reproduce,
and you want the evidence filed as a ticket.

**Agents: 1**.

## Audit mode

A per-repository session in a dedicated worktree: each pass refreshes to the
latest merged code and reviews it for quality problems, filing tickets but never
editing code, opening branches, or merging. It runs on a cadence poller and also
watches the continuous-integration surface.

Use it when you want a standing review of already-merged work that turns what it
finds into triage tickets.

**Agents: 1**.

## Caucus mode

A two-agent deliberation: a proposer and a challenger converge one topic into a
concrete conclusion, rendered as GitHub tickets, with no delivery code. It
launches idle and cuts a fresh read-only snapshot from the default branch.

Use it when the team needs to settle a design or strategy question as a concrete
issue.

**Agents: 2** (proposer, challenger).

## Live mode

A hands-on single-agent session with no issue queue, no reviewer, and no relay.
It can work directly in the current directory and branch, or shift to patch
delivery with a branch, a commit, and a pull request when the change calls for
it.

Use it when you want to work interactively with one agent on operational work or
a change you are driving yourself.

**Agents: 1**.

## Which mode do I start with?

Start with **adhoc**: it is the single-agent loop that claims one issue,
implements it, opens the pull request, and merges it — the smallest complete
loop for seeing the handoff work end to end. That is the mode the
[Linux quickstart](/reference/quickstart-linux/) launches in its first-session
step. Move up to `duo` or `team` when you want an independent review gate, and
to `explore`, `audit`, or `caucus` when the work should produce tickets instead
of code.
