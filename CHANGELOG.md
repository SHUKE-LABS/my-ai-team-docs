# Changelog

_Generated from release tags._

## v3.60.0 … v3.59.0 (2026-09-12)

### Features
- feat(baton): add graceful pause and resume control with console actions
- feat(console): fit role columns to the view and box the relay timeline

## v3.58.9 … v3.54.4 (2026-09-11)

### Features
- feat(console): show loading and busy states for slow operations
- feat(console): send an uninstalled Rewind to the product page
- feat(console): explain status pills, [!!] marker, and per-session readiness
- feat(ci): watch open Windows tracker issues for repeat failures

### Fixes
- fix(relay): refuse byte-identical duplicate send-relay deliveries
- fix(console): cache and async-spawn mat baton status to stop blocking polling
- fix(console): answer a dead session instead of failing silently
- fix(ci): defer Windows gate gh prerequisite to the dispatch path
- fix(install): keep an internal path off PATH and ship check-open-pr from an internal path
- fix(test): align installed send-relay usage assertion with duplicate-send flag
- fix(codex): project skills into both discovery and system roots
- fix(ownership): refresh a stale task_host_session before failing the owner record
- fix(baton): recover a dropped bg-run terminal callback via the index/record locator
- fix(console): scope the Rewind deep link to a project and source
- fix(relay): trim send-relay skill back under the 50-line budget
- fix(baton): give the task_host_session a no-op --agent-cmd
- fix(baton): serialize headless turns per role before delivering the next message

### Other Changes
- test(bg-run): sandbox every bg-run submission away from the host /tmp

## v3.54.3 … v3.49.6 (2026-09-10)

### Features
- feat(relay): replace receipt verification with a pair-idle nudge
- feat(relay): skip armed-waker panes in the pair-idle nudge
- feat(review): route non-blocking defects to follow-up
- feat(entitlement): list server versions and install a specific tag
- feat(console): probe and start Rewind before opening a session

### Fixes
- fix(bg-run): refresh a dead task_host_session by inbox match before refusing
- fix(test): gate Windows relay autostart behind MAT_INSTALL_SKIP_WINDOWS_AUTOSTART
- fix(relay): duo-merge-release must be idempotent across compaction
- fix(relay): fail fast when Copilot gateway path hits a Basic-auth edge
- fix(test): sandbox BG_RUN_DEDUPE_DIR in tmux-session-closed regression
- fix(codex): prune stale managed Stop-hook entries by script basename
- fix(test): build both release tarballs from one repo-root snapshot
- fix(agents): reclaim duo-dev render margin under the 15,000-byte ceiling
- fix(prompts): restore the reviewer preserve-purpose guardrail
- fix(skill): tighten ticket-self-critique AC and scope gates
- fix(docs): recover from unrelated-histories merge on projection refresh
- fix(supervisor): keep the caucus owner-identity sidecar on winpid modes
- fix(console): render 'no events' for sessions with no operator event
- fix(baton): pre-flight the backend CLI and converge service definitions
- fix(relay): strip every retired receipt-hook filename variant at launch
- fix(baton): make stall escalation confirmation-aware

## v3.49.5 … v3.48.0 (2026-09-09)

### Features
- feat(issues): close refining duplicates with teardown
- feat(docs): make the public repository the sole production publisher

### Fixes
- fix(ownership): release claims with their owner record and claim receipt
- fix(ci): run recovery-validator lanes under CI Required's pinned settings
- fix(ownership): dispatch owner-record launch through a driver-appropriate carrier
- fix(windows): reclaim a tg-relay lock directory with no owner stamp
- fix(windows): pin the lock backend to mkdir on Windows
- fix(lock): reclaim a dead holder's lockdir in the mkdir try-lock

### Docs
- docs(versioning): add troubleshooting note for pre-hoist upgrade failure

### Other Changes
- test(prompt): fail CI when a rendered constitution line disappears

## v3.47.1 … v3.43.0 (2026-09-08)

### Features
- feat(baton): mutual-idle stall recovery for duo — the waiting role re-nudges its peer
- feat(console): read-only baton console over loopback HTTP
- feat(console): intervene through mat baton verbs
- feat(docs): project public site from private source
- feat(console): role columns with transcript tail, stderr, and Rewind link

### Fixes
- fix(baton): invalidate a closed cycle's relay state at the headless boundary
- fix(docs-site): vertically center header items at desktop width
- fix(test): split duo-baton-worker-transport to restore backstop headroom
- fix(ownership): fail closed on malformed Baton task status

### Docs
- docs(duo-protocol): fix reply-forward header list, drop false relay-episode claim
- docs: add WSL2 quickstart guide
- docs(freshness): document the graphql association proof and gh floor

### Other Changes
- test: capture the inherited caller tmux socket before scrub-env unsets TMUX

## v3.42.5 … v3.39.1 (2026-09-07)

### Features
- feat(merge-gate): treat a plan-gated 403 on protection as provable absence
- feat(relay): add mat relay status|start|stop|restart control surface
- feat(docs): project the curated public docs to my-ai-team-docs

### Fixes
- fix(claude/windows): disable default PowerShell tool for Git Bash
- fix(bg-run): preserve actionable failure logs after task completion
- fix(claude): force x-api-key onto the wire on the Basic-auth gateway edge
- fix(ci): declare git safe.directory for self-hosted Windows jobs
- fix(copilot/windows): guard the powershell shell tool and decode toolArgs in both payload shapes
- fix(ticket-fresh): read PR closing-issue association via gh api graphql
- fix(baton): remove the progress-blind per-turn timeout
- fix(docs): pin audited Wrangler deployment dependency
- fix(relay): calibrate the pane-idle probe for a ticking-TUI backend
- fix(docs-site): point the modes card at the user guide's Modes section
- fix(test): freeze the clock at the peer-activity horizon boundary
- fix(test): tolerate a load-starved relaunch in run-memcap's retry case

### Refactors
- refactor(relay): delete the send-time viewport verification ladder

### Performance
- perf(hooks): cut child processes per tool event

### Other Changes
- ci: route an internal path changes to mat-backends-dispatch_test.sh
- test: dedupe helpers.sh's tmux-guard PATH prepend under re-source

## v3.39.0 … v3.28.14 (2026-09-06)

### Features
- feat: resume codex baton turns via codex exec resume
- feat(explore): run auto-refine as a baton headless engine
- feat(merge-release): pin the squash to the reviewed head
- feat(pi): forward provider/model/effort into the pi launch argv
- feat(install): accept a release tarball wrapped in a single top-level directory
- feat(pi): explicit-provider path — role-local models.json and detached shared auth
- feat(baton): mat baton status --dead lists crashed/stale sessions
- feat(explore): baton headless operator ask/reply loop
- feat: record codex rollout as the role's current transcript
- feat(pr): inject Closes #<N> into mat pr create body when missing
- feat(bg-run): add a user-facing --cancel verb; stop orphaned-monitor wake spam

### Fixes
- fix(session): report temp root creation failures
- fix: scope session temp root per user
- fix(test): make helpers.sh scratch-root allocation idempotent under re-source
- fix(install): stage payload via positional tar when --null is unsupported
- fix(relay): disarm stale tmux pollers after non-poll next-work directives
- fix(prompts): report reason-bearing poll directives truthfully
- fix(hooks): skip scratch-path guard where /tmp is the resolved scratch root
- fix(release): wrap the release tarball in a single top-level directory
- fix(explore): trust hoisted-but-empty live-owner evidence during sweep

### Refactors
- refactor(relay): extract driver-neutral relay-send.sh from tmux-send.sh

### Performance
- perf(explore): drop per-call forks in provision hot path + tmux BASH_ENV
- perf(explore): fold warm skills output signature into one tree walk
- perf(next-work): overlap stale-lock sweep, candidate resolution, and gate probe

### Other Changes
- test(ci): split duo baton worker suites
- ci(windows): fix contradictory rationale in Resolve Git for Windows Bash comment
- test: pin the pi settings stage fail-closed invariant
- test(explore): baton auto-refine docs + end-to-end regression

## v3.28.13 … v3.19.6 (2026-09-05)

### Features
- feat(notify): append host to user signatures
- feat(audit): add CI health mandate and ticket cap
- feat(grok): support native, API-key, and BYOK auth
- feat: remove the headless read-only tool policy
- feat(docs-site): adopt pnpm for dependency install and verification
- feat(baton): reduce duo launch output to actionable lines
- feat(docs-site): header Buy Now CTA with first-year 50% off checkout link
- feat(grok): honor context window size
- feat(install): add OpenRC relay fallback

### Fixes
- fix(test): drop python3+PyYAML dep from docs-deploy guard in Required lane
- fix(explore): remove per-token owner labels
- fix(docs-site): upgrade dependencies and audit publishes
- fix(docs): repair markdown anchors and add link lint
- fix(grok): harden headless read-only denylist
- fix(ci): restore agents invariant routing
- fix(cli): isolate external respawn resolver context
- fix(agents): restore target-repository qualifier in merge-gate CI-outage paragraph
- fix(test): restore docs deploy npm install guard
- fix: arrange renewal reap before signaling backend
- fix(baton): key duo fallback forwards per delivery, not per reply
- fix: bound explore owner label migration
- fix(ci): restore Windows timeout margins
- fix(docs): document audit-stall recovery and local-state clear on the customer page
- fix(supervisor): self-upgrade caucus at rebirth
- fix(cycle): accept absent owner record in duo merge release
- fix(agents): suppress duo Reviewer approval ack
- fix(scratch): bound and prune scratch-file path reservations
- fix(next-work): emit ids[]=<id> form fields in scoped age lookup
- fix(relay): stop duo prose forward loops
- fix(grok): make role guard provisioning idempotent

### Refactors
- refactor(digest): centralize stdin digest fallback
- refactor(relay): run one merged watchdog per session
- refactor(supervisor): unify local session supervisors
- refactor: retire `mat consult` and summon-devops helper lanes

### Performance
- perf(test): parse each anchor target once in docs-anchor-lint
- perf(relay): single awk pass for tmux socket arbitration
- perf(explore): overlap snapshot fetch with pane bootstrap
- perf(explore): hoist sweep evidence and replace guard per-entry rev-parse
- perf(next-work): cache open-pr and lock-label probes
- perf(next-work): cut plain claim pass to <=8 gh calls

### Docs
- docs: explain override-locked upgrade recovery
- docs: explain bg-run baton state failures
- docs(agents): remove stale notify-user neighbour references

### Other Changes
- test: opt escalation fixtures out of notify sandbox
- test(ci): register the orphaned cutover suites
- test: fix retired notifier sweep pointers
- test: retire the parallel next-test-framework stack
- wip: issue-3852 respawn role reap-context (pre-merge checkpoint)
- build: split an internal path into product launchers and top-level an internal path
- defect(baton): expose Claude/Codex transcripts through driver-specific flat homes

## v3.19.5 … v3.14.13 (2026-09-04)

### Features
- feat(mat): propagate Windows ticket label to PRs
- feat(grok): enforce restricted role write guard
- feat(relay): add grok headless adapter for baton turns
- feat(cli): add operator respawn trigger for supervised sessions
- feat(cli): add operator per-pane respawn for live team/duo sessions

### Fixes
- fix(docs): restore the live-mode contract prose dropped
- fix: recover supervised launch cwd safely
- fix(explore): replace If-Match auto-refine hold/release with comment-id arbitration
- fix(release): keep public docs self-contained
- fix: bound pickup guard retry budget
- fix(bin): preserve executable modes for shipped scripts
- fix(windows): preserve live relay locks during stop
- fix(docs-site): ignore generated version metadata
- fix(test): chain helpers cleanup in Windows selection test
- fix(windows): hide tg-relay launcher window
- fix(agents): preserve reviewer merge-release wake
- fix(baton): route duo committed replies
- fix(docs-site): use a tracked lockfile in CI
- fix(release): exclude docs-site from customer payload
- fix(relay): keep scratch-file collision paths as .md handoffs
- fix: honor reserved scratch paths in shell guard
- fix: remove dead explore compatibility shims
- fix(agents): restore merge-flow --watch rationale and reclaim prompt headroom
- fix(release): close shipped documentation reference graph
- fix(ci): route session invariants through parallel lint
- fix(grok): guard native write events
- fix(grok): read camelCase hook envelope in role-guard dispatcher
- fix(ci): report every test failure in CI
- fix(baton): key duo fallback forward dedup per delivery
- fix(grok): guard native interactive write tools
- fix(explore): reap completed tmux auto-refine children

### Refactors
- refactor(windows): single-source tg-relay launcher template and hash

### Docs
- docs: clarify Windows Codex read-only mapping
- docs(ci): correct mat-hook-benchmark payload claim in an internal document

### Other Changes
- ci: add Windows platform soft gate
- test(docs): re-point dropped user-guide contracts to their owner pages
- test: stop simulated-Windows suites leaking drive-letter dirs into the repo root
- enhancement(backend): add interactive grok kind
- test(ci): route prompt contracts through parallel suite

## v3.14.12 … v3.13.10 (2026-09-03)

### Features
- feat(docs): public documentation site on Cloudflare Pages with Astro Starlight

### Fixes
- fix(docs): restore live-mode never-merge-around-CI wording
- fix(ci): force eol=lf on windows-*.txt lane manifests
- fix(explore): make auto-refine reservations claimable
- fix(codex): retire legacy top-level skills
- fix(windows): use native taskkill switches
- fix(windows): stop all owned relay roots
- fix(baton): inherit host service environment
- fix(windows): publish tg-relay launcher PID
- fix: run codex baton reviewers on Windows

### Performance
- perf(release): trim customer payload

### Docs
- docs(relay): clarify cross-session role routing
- docs: separate customer-facing docs from internal docs
- docs: rewrite public user guide as customer documentation
- docs: restore MAT environment override coverage
- docs(docs-site): make public documentation concise

### Other Changes
- test: split headless-agent-cli suite at the task-trail seam

## v3.13.9 … v3.10.10 (2026-09-02)

### Features
- feat(baton): auto-start and reuse the host-owned service for direct launches
- feat(statusline): poll z.ai/ZhipuAI quota endpoint in no-gateway homes
- feat(gateway): support Basic-auth-protected gateways

### Fixes
- fix(relay): claim gates pass untracked-only worktree dirt
- fix(statusline): omit native quota without gateway
- fix(baton): normalize mailbox root to Windows form before persisting
- fix(pickup-guard): host-aware deadline, one retry, evidence-bearing deny
- fix(relay): wake codex input and guard head-truncated sends
- fix(windows): restart resident tg-relay on install
- fix(guard): allow validated fast-forward baseline sync in Explore
- fix(baton): hide Windows host service launcher
- fix(adhoc): restore headless terminal on park

### Performance
- perf(install-mirror): drop cmp pre-pass; mirror via same-volume renames

### Other Changes
- test(install-launcher): isolate notify-user cred test from ambient sandbox and host secret

## v3.10.9 … v3.8.0 (2026-09-01)

### Features
- feat(ownership): replace stale-lock forensics with leases
- feat(doctor): warn on dirty tracked backend registry
- feat: add resident explore auto-refine mode

### Fixes
- fix(live): make CI merge gate conditional
- fix(relay): coalesce stale bg-run wakes
- fix(worktree): make role teardown long-path aware
- fix(ownership): retry owner record publication
- fix(prompts): clarify owner-record resume evidence
- fix(codex): use system skill root
- fix(skill): scope investigation to material tasks
- fix(freebuff): deliver startup prompts through pane
- fix(relay): wake freebuff input before handoffs

### Performance
- perf: reduce next-work selection latency
- perf(relay): consolidate PreToolUse fan-out into one dispatcher per backend

### Other Changes
- test: sandbox benchmark notifications

## v3.7.1 … v3.3.0 (2026-08-31)

### Features
- feat(relay): at-most-once hedged reminders + automatic ack-on-consume
- feat(ci): split Windows Git Bash lanes into purpose-based workflows
- feat(ci): classify Windows wave results and surface timing trend
- feat(bench): measure symlink and baton startup lanes
- feat(lb): view arbitrary markdown and show install quickstart

### Fixes
- fix(hooks): resolve scratch-path lint across Git Bash tmp spellings
- fix: recover renewal from dead Windows launcher anchor
- fix: reserve pwsh scratch paths with literal marker
- fix: make Windows runtime mirror bounded and resumable

### Docs
- docs(adhoc): honor direct issue assignments

### Other Changes
- ci: establish Windows runner isolation and safe shard parallelism
- ci(windows): add bounded transient response
- chore(release): prune old R2 releases

## v3.2.3 … v2.97.0 (2026-08-30)

### Features
- feat: forbid hand-written tmp scratch paths
- feat: add startup diagnostics and latency benchmark
- feat: make agent-home provisioning incremental
- feat(worktree): make snapshot creation long-path aware on Windows
- feat(entitlement): provision + deploy license-gating Worker on mat-upgrade.shukelabs.com, bake its URL (A2/A3)
- feat: adopt shukelabs.com domain family — upgrade.mat.shukelabs.com + README landing link

### Fixes
- fix(launcher): fail startup diagnostics open through the external symlink
- fix(ci): recalibrate Windows Git Bash fast-lane timeout backstops
- fix(entitlement): guard release builds against an unfilled Worker URL

### Performance
- perf(prompt): cache repeated prompt and subagent renders
- perf(auth): local-first GitHub auth resolution — owner map + named token vars
- perf(runtime): stop paths.sh/backends.sh re-forking platform.sh's uname probe

### Docs
- docs: add store buy link to README + fix faq sales-page placeholder (B2)

### Other Changes
- test(windows): split GitHub auth lane coverage
- ci: define goal-based Windows suite inventory

## v2.96.0 … v2.95.5 (2026-08-29)

### Features
- feat(hooks): block persistent Windows PATH rewrites in the existing Bash guard

### Fixes
- fix(ci): tier Windows fast-lane timeouts
- fix(scratch): resolve MSYS /dev/null stdin target
- fix(test): make Baton harness launches portable
- fix(agents): guard background execution in Baton turns
- fix(freebuff): pin USERPROFILE to the role home on Windows
- fix(relay): arm stall watchdog at claim time
- fix(agents): route the tmux Reviewer merge release through bg-run
- fix(relay): bound send-verify nudges per sender and reap them at the cycle boundary
- fix(agents): disable Claude harness background tasks mat-wide
- fix(live): resolve native live-child pid for Windows local-driver renewal

### Other Changes
- ci: shard the real-host lane into two staggered daily runs
- chore(install): drop rsync staging dependency

## v2.95.4 … v2.90.29 (2026-08-28)

### Features
- feat(backends): add the codex-kind headless adapter
- feat(auth): auto-select a logged-in gh account that can access the origin repo
- feat(relay): register `freebuff` backend kind
- feat(relay): wire freebuff skill discovery and its invocation phrase
- feat(auth): add headless GitHub token opt-in

### Fixes
- fix(relay): record every supervisor terminal exit in the durable event log
- fix(ci): route the declaration sources to the suite that reads them
- fix(relay): skip tmux discovery for headless drivers
- fix(audit): scrub inherited wake file from child env
- fix(relay): avoid SIGPIPE for first-line chrome rule
- fix(claim): make the assigned-label write the claim commit
- fix(relay): propagate baton auth launch failures
- fix(bg-run): use Windows cmd launcher for Baton
- fix(agents): preserve Baton background wakes across turns
- fix(mat): refuse ready promotion over another session's delivery lock
- fix(tg-relay): preserve pane sticky targets
- fix(relay): support freebuff panes in idle detection
- fix(agents): render Reviewer merge-boundary guidance from hosting MAT_DRIVER
- fix(relay): recognize npm freebuff idle panes
- fix(telegram): let a rebound-HOME backend reach the host secret file

### Docs
- docs: freebuff capability boundary and provider-catalog volatility

### Other Changes
- chore(ci): name every owning route in two taxonomy reasons

## v2.90.28 … v2.89.16 (2026-08-27)

### Features
- feat(audit): retire merge-time notify-auditor-merge

### Fixes
- fix(relay): make audit-wake pushes untracked sends
- fix(docs): name the mat tmux socket in every recovery instruction
- fix(poll): retain live owners without identity evidence
- fix(ci): gate releases on conventional PR titles
- fix(prompts): separate idle poll ownership selector
- fix(ci): route version skew and ticket critique hooks
- fix(prompts): anchor self-pane display guidance
- fix(ci): run GitHub auth guard in smoke floor
- fix(ci): short-circuit the code children on a pull_request edited event
- fix(ci): route repo-wide invariant lints
- fix(ci): route supervised-leaf_test.sh from its owner paths
- fix(relay): run the Baton poller task through bash so a native supervisor can spawn it
- fix(ci): route self-id-display-message lint from the trees it scans
- fix(claude): key worktree trust by the git common root
- fix(ci): route the Windows selection guard from the manifests it reads
- fix(ci): enforce path router ownership integrity
- fix(relay): resolve Baton poller Git Bash interpreter
- fix(agents): critique tickets the delivery roles author
- fix(ci): record the claude-config.sh route in the suite taxonomy
- fix(poll): give team/duo and caucus supervisors a generation identity
- fix(ci): move the CI selection contracts to a Required-reachable owner

### Refactors
- refactor(launch): remove pane mode and `with` satellites
- refactor(baton): own the task-path credential scrub in one place

### Docs
- docs: correct headless adapter guidance

### Other Changes
- fix/issue 3445 framework state base
- fix/issue 3448 reviewer post merge terminal
- ci/issue 3457 worker lockfile npm ci
- fix/issue 3463 bg run wrapper root
- test: cover gate-check pane resolution
- test(relay): pin the audit-wake no-track wiring in a non-serial suite
- test(audit): decouple mat-audit-local fixtures from startup and poller cost

## v2.89.15 … v2.86.8 (2026-08-26)

### Features
- feat(audit): surface stalled status diagnostics
- feat(audit): add supervised stall recovery
- feat(audit): show next fetch countdown in pane title

### Fixes
- fix(install): clarify installer progress and upgrades
- fix(relay): protect Baton resident poller from agent stop
- fix(ci): route rendered prompt suites for agent changes
- fix(adhoc): retain live backend state during cleanup
- fix(baton): scrub suffixed GitHub tokens from tasks
- fix(agents): keep duo-dev prompt under byte budget
- fix(ci): route rendered prompt contracts through focused suite
- fix: scrub inherited audit wake file from tests
- fix(baton): scrub GitHub tokens from the devops summon task
- fix(audit): scope local merge wakes to repo session
- fix(test): give the bgrun baton harness a reachable PATH-form converter
- fix(test): reap Baton bg-run harness process groups
- fix(ci): resync ci-suite-taxonomy.tsv with all_scripts, guard both directions
- fix(test): isolate opencode env in audit suite fixtures

### Other Changes
- test: align prompt invariant assertions
- test: stub gh in caucus baton regression
- test(audit): reap detached poller fixture
- test: enforce prompt ceiling per driver
- fix/issue 3438 route renderer render contracts

## v2.86.7 … v2.83.0 (2026-08-25)

### Features
- feat(relay): normalize literal command sigils
- feat: keep baton relay pollers resident
- feat(relay): route Telegram replies to Baton agents
- feat(relay): keep TG follow-ups on a baton role via a baton-aware sticky

### Fixes
- fix(baton): name the remedy when the GitHub auth boundary refuses a launch
- fix: preserve baton duo task continuity
- fix(baton): scrub the launching pane's identity from baton workers
- fix(stall-watchdog): judge peer activity by an output horizon, not a screen sample
- fix: harden Windows adhoc renewal reap
- fix(pcon): keep pane pidfiles bare under supervision
- fix(dispatch): accept an identity-matched owner record as local cycle evidence
- fix: preserve review verdict evidence at merge
- fix(ci): suppress cross-file ShellCheck cmd-array false positives
- fix(cli): honor audit worktree flags
- fix(poll): treat cross-scheme identity as unknown
- fix: preserve visibility for orphaned adhoc backends
- fix(runtime): unset BASH_ENV at runtime entry
- fix: scope assigned locks by owner host
- fix(audit): self-upgrade the audit supervisor at the standby boundary
- fix(headless): adopt a task's keyless first turn instead of opening a second conversation
- fix(test): align review prompt assertions
- fix: scrub suffixed GitHub token variables from Baton workers
- fix(baton): pin resident poller task environment
- fix(agent-cli): bound keyless adoption to preceding turn
- fix(agents): document review artifact contract
- fix: carry duo task keys across baton relays
- fix(ownership): scope stale-lock reclaim by owner host

### Docs
- docs(ci): reconcile framework corpus adapter path and tranche-2861 notes

### Other Changes
- test(tmux-send): assert pi sigil normalization in command payload regression
- test(poll): align baton revival fixture with task host
- test(relay-poll): cover PID file, log redirect, and exit logging
- test(baton): align team status fixture with state shape
- test: widen persistent baton wake timeout
- test: scrub inherited pcon pidfile override
- fix/issue 3374 cycle test exit trap
- fix/issue 3396 audit local two wake settle
- test: provision GitHub auth pin in Baton poll fixture

## v2.82.5 … v2.80.15 (2026-08-24)

### Features
- feat(agents): file every new ticket refining
- feat(tg-relay): deliver single-token / and $ messages as literal commands

### Fixes
- fix(ownership): make Windows local state falsifiable
- fix(windows): repair stale private helper tmux sockets
- fix(watchdog): preserve supervised notification identity
- fix(audit): signal stalled supervised children
- fix: handle macOS fdesc stdin in scratch-file
- fix(relay): surface skipped issue comment handoffs
- fix(audit): end supervised child after pass
- fix(ci): route prompt and test invariants
- fix(agents): restore audit prompt headroom
- fix(supervisor): self-re-exec explore/adhoc/live supervisors at rebirth
- fix(test): restore green validation baseline

### Refactors
- refactor(agents): restore investigation prompt headroom
- refactor(agents): share ticket self-critique checkpoint
- refactor(agents): subtract live's ticket-path carve-outs

### Docs
- docs(adhoc): make adhoc-merge-release the only merge instruction

### Other Changes
- bug/issue 3298 install relay probe

## v2.80.14 … v2.78.17 (2026-08-23)

### Features
- feat(audit): observe remote default advances
- feat(bg-run): show the --max countdown in the pane border

### Fixes
- fix: resolve standalone Windows agent child PID
- fix(test): stop the fake-cygpath cases leaking BASH_ENV into their inner bash
- fix(duo/team): preserve issue suffix across child launches
- fix: keep session transcripts in shared role homes
- fix(explore): report stuck snapshot cleanup failures
- fix(baton): track watch aggregation pid without $!
- fix(ownership): retain live local state across MSYS runtimes
- fix: align Baton continuation boundary contract
- fix(ownership): accept diagnostic repo slug aliases
- fix: converge Windows supervised child PID publication
- fix(ownership): make orphan record diagnostics informational
- fix(test): run docker sandbox as host user
- fix(session): verify merge boundary restart adoption

### Other Changes
- test: sandbox Windows scratch-file writer
- test: scope the three private scratch roots in headless-agent-cli to their cases
- docs/issue 3263 owner record guidance
- bug/issue 3275 secure baton github auth

## v2.78.16 … v2.72.0 (2026-08-22)

### Features
- feat: add ticket freshness gate
- feat(baton): resume headless turns per task
- feat: add detailed baton status
- feat(dispatch): add all-role health pass
- feat(baton): freeze each task's constitution per baton session
- feat: add baton health watch
- feat(ownership): add per-issue heartbeat records

### Fixes
- fix(ci): stage path-form.sh in the test-runner fixture
- fix(cycle): fail closed on legacy merge boundaries
- fix(stall): bound peer awaiting-human suppression and qualify breadcrumb identity
- fix(pwsh): resolve a native bash instead of the System32 WSL launcher
- fix: keep baton pollers resident across cycles
- fix(bg-run): reap a task's process group at session teardown
- fix(install): require cmp dependency
- fix(relay): confirm busy Codex handoffs after transport
- fix: speed Windows private helper launches
- fix(dispatch): require local evidence to resume assigned issues
- fix(test): use real legacy relay-poll fixture
- fix(test): unbreak the Windows Git Bash release + install-upgrade lane
- fix: pin duo team relay pollers to session repo
- fix(baton): never gate claiming or wakes on reviewer busy
- fix(adhoc): publish native pcon backend pid for renewal
- fix: resolve baton relay targets from durable state
- fix: keep baton merge boundary poller-owned
- fix(install): tolerate benign tar staging races
- fix(ci): route test invariant lints
- fix: preserve headless notification provenance
- fix(audit): stop local supervisor on exit
- fix: bound duo merge release tail

### Refactors
- refactor(scratch): retire path-only mat scratch and migrate all guidance
- refactor(test): centralize runner fixture staging

### Performance
- perf: reuse task branch for merge cleanup
- perf: reuse verified merge ownership state
- perf(cycle): avoid redundant merge label creation

### Docs
- docs: baton duo quickstart — operator guide for the headless driver
- docs: document local-driver validation fallback

### Other Changes
- ci: run fixture source-sync lint in CI Required smoke floor
- bug/issue 3176 notify action
- chore: retire mat next-loop and the dead agent-rebirth narration
- feat/issue 3206 headless notify
- test(run): guard Windows selection and filter --changed
- chore(ci): retire Windows real-tmux coverage
- test: fold session restart paths on Windows
- fix/issue 3221 scratch file no data source

## v2.71.0 … v2.70.2 (2026-08-21)

### Features
- feat(scratch): add stdin-backed mat scratch-file writer

### Fixes
- fix(opencode): derive BYOK provider id from default_model
- fix(codex): mirror managed skills into the codex .system skill root
- fix(relay): make assigned-task recovery platform-aware and lock-exclusive
- fix(relay): reject an unwritten file handoff before send-relay delivery

### Other Changes
- test(relay): align CRLF-jq shim regressions with the mode-based gateway
- fix/issue 3136 path form lint

## v2.70.1 … v2.68.6 (2026-08-20)

### Features
- feat(entitlement): bake the license-gating Worker URL with an env override
- feat(entitlement): add `mat upgrade --check` for install-free update discovery

### Fixes
- fix(scratch): reject a second argument instead of silently dropping it
- fix(ci): record session-restart-regression.sh as a heavy-lane exclusion
- fix(relay): give tmux -c the posix path form on Git Bash
- fix(review): suppress approval ack after successful implementation review
- fix(relay): bound every real tmux client call so a wedged server cannot hang the restart
- fix(relay): give the pane idle probe an MSYS process-table arm
- fix(relay): defer the Claude send-verify verdict with asyncRewake
- fix(platform): use jq native binary mode on Windows instead of stripping every CR

### Docs
- docs(agents): make Validation guidance honest about CI gates and local cost
- docs(agents): restore CI-gate and auto-start qualifiers dropped by

### Other Changes
- fix/issue 3110 lock claim race
- test(ci): move the Windows heavy manifest invariant into the parallel lane
- test(ci): pin the real-host lane's serial width and hang guard
- fix/issue 3130 sentinel sender epoch
- fix/issue 3113 msys ps pid introspection
- fix/issue 3135 bash read receipt
- feat/issue 3141 gitbash tarball install
- test(entitlement): cover cross-version upgrade and Worker forward-compat

## v2.68.5 … v2.68.0 (2026-08-19)

### Features
- feat(cycle): restart tmux team/duo sessions from a persisted launch spec

### Fixes
- fix(live): preserve cross-root state paths
- fix(tg-relay): normalize CRLF jq output before reply routing
- fix(relay): route every bare jq in an internal path + an internal path through _mat_jq

### Other Changes
- test(issues): pin the ready-transition lock release to byte-exact labels under CRLF jq
- test(lint): enforce the _mat_jq boundary and unmask bare jq in helpers

## v2.67.26 … v2.67.22 (2026-08-18)

### Fixes
- fix(skill): make investigation freshness recovery actionable and narrow its trigger
- fix(agents): make notify-user --action recipient-specific
- fix(statusline): read effort level from statusLine payload
- fix(windows): make poller discovery MSYS-safe

### Other Changes
- feat/issue 3063 windows heavy real tmux

## v2.67.21 … v2.67.9 (2026-08-17)

### Fixes
- fix(test): stop Git Bash uname stubs creating a stray C: dir at the repo root
- fix(agent-home): recover Windows migration when another process holds the legacy home
- fix(ci): route worktree.sh Windows evidence to real product coverage
- fix(codex): preserve CRLF when provisioning Windows sandbox
- fix(pcon): Windows reap guard tolerates a naturally-exited backend
- fix(test): pin run-lanes_test.sh sort/comm calls to LC_ALL=C
- fix(test): give the solo-lane elapsed assertion one second of clock slack
- fix(ci): scope native Windows wave inside MSYS2

### Docs
- docs(windows): pin one Git configuration for Git Bash and MSYS2
- docs(skill): ask for a missed platform:windows label in ticket-self-critique

### Other Changes
- refine(hooks): pin Claude PreToolUse timeout semantics for the issue-pickup guard
- chore(ci): switch ci-windows-heavy schedule from weekly to daily
- feat/issue 3062 windows lane v4 real tmux

## v2.67.8 … v2.65.0 (2026-08-16)

### Features
- feat: remove send-tmux compatibility command and skill
- feat(investigation): add freshness preflight
- feat(codex): provision unelevated Windows sandbox

### Fixes
- fix(codex): seed Windows trust keys in native form
- fix(test): retry a launch that never started instead of counting it failed
- fix(audit): reset the audit cycle count in the home that exists on disk
- fix(bg-run): deliver the terminal wake to a deduplicated=true caller
- fix(relay): never nudge a reborn sender about an unconfirmed send
- fix(cli): list mat dispatch in the mat --help catalog
- fix(mat): detect Windows claim capability from the host
- fix(pcon): allow standalone claude.exe during Windows rebirth reaping
- fix(explore): do not mislabel snapshot preparation failures as fetch failures
- fix(gitbash): normalize duplicate-clone owner paths before comparison

### Other Changes
- chore(ci): remove throwaway ci-windows-debug workflow
- chore(ci): remove CI Target Matrix workflow and its orphaned residue
- chore(ci): rename ci-serial-real-host.yml to ci-real-host.yml
- feat/issue 3032 agent home root
- verify(windows): real-close session teardown on MSYS2 tmux

## v2.64.1 … v2.63.0 (2026-08-15)

### Features
- feat(ci): Windows heavy lane -- cron-only advisory workflow for slow stub-only suites
- feat(live): attach domain toolbox home

### Fixes
- fix(agents): treat a re-sent same-path handoff as a fresh signal to re-read
- fix(agents): make duo-review notify-user routing unconditional
- fix(windows): preserve stdin in _mat_pcon_spawn native CLI launch

### Refactors
- refactor(agents): port ticket-critique reminder/stop/clear to copilot
- refactor(agents): bound audit backlog by merge count, not calendar age
- refactor(agents): make file-only the default message format
- refactor(agents): restore per-role personality fragments and role-name defaults
- refactor(agents,docs): sweep literal /tmp handoff paths to $(mat scratch)
- refactor(agents): convert control-signal relay sends to file-based

### Docs
- docs(ci): correct ci-heavy history comments

## v2.62.0 … v2.57.10 (2026-08-14)

### Features
- feat(ci): Windows green lane v1 — test/test-windows.sh over a curated manifest
- feat(mat): route platform:windows tickets only to Windows-capable agents
- feat(relay): surface runtime version-skew marker in tmux status-line hostname slot
- feat(ci): windows lane v2 -- complete the fast mock-only tier
- feat(ci): Windows lane v3 -- first heavier mock-only tier (curated)

### Fixes
- fix(agents): disambiguate slice-PR closing-keyword contract, verify linkage pre-merge
- fix(agents): mark refine-to-delivery directive and define duo-dev continuation
- fix(relay): recognize Claude Code paste-collapse placeholder as composer-pending

### Refactors
- refactor(agents): single-source the notify --action and TG-reply contracts
- refactor(agents): restore slimmed dev-side shared contracts
- refactor(prompts): plan-gate roles discover oversized scope, don't self-split
- refactor(agents): restore slimmed misc shared fragments
- refactor(worktree): preserve the repository basename in the terminal path segment

## v2.57.9 … v2.55.0 (2026-08-13)

### Features
- feat(ci): scope required-shellcheck to changed Bash files
- feat(mat): add mat pr create — CWD-first --repo pinning over GH_REPO
- feat(bg-run): reap launch scratch and expired /tmp artifacts

### Fixes
- fix(test): scope bg-run fail-closed artifact assertion to the run's own pid
- fix(test): clean framework isolation roots on abort
- fix(notify-user): accept --message and reject unknown flags
- fix(prompts): slim team review.md — drop startup relay ping and Reviewer-owned decomposition
- fix(ci): close residue — collapse selector, fix fail-open, reconcile ledger

### Refactors
- refactor(agents): single-source the anti-phantom-send contract
- refactor(agents): single-source stance and pin duo-dev turn-end continuation
- refactor(agents): restore slimmed review-side shared contracts

### Docs
- docs(send-relay): document pane-id escape hatch and pin it with a test
- docs(agents): share mat-gh-wrapper rules across adhoc/dev/duo-dev/live

### Other Changes
- revert: restore changed-path-routed CI Required lane
- ci: make ci-capability-lanes own the serial real-host lane
- ci: rename ci-capability-lanes.yml to ci-serial-real-host.yml
- chore: delete dropped framework contract suites and unreferenced code
- ci: bound CI Required to the 15-minute, no-real-host boundary
- test: assert heaviest partition weight keeps margin under timeout backstop
- test: wire reviewed per-script budgets from CI Full timing evidence

## v2.54.26 … v2.52.1 (2026-08-12)

### Features
- feat(hooks): port the issue-body pickup guard to codex, copilot and pi
- feat(test): add framework adoption scorecard

### Fixes
- fix(relay): add a first-nudge grace to undelivered-send detection
- fix(relay): give inline handoffs a sender-side viewport fallback and bound re-send prompting
- fix(ci): pin the ShellCheck baseline comparison to byte collation
- fix(test): repair the vacuous unresolved-record assertion in bg-run wake recovery
- fix(test): wait for bg-run monitor before dedupe fixture cleanup
- fix(ci): key the ShellCheck baseline on findings, not coordinates
- fix(test): restore duration-based LPT partitioning with a live weights source
- fix(live): scope the commit-reflection prompt to what the commit actually is
- fix(duo): stop cycle-boundary relay leaks
- fix(test): make bg-run-regression's /tmp scans survive an unreadable entry
- fix(ci): route CI Required to the changed paths instead of the whole corpus
- fix(test-contract): reap MODEL_DIR on exit
- fix(test): wait for the monitor to exit in the commit-failure fixture
- fix(ci): preflight required runner toolchain
- fix(review): derive the team Merge gate from the target repository
- fix(test): skip the unreadable-weights case where chmod 000 cannot block reads
- fix(agents): restore the anti-phantom-send reminder to duo-dev.md

### Docs
- docs(ci): mbp13 moves from ci-light to ci-slow

### Other Changes
- test: port CI selection, evidence, and cutover suites into the framework
- test: port deterministic product and persistence suites into the framework
- test: port cross-backend hook and prompt contract suites
- test: port backend configuration and launcher contract suites into the framework
- test(run): calibrate Git Bash per-script backstop to 2400s
- test: complete real baton orchestration coverage in the framework
- test: port tmux, session, and process-reliability suites
- ci: move capability-lanes from ci-heavy to ci-light runner pool
- ci: trigger capability lanes from CI Required completion, not pull_request
- test: cover the merge gate's sizing path (ci-changed-paths, ci-required-route)
- fix/issue 2875 opencode composer boundary

## v2.52.0 … v2.50.6 (2026-08-11)

### Features
- feat(hooks): enforce the pre-edit pickup check on the issue-body edit path
- feat(test): make performance warnings first-class without failing correct suites

### Fixes
- fix(ci): flip tmux-control-plane to out-of-support on gitbash
- fix(ci): make declaration parsing host-independent (CRLF checkout fix)
- fix(test): forward runner settings into Docker
- fix(cycle): reconcile skipped repo root advances
- fix(relay): normalize CRLF prompt templates so include boundaries never produce triple newlines
- fix(role-guard): cache bash-command-view parse per invocation
- fix(prompts): address the user through MAT_USER_NAME, not a literal name
- fix(duo-review): derive the CI merge gate from the target repository

### Refactors
- refactor(agents): make duo-dev constitution standalone
- refactor(agents): make duo-review constitution standalone
- refactor(agents): make review.md a standalone constitution under 15k
- refactor(agents): make plan.md a standalone constitution under 15k
- refactor(agents): make adhoc.md a standalone constitution under 15k
- refactor(agents): make dev.md a standalone constitution under 15k
- refactor(agents): make live.md a standalone constitution under 15k
- refactor(agents): make audit.md a standalone constitution under 15k
- refactor(agents): make explore.md a standalone constitution under 15k
- refactor(agents): make caucus proposer constitution standalone
- refactor(agents): make caucus challenger constitution standalone

### Performance
- perf(ci): parallelize target corpus suites

### Docs
- docs: align workflow contract documentation

### Other Changes
- test(ci-candidate-calibrate): skip whole suite on Windows Git Bash
- feat/issue 2835 opencode forward shared config
- test(agents): enforce rendered prompt byte ceiling
- ci: add required ShellCheck gate

## v2.50.5 … v2.49.4 (2026-08-10)

### Features
- feat(codex): unify subscription and BYOK providers

### Fixes
- fix(windows): resolve send-verify, receipt, repo-slug, and profile-detection CI failures
- fix(agents): resolve Reviewer decomposed lock release
- fix(ci): extend target matrix coordinator bounds
- fix(windows): Git Bash renewal/regression suite fixes
- fix(ci): scope target matrix contract cases
- fix(caucus): gate teardown on confirmed callbacks

### Other Changes
- test(windows): normalize drive-letter paths in test PATH constructs and path-form assertions

## v2.49.3 … v2.48.17 (2026-08-09)

### Features
- feat(skill): add an explicit investigation workflow with terminal self-critique

### Fixes
- fix(next-work): recover orphan PRs when no ready ticket exists
- fix(opencode): write limit.output instead of limit.input
- fix(relay): content-aware resend resolves unchanged handoff, bound Stop-hook nudge cadence
- fix(test): Windows Git Bash CI green (handoff-receipt fake-tmux path + prior suite fixes)
- fix(relay): legacy send-sentinel gets TTL/GC and dead-target detection
- fix(prompts): render backend-native skill invocation syntax
- fix(test): drop dead script-weights.tsv cp in workflow-regression fixtures
- fix(test): drop stale ci-taxonomy-completeness_test.sh refs, retired selectors
- fix(relay): mat next-work fails fast on unresolved session identity
- fix(relay): receipt submitted inline handoffs

### Performance
- perf(ci): reuse required lane selection and probes

### Docs
- docs(user-guide): document TARGET GONE diagnostic and sentinel TTL reap

### Other Changes
- feat/issue 2737 opencode context window size
- test(ci): make Windows Git Bash minimal test PATH complete and path-form-correct
- test/issue 2640 cutover linux macos required
- ci(windows): add throwaway debug workflow for runner-context iteration
- chore(relay): remove obsolete poll-ready gate semantics
- ci: remove macOS from merge-blocking Required lane (interim)
- test(doctor): normalize drive-letter paths before test PATH constructs
- test(poll): cover liveness classifier branches

## v2.48.16 … v2.46.9 (2026-08-08)

### Features
- feat(prompts): evidence-backed tracked-flake path for red required CI
- feat(live): treat absent policy state as the direct default

### Fixes
- fix(relay): reap supervisor-waited Copilot loader on renewal, not just the leaf
- fix(relay): clean rendezvous when a renewal reap does not happen
- fix(relay): isolate handoff verification state across tmux servers
- fix(relay): retire stale receipt before refreshing resent handoff expectation
- fix(relay): stop treating an unreadable /proc stat as pid-reuse evidence
- fix(relay): deduplicate repeated undelivered watchdog nudges

### Refactors
- refactor(relay): fold team gate into next-work, revive dead poller on watchdog tick
- refactor(workflow): remove split-verdict labels and lifecycle

### Other Changes
- fix/issue 2690 decouple recovery watchdog
- test(relay): align busy-target fixture with copilot footer contract
- test(ci): harden arb socket-state timing and probe pin under serial load
- test(scrub): align kill-gate sink assertion with the reap-clean contract
- refactor/issue 2679 reviewer owned rebirth
- ci: decouple CI Full calibration from full matrix pin
- test(baton): revive terminal-transition harness on service-managed baton
- ci/issue 2641 multi target attestation
- test: framework-behavior cross-platform corpus
- test/issue 2638 capability lanes
- test(test-runner): pin fixture cases to declared linux-x86_64 target
- feat/issue 2636 legacy migration inventory
- test: add evidence-gated candidate-lane calibration mechanism
- test: route cases by impact and retire legacy routing sources
- test/issue 2637 port pure core cluster
- test: stub _notify_user in transport-neutral terminal-transition subshells
- test/issue 2639 host boundary cases

## v2.46.8 … v2.45.22 (2026-08-07)

### Features
- feat(test): add framework declaration contract
- feat(test): add portable declaration runner
- feat(ci): add advisory target matrix

### Fixes
- fix(test): resolve cross-platform contract profiles
- fix(relay): hard-fail Copilot composer residue
- fix(relay): recover pending composer in watchdog
- fix(relay): recognize Copilot working footer states
- fix(cli): fail closed when mat issue create loses body input
- fix(caucus): canonicalize linked-worktree callers via common root

### Refactors
- refactor(prompts): gate ticket capture and split escalation by necessity
- refactor(live): start every task direct and self-escalate to patch

### Other Changes
- ci(release): add workflow_dispatch as failsafe trigger
- ci(recovery): add workflow dispatch + local PR validator

## v2.45.21 … v2.44.0 (2026-08-06)

### Features
- feat(live): restore mode-selected execution
- feat(install): harden first install prerequisites

### Fixes
- fix(live): add result-only split verdict caucus path
- fix(caucus): hand off decomposed terminal cycles
- fix(test): forward verbose reporter through Docker
- fix(backends): make high the default effort
- fix(live): reset stale policy on supervisor cold start
- fix(live): guard patch commits on default branch
- fix(live): route Baton result-only caucus through callback
- fix(caucus): persist Baton no-callback result artifacts
- fix(duo): document terminal abort handoff receiver
- fix(test): use portable sed for fixture source-sync lint self-check
- fix(live): reject cross-driver cold start before clobbering foreign policy
- fix(live): resolve combined git-dir/work-tree options as one repository in patch commit guard
- fix(render): resolve MAT_DRIVER=baton to a headless include fragment
- fix(bg-run): route bare tmux calls through the _mat_tmux gateway
- fix(relay): send-verify Stop hook suppresses UNDELIVERED nudge while target pane is busy

### Refactors
- refactor: remove obsolete tmux keeper

### Other Changes
- test: guard copied runner fixture dependencies
- ci(windows): batch-1 group-B — fix install/symlink/migration tests
- quality/issue 2485 bg run dedupe
- defect(team): gate planner ticket-boundary rebirth, de-duo peer-failure notify
- defect(install): expand 8.3-short ancestors before first-install target exists
- test(lint): allow-list mktemp -u and 2>/dev/null in mktemp-site scan
- quality/issue 2594 baton decomposed boundary
- test(audit): extend tmux helper reap settle window

## v2.43.3 … v2.40.48 (2026-08-05)

### Features
- feat(ticket): gate decomposable issues behind split caucus
- feat(caucus): gate oversized plans before review
- feat(test): add compact run_test reporter

### Fixes
- fix(cli): preserve consult approval example in help
- fix(test): preserve apostrophes in shell-token assertions
- fix(ci): split required test lanes
- fix(stall-watchdog): scope stale reminders to candidate pane
- fix(test): preserve apostrophes in path sequences
- fix(test): preserve leading apostrophes in shell tokens
- fix(stall-watchdog): reset stale human waker result
- fix(test): share shell token normalization
- fix(audit): retry failed wake delivery before watchdog recovery
- fix(test): detect Windows Git Bash without MSYSTEM
- fix(review): distinguish productive iteration from churn
- fix(audit): retry unconfirmed wake deliveries
- fix(ticket): make split verdict role aware
- fix(caucus): retire decomposed split trackers
- fix(test): stabilize audit poll local wake fixture
- fix(audit): report local poll wake outcomes
- fix(tests): detect Windows tar paths from uname
- fix(relay): tolerate idle CPU accounting noise

### Other Changes
- test(helpers): split literal and shell-token assertions
- test(helpers): fold Windows shell-join quotes into assert_contains_paths
- test(scrub-env): blank MAT_CONFIG_ROOT so tests stay hermetic on hosts with a real mat install
- test(windows): pin mktemp -d root to a fixed, account-independent path

## v2.40.47 … v2.37.0 (2026-08-04)

### Features
- feat(live): require branch, local quality gates, and CI-gated PR merge
- feat(bg-run): add the Baton task submission adapter
- feat(bg-run): consume Baton task callbacks into wakes and results
- feat(bg-run): integrate Baton task lifecycle and headless support
- feat(ci): watch nightly full-suite failures

### Fixes
- fix(install): keep Git Bash working-tree rsync paths local
- fix(baton): read summon-devops brief from state file on empty stdin
- fix(platform): preserve single-letter POSIX PATH entries
- fix(bg-run): retain callbacks during metadata race
- fix(baton): re-arm bg-run reconciliation after role restart
- fix(runtime): fail closed on backend contract violations
- fix(rebirth): clear supervised terminal surfaces
- fix(review): hard-gate red CI Required checks
- fix(test): remove unsupported baton service log option
- fix(bg-run): retry terminal delivery after send failure
- fix(ci): restore green required baseline
- fix(team-baton-harness): pin bg-run lifecycle to Baton
- fix(bg-run): recover terminal envelope after wake publication
- fix(test): restore service-owned duo Baton harness
- fix(bg-run): recover terminal wake from durable result
- fix(audit): resolve OpenCode audit state home
- fix(opencode): mark startup relay files
- fix(audit): prefer OpenCode native audit home
- fix(guard): stop branch scans at command boundaries
- fix(opencode): preserve caucus startup-file semantics
- fix(bg-run): reject cross-session callback pane IDs
- fix(guard): preserve branch scan across nested substitutions
- fix(opencode): provision role skills in native root
- fix(guard): allow attached branch option values
- fix(guard): allow attached branch filter patterns
- fix(relay): keep watchdog polling off busy duo panes
- fix(guard): preserve branch filter mode across display options
- fix(guard): allow filtered branch substitutions
- fix(relay): sample supervised backend process trees
- fix(relay): support Darwin CPU idle sampling
- fix(relay): detect Copilot working panes with composer
- fix(relay): scope Copilot busy marker to Copilot panes

### Refactors
- refactor: make backend kinds self-registering and contract-checked

### Docs
- docs: align remaining Git Bash timeout references with 1200 s hang guard
- docs(cli): describe task-backed devops ownership in baton stop help
- docs(user-guide): list Pi and OpenCode launchers
- docs(baton): document devops ownership shapes
- docs(baton): scope devops artifact ownership
- docs(bg-run): separate hosting contracts
- docs(live): align help and deck delivery contract
- docs(relay): record detector matrix for
- docs(relay): reconcile detector matrix baseline

### Other Changes
- Merge remote-tracking branch 'origin/main'
- test(devops): pipe request fixture into worker without a temp file
- docs/issue 2422 reconcile live docs
- fix/issue 2434 baton bgrun reap artifacts
- test(dispatch): isolate idle teardown notifications
- fix/issue 2452 bg run terminal callback idempotent
- ci: route jobs by runner capability labels
- test(consult): split guard coverage into consult-guard-lane suite
- fix/issue 2498 relay poll ticker argv
- fix/issue 2502 watchdog idle gate

## v2.36.5 … v2.33.10 (2026-08-03)

### Features
- feat(ci): schedule Windows Git Bash coverage nightly
- feat(install): show the installed version in completion output
- feat(tmux): isolate private helper sessions on a dedicated socket

### Fixes
- fix(keeper): use portable resident pane command
- fix(keeper): resolve platform service paths to the real install root
- fix(consult): deny git push in write scope while allowing target commit
- fix(relay): resolve adhoc supervisor pane id from TMUX_PANE fallback
- fix(keeper): quote rendered systemd ExecStart for XDG paths with spaces
- fix(keeper): hand off resident supervisor on reinstall
- fix(keeper): encode UTF-8 systemd documentation paths
- fix(consult): surface quoted git executable in write-scope push guard
- fix(relay): resolve local supervisor pane fallback
- fix(keeper): preserve mat-keeper session during resident owner handoff
- fix(consult): preserve quoted argument context
- fix(keeper): preserve session across legacy handoff
- fix(consult): surface quoted executables behind command wrappers
- fix(keeper): preserve legacy session after stop timeout
- fix(consult): close env --split-string and unlisted-wrapper delivery bypasses
- fix(keeper): recover orphaned handoff session on keeper restart
- fix(consult): respect split-string command position
- fix(consult): normalize escaped env split-string payloads
- fix(consult): preserve env split-string metacharacters
- fix(keeper): preserve proof on stale cleanup failure
- fix(consult): inspect attached env shell carriers
- fix(keeper): fail closed on tmux query error during stale-handoff cleanup
- fix(keeper): fail closed on session enumeration errors
- fix(consult): keep env shell carrier inspectable past options and path-qualified shells
- fix(keeper): fail closed on registry-backed recovery enumeration errors
- fix(consult): parse shell options inside env -S carrier payload
- fix(consult): detect bundled shell command flags
- fix(consult): tokenize quoted env -S option values before carrier parse
- fix(headless): retain Claude session JSONL and correlate the trail
- fix(consult): inspect nonterminal bundled shell flags
- fix(consult): model GNU env -S \c terminator in the command normalizer
- fix(launch): clear the missing-CLI diagnostics on launch and teardown
- fix(codex): pass awk regexes via ENVIRON so backslashes survive
- fix(test): assert codex commandWindows against platform-resolved path
- fix(consult): inspect env split-string bypass forms
- fix(launch): keep terminal status 127 generic
- fix(consult): make env -S \c truncation quote-aware
- fix(install): bind completion version to install
- fix(consult): reassemble quote-spliced env -S payload for delivery guard
- fix(consult): resolve path-qualified env wrapper by basename
- fix(consult): parse env options before split-string carriers
- fix(pi): fail closed when role-guard helper cannot decide
- fix(codex): canonicalize Windows project-trust paths before launch
- fix(codex): emit commandWindows for PreToolUse guard hooks
- fix(consult): deny quote-spliced -c/script env -S carrier
- fix(consult): resolve git/gh executable by basename in role-guard delivery scans
- fix(consult): make basename delivery scanners follow command position
- fix(baton): own headless serves via host service, not detached process groups
- fix(codex): harden Windows trust provisioning tests
- fix(guard): mark delivery commands hidden behind Bash control flow
- fix(backends): warn when restricted roles lack guards
- fix(baton): preserve caucus topic and backfill seed through host service
- fix(baton): stop task-host service with session
- fix(opencode): configure live effort natively
- fix(codex): run Windows hooks through Git Bash
- fix(baton): seed caucus topic for challenger turns
- fix(guard): preserve quoted repository separators in delivery scans
- fix: select build agent for OpenCode live launches
- fix(codex): invoke Windows hooks via PowerShell call operator and propagate exit code
- fix(baton): route summon-devops helper through the host service task API
- fix: replace Windows-only test skips with form-insensitive assertions
- fix(doctor): make local-bin PATH and install-link checks Windows-form-safe
- fix(config): preserve mat backend registry inside isolated OpenCode roles

### Refactors
- refactor(codex): route all hook command objects through one builder

### Docs
- docs: document receiver-receipt confirmation contract
- docs: fix consult target-write example
- docs: qualify FAQ explore read-only boundary
- docs: align FAQ and example backend comment with supported kinds and effort fallback
- docs: list pi in all supported-backend entry points

### Other Changes
- chore(copilot): remove obsolete BYOK startup-prompt workaround
- test(consult): cover env split-string delivery guard
- fix/issue 2289 keeper handoff ownership
- fix/issue 2295 keeper legacy handoff migration
- fix/issue 2337 env s assignments
- fix/issue 2363 env S shell option terminator
- Merge remote-tracking branch 'origin/main'
- Merge remote-tracking branch 'origin/main'
- feat/issue 2368 audit supervisor
- chore(ci): refresh stale full-fallback throttle comments
- ci: make Windows Git Bash CI green
- Align scheduled CI with Auckland winter time

## v2.33.9 … v2.19.4 (2026-08-02)

### Features
- feat(skills): import Claude skills into role homes
- feat(codex): expose mat skills through custom prompts
- feat(tmux): prefix private poll/watchdog helper sessions with `_`
- feat(tmux): prefix private bg-run and reap sessions
- feat(relay): add handoff expectation state
- feat(consult): target write scope and the allowlisted-roots guard mode
- feat(consult): gate production actions behind approval
- feat(relay): provision receiver receipt hooks and capability markers
- feat(pi): port tmux-command-guard to the rendered role-guard extension
- feat(relay): resolve expectations in watchdog and Stop hook
- feat(baton): write delivery receipts on mailbox ingest
- feat(relay): add OpenCode backend kind
- feat(keeper): deploy the persistent MAT tmux keeper per platform
- feat(codex): honor auth_var for access tokens

### Fixes
- fix(async): own tmux-hosted helpers via server
- fix(ci): self-select changed suite files
- fix(cycle): preserve renewal kill backstop across tool-call cleanup
- fix(tmux): pin mat sessions to explicit A/B sockets, fail-closed test runner
- fix(poll): identify legacy supervisors by script argv
- fix(relay): require fresh tmux delivery observations
- fix(relay): recognize Claude spinner activity
- fix: keep systemd tmux expansion shell-safe
- fix(baton): terminate process groups with option terminator
- fix(relay): scope spinner detection to Claude panes
- fix(consult): restore caller-only backend env in tmux monitor
- fix(consult): deny remote PR delivery in write-scoped role guard
- fix(relay): preserve spaced handoff state paths
- fix(consult): transport write roots newline-delimited for Windows C:/tmp
- fix(consult): align role prompt with target write scope
- fix(consult): enforce action-scope ↔ target-write matrix
- fix(relay): read send-sentinel matches as complete paths
- fix(relay): clean failed receiver capability markers
- fix(baton): resolve non-duo path handoffs

### Refactors
- refactor(summon): extract the summon lifecycle into an internal path
- refactor(relay): rename send-tmux command and skill to send-relay

### Docs
- docs(prompts): document bg-run wake waiting rule
- docs: require native child blockers for umbrella trackers
- docs(consult): state read-only diagnose default in focused help + guard it

### Other Changes
- test(caucus): reuse regression fixtures
- test: reduce repeated adhoc regression fixtures
- test: reduce ticket critique reminder fixture overhead
- test: reduce repeated prompt override fixtures
- test: reuse mat-team regression fixtures
- test: reuse tg relay regression fixtures
- test(audit): remove fixed waits from regression suite
- test: keep delivery mock jq 1.6 compatible
- bug/issue 2170 restore mat skill isolation
- ci: use four test jobs on the active sydney runner
- test: wait for tmux listener pid attribution
- ops: bundle persistent MAT tmux service
- feat/issue 2182 consult domain lane
- Merge remote-tracking branch 'origin/main'
- feat/issue 2052 pi role guard
- ci: make Full test budgets advisory

## v2.19.3 … v2.9.14 (2026-08-01)

### Features
- feat(baton): surface crashed/stale baton sessions via mat baton manage --dead
- feat(backends): add MAT_ALLOW_UNGUARDED_ROLE escape hatch for guardless kinds
- feat(devops): add summon-devops CLI + async callback lifecycle
- feat(devops): wire the WIP-blocker summon-devops lane into delivery prompts
- feat(ci): classify test suites by execution role, fix fallback enumeration bug
- feat(codex): add send-verify stop hook backstop
- feat: add codex restricted role guard
- feat(hooks): port send-verify Stop-hook backstop to copilot
- feat(prompts): add hosting-gated baton lifecycle fragment for duo
- feat(codex): manage launch statusline defaults
- feat(codex): auto-trust launched worktrees before startup

### Fixes
- fix(baton): route mat baton send through the operator's scoped registry by default
- fix(baton): unify team status as standby/busy across mat agents, idle, and show
- fix(install): reword POSIX progress line "Swapping into" → "Installing into"
- fix(stall-watchdog): render configured user name in stall reminder
- fix(adhoc): wait for wake after child crash
- fix(tmux-send): classify window pane backend targets
- fix(ci): resolve Git Bash without pwsh
- fix(prompts): gate bg-run guidance on the hosting axis
- fix(duo-dev): resolve $SESSION/$LOCK before use
- fix(test): scope tmux-env-isolation probe kill to session, not server
- fix: make role-guard-codex.sh executable, register in CI taxonomy/router
- fix: guard agents against shared tmux teardown
- fix(copilot): honor auth_var for native Copilot GitHub login
- fix(codex): bypass startup hook review in mat launches
- fix: preserve refinement ownership during delivery handoff
- fix(relay): own non-audit pollers in tmux helpers
- fix(audit): own tmux-hosted pollers via the tmux server

### Performance
- perf(test): consolidate dev-ccw launch matrix in launcher variants suite
- perf(test): cache runner-fixture results in workflow-regression suite

### Docs
- docs(baton): align mat baton logs with operator-event-only contract
- docs(adhoc): state worktree-preservation contract driver-neutrally
- docs(baton): record executed tier-1/tier-2 acceptance results for
- docs: reconcile Copilot session-end support

### Other Changes
- Merge remote-tracking branch 'origin/main'
- Merge remote-tracking branch 'origin/main'
- fix/issue 2013 ci linux runner pool
- Revert "feat(backends): add MAT_ALLOW_UNGUARDED_ROLE escape hatch for guardless kinds"
- test(local-drivers): replace fragile set -m SIGINT reap idiom with SIGTERM
- test: remove pcon settle timing race
- bug/issue 2088 copilot rebirth
- test: isolate Windows scratch-path stubs
- fix/issue 2090 summon devops reply routing
- feat/issue 2114 countable skips
- ci: enable nightly schedule for ci-full.yml
- test: build headless-agent-cli sandbox once per suite, not per case

## v2.9.13 … v1.95.0 (2026-07-31)

### Features
- feat(backlog): add mat backlog delivery-queue view
- feat(relay): add _mat_pane_idle_sustained byte-identity pane-idle predicate
- feat(relay): mid-cycle stall watchdog — nudge delivery agent on premature idle
- feat(live): advisory commit-reflection hook — challenge 治标/治本 before turn end
- feat(install): distinguish atomic-swap vs mirror-fallback in Git Bash progress output
- feat(relay): Stop hook turn-end fast path for undelivered send_tmux handoffs
- feat(install): delete vestigial mat-gitbash launcher fork
- feat(relay): arbitrate the tmux default socket before creating a session
- feat(relay): repair a stranded tmux socket via a keeper hardlink
- feat(baton): detect a session stalled before dispatch can route it
- feat(test): parallelize serial lane by default
- feat(test): add changed suite runner
- feat(codex): default service_tier to standard, never priority
- feat(test): isolate agent test runs in Docker
- feat(statusline): reinstate direct-Anthropic 5h/7d usage fetch for no-gateway native backends

### Fixes
- fix(adhoc): slim SessionEnd hook to stay under Claude's 1.5s budget on Git Bash
- fix(relay): sample pane idleness for cycle gates
- fix: exclude calling dev pane from duo gate
- fix(gitbash): normalize path forms in ownership guard so live occupant is detected
- fix(dispatch): use domain-qualified launchctl kill for mat dispatch stop
- fix(supervisor): don't leak ambient startup file into no-handover child
- fix(relay): refuse restricted roles on backend kinds with no write guard
- fix(relay): reject stale file handoffs
- fix(baton): probe status with role-derived --max-runtime-ms, not baton's default
- fix(relay): detach pollers with setsid
- fix: generalize adhoc validation guidance
- fix(baton): exclude the caller's own role from _mat_baton_gate_check
- fix(baton): scope role worker env to the team's own repo_root
- fix(baton): dispatch the public gate-check verb to the baton gate on baton sessions
- fix(dispatch): archive_mailbox returns 0 on success regardless of log call
- fix(dispatch): surface dispatch_owned stamp failures instead of swallowing them
- fix(test): measure parallel-lane elapsed time from launch, not reap-wait
- fix: nest SessionEnd hook timeout
- fix(hooks): restore live commit hook execute bits
- fix: avoid false commit reflection markers
- fix(backlog): annotate blocked rows when open blockers fall outside fetch window
- fix: nudge stall watchdog after two quiet ticks
- fix: report keeper status for ghost sockets
- fix: share dispatch Windows path conversion
- fix: tolerate concurrent keeper socket repair
- fix(test): kill orphaned tmux server before _mat_helpers_cleanup rm's its owned tmpdir
- fix(ci): pin Windows Git Bash resolution

### Refactors
- refactor(platform): collapse Windows-detection predicates onto an internal path
- refactor(platform): collapse path-form converters onto _mat_path
- refactor(backends): delete unreachable kind-inference fallbacks and tuple-field kind allowlists
- refactor(session): collapse launch-quote/short-path boundary into named helpers
- refactor(backends): per-kind adapter files, declared arity/presence dispatch, no-kind-predicate lint
- refactor: unify native agent launch paths

### Docs
- docs(adhoc): drop private _mat_* symbol names from rebirth paragraph
- docs(backfill): use `mat backlog` for open-issue de-dupe instead of bare `gh issue list`
- docs(dispatch): include XDG_STATE_HOME in mailbox archive path expansion
- docs: mount git common dir in docker sandbox recipe for worktree checkouts

### Other Changes
- ci: make CI Full and CI Windows manual-only
- Merge remote-tracking branch 'origin/main'
- test(session-end-quit): scope fifo under mktemp -d dir
- Merge remote-tracking branch 'origin/main'
- Merge remote-tracking branch 'origin/main'
- feat/issue 1952 copilot write guard
- ci(required): pin required lane to [self-hosted, Linux, ARM64]
- Merge remote-tracking branch 'origin/main'
- fix/issue 1959 test tmux sandbox
- ci(required): add temporary switch to suppress full-suite global fallback
- Merge remote-tracking branch 'origin/main'
- test: replace test_short_native_path/test_launch_quote mirrors with semantic path assertions
- test(dispatch): cover Linux upgrade_refresh systemctl sequence
- Merge remote-tracking branch 'origin/main'
- test: remove real crash-backoff waits from adhoc local supervisor tests
- feat/issue 1990 statusline auto compact denominator
- test: mock gh in off-placeholder teardown case
- test(team-local): isolate supervisor reexec sentinel
- test: force archive_mailbox's trailing log call to fail
- test(dispatch): fix uid-dependent stamp-failure simulation in test 9
- ci: route an internal path changes to dispatch test suites

## v1.94.2 … v1.89.9 (2026-07-30)

### Features
- feat(backends): add per-backend context_window_size to control auto-compaction
- feat(dispatch): add single-repo baton dispatch daemon
- feat(dispatch): multi-repo config, per-repo auth, fleet tick, active-repo cap
- feat(dispatch): opt-in resident service hosting + mat dispatch control CLI
- feat(dispatch): idle-teardown of dispatch-owned baton sessions with mailbox archival

### Fixes
- fix(install): guard reg add/query against MSYS path-conversion on Git Bash
- fix(install): probe-then-fallback swap on Git Bash
- fix(test): apply --force-local to tar fallback in _test_rsync_stage_tree on Windows
- fix(test): make _mat_helpers_cleanup rm best-effort to stop EXIT-trap flake
- fix(test): make run.sh EXIT-trap rm best-effort to stop CI Full group2 flake
- fix(test): scope real-tmux sockets under TEST_TMPDIR via TMUX_TMPDIR
- fix(test): update run.sh cleanup-trap assertion for best-effort rm
- fix(dispatch): use HKCU Run key as Windows enablement probe; document crashed-stale cap contract
- fix(relay): adhoc renewal can't reap backend on Git Bash local driver (no tmux)

### Other Changes
- test(install): assert exit 0 on PyYAML soft-warn paths
- Merge remote-tracking branch 'origin/main'
- Merge remote-tracking branch 'origin/main'
- Merge remote-tracking branch 'origin/main'
- Merge remote-tracking branch 'origin/main'
- feat/issue 1915 devops role worker

## v1.89.8 … v1.83.0 (2026-07-29)

### Features
- feat(baton): baton status liveness -> gate-check + rebirth (reclaim + restart)
- feat(baton): cycle-scoped backstop + new-cycle reclaim-idempotency
- feat(status): surface baton-hosted sessions in mat agents + --json
- feat(baton): operator-facing inspect and control primitives for live baton sessions
- feat(baton): interactive session chooser/manager for headless baton sessions
- feat(windows): install tg-relay as HKCU Run key autostart on Windows Git Bash
- feat: add -a/--autostart and --no-autostart flag aliases

### Fixes
- fix(test): scope MAT_SESSION_TMP_DIR per test script to end the shared-cubby-root flake
- fix(baton): add dev/developer guard variants for team cross-kind send
- fix(baton): remap dev→developer for team reviewer send path
- fix(test): reap serve PGID in test_baton_restart_role_updates_state_file
- fix(status): correct inverted team-baton backend key names in agent discovery
- fix(baton): write restart-partial event on partial role restart failure
- fix(test): widen lint glob to test/*.sh so mat-launch-*.sh and mat-backend-*.sh are covered
- fix(startup): use transport-neutral language in _mat_next_work_gate_reason
- fix(install): soften PyYAML check to a warning with platform-specific hint
- fix(pcon): settle WinPID after exec-replace; propagate kill failure to prevent stale handoff
- fix(baton): route cycle counter lock through an internal path
- fix: accept Windows-absolute --repo paths in both launchers
- fix(install): distinguish Windows python3 app-execution-alias stub from missing PyYAML
- fix(doctor): distinguish Windows python3 app-execution-alias stub from missing PyYAML
- fix(startup): add driver-dispatch-ok sentinel to _mat_next_work_gate_passes

### Refactors
- refactor(test): write local-driver state fixtures in one write
- refactor(baton): consolidate duplicate per-kind session_alive/worktree_owner/teardown bodies
- refactor(poll): extract _mat_local_state_scan_type to deduplicate four local-driver discovery loops

### Docs
- docs(baton): update docs to reflect team baton is shipped (PR)
- docs(baton): update driver-dispatch-inventory to reflect team baton routing
- docs(baton): add team to baton manage help and user-guide listing
- docs(doctor): add Windows relay-unit sub-checks to mat doctor section

### Other Changes
- test(next-work): cover baton driver dispatch in _mat_next_work_gate_passes
- test(new-cycle): unit tests for re-delivery idempotency paths
- test: add unit tests for _mat_baton_team_worktree_owner
- test: add doctor_test.sh coverage for Windows relay-unit branch

## v1.82.2 … v1.76.0 (2026-07-28)

### Features
- feat(doctor): detect Windows /tmp mount divergence
- feat(test): enforce per-script time budget in run.sh
- feat: mat scratch — one cross-platform scratch-path idiom
- feat(runtime): give each logical session one /tmp cubby and reap it on close
- feat(next-work): opt-in caucus --backfill before poll
- feat(baton): add team send-engine, role→mailbox registry, and hub-and-spoke firewall
- feat(baton): add team baton workers, wake wiring, and driver dispatch

### Fixes
- fix(test): add EXIT trap for GIT_CONFIG_GLOBAL mktemp in helpers.sh
- fix(caucus): reap backends via native winpid on Git Bash
- fix(adhoc): gate crash-recovery arm on session intent, not child intent
- fix(hooks): soften ticket-critique edit reminder to conditional wording
- fix(baton): poll serve liveness after spawn, fail fast on immediate exit
- fix(audit): clear TMAT_PANE/TMUX/TMUX_PANE before execing local audit supervisor
- fix(prompt): drop stale cold-start comparison from adhoc Incoming rebirth
- fix(ticket-critique): join shell-continuation lines before splitting segments
- fix(tests): guard --force-local behind MSYSTEM check in release-regression.sh
- fix(test): match fixture function names literally
- fix(test): include _mat_doctor_check_tmp_mount in doctor coverage lint
- fix(tests): replace GNU find -printf with POSIX -exec basename in pwsh regression
- fix(ci): recalibrate stale soft budgets on current Linux runners
- fix(test): add GIT_CONFIG_GLOBAL cleanup to 12 scripts that override helpers.sh EXIT trap
- fix(cycle): route self-reap through _mat_renewal_reap_target in context_renewal, mat_respawn, team_context_renewal
- fix(relay): extract handover startup directive to single helper
- fix(baton): check liveness before sleeping in serve_role poll loop
- fix(runtime): migrate _mat_baton_caucus_state_file to cubby layout
- fix(pane-mode): add pcon native-child cleanup to else-branch launch script
- fix(ci): restore Windows workflow YAML validity
- fix(test): provision session-temp root in explore-local regression tests
- fix(test): align local-driver CI fixtures with the cubby runtime contracts
- fix(test): clean GIT_CONFIG_GLOBAL in 8 more scripts that override helpers.sh EXIT trap
- fix(ci-windows): correct jq digest check and throttle leg to 1-in-10
- fix(ci-windows): move %10 throttle to a bash gate, verify-first
- fix(pcon): extend MAT_PCON_CHILD_IMAGES default to cover codex backend
- fix(worktree): wire baton caucus owner into worktree owner discovery
- fix: repair CI red — adhoc-local test staleness and relay-poll ticker teardown race
- fix(ci): use RUNNER_TEMP instead of /tmp for selected-suites.txt
- fix(test): normalise mktemp tmpdir to POSIX form on Windows Git Bash
- fix(ci): repair role-guard EPIPE flake and add manual CI Full dispatch
- fix(test): pin $! to the poller in relay-poll launch sites; revert ticker trap
- fix(hooks): eliminate printf|grep -q EPIPE/pipefail race in Bash guards
- fix(relay): reap orphaned countdown ticker on early TERM in _relay-poll
- fix(relay): restore glob in caucus session match pattern
- fix(baton): wire team worktree owner into worktree guard

### Refactors
- refactor(cycle): extract _mat_renewal_reap_self to deduplicate 5 reap blocks

### Docs
- docs(ci): document per-script soft time budget in an internal document
- docs(user-guide): add PyYAML check to mat doctor enumeration
- docs: fix two stale claims in an internal document baton section
- docs(ci): document test/run.sh temp scoping as the isolation mechanism
- docs: document .github/docker/Dockerfile as a retained local repro sandbox
- docs(baton): spec the operator model for the baton session manager

### Other Changes
- chore: remove prompt-profile registry (dead code since)
- feat/issue 1497 baton caucus
- fix/issue 1773 gh issue helper yaml
- fix/issue 1774 ci windows prereqs
- test(hooks): pin edit-path reminder delivery channel in ticket-critique-reminder
- test(scratch): add CLI dispatch tests for mat scratch verb
- bugfix/issue 1780 supervisor basename cubby
- test: extract shared _mock_gh_with_empty_api helper
- Merge remote-tracking branch 'origin/main'
- Merge remote-tracking branch 'origin/main'
- ci-windows: port the decide-job pattern for the 1-in-10 throttle
- Merge remote-tracking branch 'origin/main'
- ci: split Linux PR checks into required fast lane and advisory full lane
- ci-full: throttle the advisory full lane to 1-in-2 via a decide job
- Merge remote-tracking branch 'origin/main'
- Merge remote-tracking branch 'origin/main'
- Merge remote-tracking branch 'origin/main'
- test: add worktree_test.sh integration tests for baton caucus and duo arms of _mat_assert_worktree_unowned
- Merge remote-tracking branch 'origin/main'
- Merge remote-tracking branch 'origin/main'
- Merge remote-tracking branch 'origin/main'
- ci: bump actions/setup-node v4 -> v7 to drop the Node 20 runtime warning
- Merge remote-tracking branch 'origin/main'
- Merge remote-tracking branch 'origin/main'

## v1.75.2 … v1.71.7 (2026-07-27)

### Features
- feat(ci): replace round-robin partition with LPT; reduce GROUP_COUNT 4→2
- feat(ci): remove serial build-image dependency from resolve-groups
- feat(adhoc): honor operator /exit via SessionEnd sentinel
- feat(lint): guard against all_scripts / workflow-regression.sh fixture drift

### Fixes
- fix(audit): refresh slot worktree to origin tip on every wake
- fix(statusline): compact the runtime version-skew marker
- fix(agent-cli): pin CLAUDE_CODE_GIT_BASH_PATH on Git Bash for the Bash tool
- fix(session): single-quote each arg in _mat_shell_join on Windows
- fix(test): replace socket-wait loop with per-entry unique socket names
- fix(copilot): tmux send-keys prompt delivery as BYOK `-i` workaround
- fix(bg-run): give each wake event its own immutable path
- fix(no-sleep-poll): block bg-run result-file wait loops
- fix(ci): correct Windows runner variable name RUNNER_GITBASH → RUNNER_WINDOWS
- fix(explore): ownership-check snapshot teardown to prevent inherited MAT_EXPLORE_SNAPSHOT from deleting a live worktree
- fix(prompt): gate mat next-work startup on bare seed receipt
- fix(test): update workflow-regression assertions for containerless CI
- fix(test): replace HERE-doc pipes with mktemp files in gh-issue-helper tests
- fix(tests): use path-form helpers for Windows Git Bash compatibility
- fix(hooks): mark ticket-critique-stop/clear as executable (100755)
- fix(install): pwsh shadow forwarders cover every an internal path command, not just mat + modes
- fix(tests): wrap mat-duo path assertions in test_short_native_path

### Refactors
- refactor(baton): drop _mat_baton_state_get for the shared _mat_local_state_get
- refactor(ci): replace container isolation with scoped HOME/TMPDIR in run.sh

### Other Changes
- test: isolate suite from ambient global git config
- fix/issue 1641 harness timeout reporting
- test: assert pcon pidfile vs reaper-addressable pid, not $$
- test: guard python3 liveness against the Windows MS-Store stub
- test: make run-jobs default-path test Git Bash-aware
- hooks: dedupe ticket-critique reminder per turn + Stop backstop
- fix/issue 1659 no startup poll arm
- gate: drop obsolete repo-wide 'relay PR in flight' gate (rc-5)
- fix/issue 1667 local driver pid identity anchor
- test(lint): add sentinel'd == "baton" case to sanctioned-forms test
- ci: add Windows Git Bash test workflow (test-windows, non-blocking)
- Merge pull request from SHUKE-LABS/ci/windows-runner
- test: split run.sh into serial + parallel lanes so JOBS can rise above 1
- test(install): split 2562-line monolith into 7 topical suites, install once per script
- Merge remote-tracking branch 'origin/main'
- Merge remote-tracking branch 'origin/main'
- test/issue 1693 mat backend helpers fixture hoist

## v1.71.6 … v1.69.0 (2026-07-26)

### Features
- feat(copilot): seed trustedFolders per role home before launch
- feat(copilot): provision managed settings.json footer block
- feat(install): add pwsh shadow wrappers for mat and the mode verbs

### Fixes
- fix(copilot): bootstrap GitHub login via MAT_COPILOT_GITHUB_TOKEN
- fix(relay): strip trailing CR from resolved prompt-profile name
- fix(claim): rollback unverifiable claim attempts and abort sweep
- fix(relay): stop masking non-codex non-submit as delivered
- fix(relay): split dir creation from mode hardening

### Docs
- docs(user-guide): MAT_DRIVER is an authoritative parent-shell env knob

### Other Changes
- feat/issue 1668 copilot setup terminal suppress
- ci: round-robin partition test matrix
- test: fix two Cluster A mechanisms in Git Bash test suite

## v1.68.6 … v1.63.2 (2026-07-25)

### Features
- feat: extract ticket self-critique into a skill and codify the ticket-opening flow
- feat: backend-neutral headless agent-CLI compatibility layer
- feat(baton): real native-agent bridge for the duo baton worker
- feat: add `mat doctor` — one read-only report of every unmet new-machine prerequisite
- feat: support Copilot backend provider types

### Fixes
- fix: shell-quote settings.json command paths
- fix: make the builtin default backend launchable out of the box
- fix: disclose and report mat's takeover of ~/.claude/CLAUDE.md
- fix: escape backticks in the _mat_usage heredoc so mat help renders clean
- fix(tmux): address windows and panes by id, not literal :0/:0.0
- fix(tests): replace per-script tmux/rsync guards with shared helpers
- fix: resolve lock ownership from host-local evidence, not tmux visibility

### Docs
- docs: restructure an internal document on an install→launch spine, with code reconciliation
- docs: correct the user-guide skills-build clause
- docs: replace shipped-default ~/.claudew-* with ~/.claude-* in two active pages

### Other Changes
- feat/issue 1603 umbrella tracker label
- feat/issue 1608 refuse weak tier explore audit
- feat/issue 1609 ticket critique reminder hook
- fix/issue 1612 launch failure report
- fix/issue 1634 gitbash ulimit abort
- fix/issue 1619 mat driver split
- chore: ignore .playwright-mcp/ runtime artifacts
- Merge remote-tracking branch 'origin/main'
- fix/issue 1622 explore rebirth guard

## v1.63.1 … v0.153.0 (2026-07-24)

### Features
- feat(next-work): auto-adopt a cleanly-mergeable orphan relay PR
- feat(respawn): rename /newtopic → /respawn and extend to adhoc
- feat(relay): surface mat runtime version skew
- feat(self-critique): catch false open-questions in ticket critique
- feat(lb): retrieval builtin — forward-walk supersede across both archives
- feat(logbook): one-time til→framework archive migration (semantic rebuild)
- feat(release): make version encode cumulative feature count
- feat(claude-config): pin autoCompactEnabled: true in settings payload
- feat(driver): promote mat.driver=baton to accepted resolver value
- feat(driver): pluggable wake source in the cycling-worker supervisor
- feat(driver): wire baton transport for non-tmux duo

### Fixes
- fix(adhoc): support /wrapup --continue doc-seeded context renewal
- fix(duo): gate reviewer self-rebirth on successful Dev rebirth
- fix(relay): supervisor self-re-exec at rebirth boundary to close version skew
- fix(refine): exempt caller's own lock from the refining reciprocal guard
- fix(refine): key refining self-exemption on the session slot lock

### Docs
- docs(wrapup): treat trailing text as operator directive, not source

### Other Changes
- test(driver): audit mat.driver dispatch + static enum-coverage guard

## v0.152.0 … v0.146.6 (2026-07-23)

### Features
- feat(launch): mark agent arity in the Starting <Mode>… line
- feat(explore): add /newtopic skill — clean respawn at the per-topic boundary
- feat(handover): persist /handover docs to a durable by-project git archive
- feat(wrapup): builtin sibling of handover sharing persist + respawn
- feat(next-work): carry gate-deferral reason in poll directive
- feat(next-work): alert on orphaned relay PR wedging the delivery gate

### Fixes
- fix(launch): bind personal-override marker to XDG source group only
- fix(explore): refresh snapshot on rebirth and warn on runtime version skew
- fix(mat): refuse explore-claim / issue refining on a delivery-claimed ticket
- fix(team): stop team-rebirth-pane silently skipping on a stale child-pid file
- fix(team): confirm child-pid identity before reap in team_rebirth_pane
- fix(team): owner-scope the supervised child-pid file to close stale-publish
- fix(relay): resolve session via MAT_SESSION_NAME on local driver in startup.sh
- fix(local): reap real native claude.exe winpid on Git Bash renewal
- fix(session): compose hostname with operator's status-left instead of clobbering it

### Refactors
- refactor(relay): converge session resolution onto _mat_resolve_session + add session-resolve lint
- refactor(review): make the reviewer boundary absolute, guard-backed, prose-lean
- refactor(review): judge CI outage by reasoning, not the CI_ENABLED metric alone

### Other Changes
- refactor/issue 1558 fold merge guard

## v0.146.5 … v0.144.2 (2026-07-22)

### Features
- feat: stamp pane title with issue number at claim time (mat next-work)
- feat: add test soundness as a merge-orthogonal review dimension

### Fixes
- fix: stop false UNDELIVERED nudge after delivered+processed handoff
- fix: enable systemd linger so tg-relay persists without a login session
- fix: match lifecycle labels case-insensitively
- fix: anchor ticket self-critique gate to create/edit action
- fix(profile): fork runtime home on non-personality fragment overrides

### Refactors
- refactor(explore): reframe opening as responsibility, trim hook-enforced prose

### Other Changes
- feat/issue 1516 deterministic boundary renewal

## v0.144.1 … v0.140.9 (2026-07-21)

### Features
- feat: add `mat --version` with a tag-derived VERSION stamp
- feat: quiet per-launch progress to a single `Starting <Mode>…` line; add --verbose
- feat: add mat.autoRefine switch to disable delivery-agent auto-refinement
- feat: add default-empty shared/local-issue-rules.md operator extension point

### Fixes
- fix: filter MSYS git-bash fork noise from PreToolUse hook stderr
- fix: mirror install payload in place on Git Bash so reinstall survives a running fleet
- fix: fold quiet-launch prompt-override notices into one clean line + prompt source
- fix: collapse local-driver launch to one line with Using: source list

### Docs
- docs: add canonical mat.* config reference + thin scattered precedence prose

### Other Changes
- test: scrub inherited MAT_AUDIT_SESSION in scrub-env.sh

## v0.140.8 … v0.139.4 (2026-07-20)

### Features
- feat(relay): auto-manage the tg-relay launchd LaunchAgent on macOS

### Fixes
- fix: fail fast on bash < 4.3 in install.sh
- fix(relay): flush Claude Code composer instead of falsely confirming stuck sends
- fix(audit): sweep stale /tmp/audit-wake-*.md before minting new wakes
- fix(live): align /handover rebirth with explore's load-then-wait directive
- fix(supervisors): surface unexpected backend crashes in explore/live/team/caucus

### Docs
- docs: add macOS quickstart with launchd resident-relay recipe
- docs: drop stale install.sh line cites in an internal document
- docs: drop stale install.sh:205 / mat-launcher:43 line cites in quickstart-macos.md
- docs: add buyer-facing FAQ and wire buyer docs into README

### Other Changes
- ci: run license-gate Worker tests in CI

## v0.139.3 … v0.133.4 (2026-07-19)

### Features
- feat(relay): migrate team/duo pane rebirth to the supervisor-leaf pattern
- feat(caucus): /handover support — single-authored joint rebirth
- feat(caucus): add --backfill for self-directed backlog grooming
- feat: redefine INSTALL_ROOT/VERSION as install-time git commit sha
- feat: build, commit-stamp, publish, and register the gated release tarball
- feat: channel-B first install from extracted LemonSqueezy payload

### Fixes
- fix(relay): escalate local-driver renewal to detached SIGKILL
- fix(install): copy tg-relay unit instead of symlinking to survive systemctl disable
- fix: make supervisor-leaf adhoc idle/rebirth look alive, not like a crash loop

### Docs
- docs(user-guide): document caucus --backfill and mat.backfillMaxTickets
- docs: scope Windows Git Bash as best-effort for commercial install

### Other Changes
- test(relay): guardrail against bare self-identification display-message queries
- test(relay): widen self-id lint guard to long-form pane tokens
- chore(constitution): default ticket Out-of-scope to one fixed sentence
- fix/issue 1453 explore rebirth wait
- feat/issue 1442 license worker
- docs/issue 1458 quickstart linux

## v0.133.3 … v0.130.3 (2026-07-18)

### Features
- feat(relay-poll): show mm:ss countdown in pane title while idle-polling
- feat(issue): add `mat issue create` with auto label-ensure + --repo
- feat(harness): add GitHub sandbox SUT seed/reset path to setup-sut.sh

### Fixes
- fix(install): self-heal tg-relay.service on launch when manager was unreachable
- fix(agents): dedup tmux-hosted live session via TMUX_PANE fallback in supervisor state write
- fix(explore): fall back to shared checkout when origin fetch fails
- fix(relay): separate explore refine-holds into explore-lock namespace
- fix(audit): run audit in its own dedicated worktree, not shared repo_root
- fix(cycle): advance repo_root to origin/<default> after each merge
- fix(send-tmux): reject self-send at the interactive entrypoint
- fix(test): scrub inherited host-specific relay tokens in scrub-env
- fix(relay): anchor send_tmux self-send guard on $TMAT_PANE
- fix(relay): exempt /clear from send_tmux self-send guard

### Docs
- docs(tg-relay): add linger persistence note and 'chat not found' troubleshooting entry
- docs(agents): propagate ergonomic `mat issue block` into ticket-authoring constitutions

### Other Changes
- chore: retire an internal path back-compat alias
- test(team): scaffold non-tmux team-mode acceptance harness
- docs/issue 1406 mat issue create default
- feat/issue 1413 explore claim default lock

## v0.130.2 … v0.129.2 (2026-07-17)

### Features
- feat: unify worktree opt-out as mat.enableWorktree with cross-mode conflict guard

### Fixes
- fix(explore): stop teardown orphaning a snapshot worktree registration

### Docs
- docs: sharpen self-critique-ticket bullet 2 into root-cause-vs-symptom check

### Other Changes
- chore(stance): add proactive-resolution and assume-user-busy priors
- chore(preamble): default to acting on own judgment over deferring

## v0.129.1 … v0.126.3 (2026-07-15)

### Features
- feat(agents): add shared agent-identity preamble across all relay roles
- feat(live): supervised /handover + /wrapup --continue context renewal
- feat(explore): run in-repo explore on an ephemeral origin/<default> snapshot

### Fixes
- fix(tg-relay): require a per-host token, remove the shared-token fallback
- fix(relay): auto-detect undelivered send-tmux handoffs
- fix(audit-poll): heartbeat-check liveness during the long sleep
- fix(skills): reconcile real, unmarked skills dirs instead of skipping
- fix(next-work): exclude refining items from the resume selection

### Refactors
- refactor(agents): concision pass on adhoc/duo-dev constitutions

### Docs
- docs(agents): warn live/explore to pass gh --repo for cross-repo issues

## v0.126.2 … v0.124.6 (2026-07-14)

### Features
- feat(audit): make audit poll cadence per-repo via mat.auditPollMinutes
- feat(prompts): add Windows scratch-file rule fragment (use C:/tmp, never /tmp across tools)

### Fixes
- fix: quote worktree-root prefix strip so glob metachars in root parse correctly
- fix(poll): list local-driver audit sessions in mat an internal path
- fix(pane-title): quote prefix-strip operands so glob-metachar roots yield short prompt_name
- fix(next-work): fall through to refine when the ready gate fails
- fix(tg-relay): surface getUpdates 409, guard singleton, heal enable drift

### Refactors
- refactor: extract shared dependency-edge prologue for issue block/unblock
- refactor: extract shared per-skill link/copy-fallback helper
- refactor: extract shared child-reap + supervised-launch helpers for local supervisors
- refactor: extract shared watchdog grace-recheck loop

### Performance
- perf(statusline): cache rendered usage suffix; drop per-render forks

### Docs
- docs: add mode token to stale session-name examples, fix caucus role name

### Other Changes
- test: cover bg-run minute/hour duration conversion and minute defaults

## v0.124.5 … v0.121.1 (2026-07-13)

### Features
- feat(skills): add operator skills overlay to complete config symmetry
- feat(prompt): announce personal prompt override outcome at role-prompt render
- feat(prompt): add comment/doc-hygiene self-critique rule, collapse duplicated disclosure obligation

### Fixes
- fix(telegram): pass message body to curl via temp file to preserve CJK on native-Windows
- fix(relay): default TMAT_PANE from TMUX_PANE so agents self-identify per-pane
- fix(prompt-profile): normalize both operands in built-in/XDG profile checks
- fix: protect explore session locks from stale-lock reaper

### Docs
- docs: scope subagent XDG-skip claim to personalPromptOverride=false
- docs(caucus): mandate a neutral topic brief at the convener authoring step

## v0.121.0 … v0.116.1 (2026-07-12)

### Features
- feat: LemonSqueezy entitlement client + url-fetch install mode
- feat(agents): let live capture incidental out-of-scope discoveries as tickets
- feat(notify-user): prominent ACTION marker for messages that need shuke to act
- feat(mat-issue): add block/unblock for native GitHub dependencies
- feat(session): show short hostname centered in tmux status line

### Fixes
- fix: self-heal missing ready/refining/blocked workflow labels
- fix: ship gh-issue-comment-file as a PATH binary
- fix(user-config): flip personalPromptOverride default to opt-in (false)

### Refactors
- refactor: rename mux command/namespace to mat with config migration

## v0.116.0 … v0.114.8 (2026-07-11)

### Features
- feat(hooks): add advisory shell-quoting PreToolUse guard
- feat(agents): per-role prompt size ceiling + reconcile-and-trim rule

### Fixes
- fix(caucus): stop proposer double-forwarding the --topic-file topic
- fix(hooks): stop no-sleep-poll steering to the disallowed Monitor tool

### Refactors
- refactor(hooks): extract shared Bash-command normalizer

## v0.114.7 … v0.112.2 (2026-07-10)

### Features
- feat(relay-poll): log lifecycle + exit reason to poll log
- feat(caucus,explore): land spec-shaped ticket bodies without manual cleanup

### Fixes
- fix(relay-poll): reduce idle-poll interval to 10m and sync notify text
- fix(relay-watchdog): size detection cadence to the 10m poll interval
- fix(audit-watchdog): bound dead-session exit and missing-poller recovery to minutes
- fix(tmux teardown): replace per-session session-closed hooks with one global dispatcher
- fix(install): skip re-linking mux-managed per-role skills dirs
- fix(session): embed mode token in team/duo session names

### Refactors
- refactor(cycle): rename adhoc-new-cycle -> new-cycle, retire dead team/duo shims
- refactor(skills): own product skills location with version-gated rebuild

### Docs
- docs: add product-intro slide deck for my-ai-team

### Other Changes
- feat/issue 1255 claude superglobal guard

## v0.112.1 … v0.110.0 (2026-07-09)

### Features
- feat(cli): add --dry-run flag to preview session launches without executing
- feat(tg-relay): add structured observability to reply-index write and lock paths
- feat(roles): runtime write-guard for explore and audit sessions

### Fixes
- fix(satellites): append after last pane, focus satellite, fix layout
- fix(explore): alert before reattaching to existing session

### Docs
- docs(agents): sever team-mode Developer's direct operator channel

## v0.109.2 … v0.105.27 (2026-07-08)

### Features
- feat(caucus): self-teardown --topic-file sessions on conclusion
- feat(agents): caucus-first escalation path — two stages, planner/reviewer as convener
- feat(agents): anti-phantom-send guard for all relay consumers
- feat(prompt): add mux.personalPromptOverride toggle to disable drift-prone XDG overrides

### Fixes
- fix(duo): use even-horizontal layout so 2 panes render side-by-side
- fix(install): report accurate symlink-copy count on Git Bash
- fix(caucus): seed challenger with topic on --topic-file launch to prevent opening bounce

### Docs
- docs(agents): add maintainer README — prompts are executable constitutions, inlined shared content needs render-coverage tests
- docs: add sales demo script and seed caucus-trigger issue

## v0.105.26 … v0.105.10 (2026-07-07)

### Fixes
- fix(no-sleep-poll): scan shell-eval carrier payloads
- fix(cli): treat -h/--help as help request, not literal data
- fix(cli): extend -h/--help detection to agent-facing an internal path scripts
- fix(cli): treat -h/--help as help request in relay-poll scripts
- fix(install): manage tg-relay.service on every install, not just --with-systemd
- fix(tg-relay): quote Telegram message ids with 'No' not '#'
- fix(tg-relay): send setMyCommands payload as a bare array, not a wrapped object
- fix(audit): export MUX_AUDIT_SESSION so start-audit-poll re-arm fires
- fix(relay): mark path payloads with [relay] so post-/clear handoffs are not dropped
- fix(review): sanction reviewer plan-gate questions as changes-requested

### Refactors
- refactor(relay): remove the controller pane from team, duo, and adhoc modes
- refactor(relay): remove five dead functions (refactor leftovers)
- refactor(poll): honor poller-launch override in the standalone watchdogs
- refactor(agents): extract shared team/duo contract fragments

### Docs
- docs(adhoc): rewrite always-on-cycling.md to the post- local-driver contract
- docs: inline the five-directive next-work table in each role prompt

### Other Changes
- ci: route every job to the self-hosted runner

## v0.105.9 … v0.104.1 (2026-07-06)

### Features
- feat: rename qa mode to audit (hard cutover, no alias)

### Fixes
- fix(install): dereference symlinks in link_file copy fallback
- fix(statusline): strip CRLF from jq output before IFS read
- fix(relay-poll): use fixed 15-minute polling interval instead of backoff sequence
- fix(tg-relay): strip leading slash from setMyCommands command names
- fix(caucus): delimit topic header block by recognition not blank line
- fix(caucus): clean up --topic-file startup file on close and failed start
- fix(caucus): side-by-side layout, proposer focused on attach

### Refactors
- refactor(cli): remove retired-verb rejection and unrestricted tmux passthrough
- refactor(cli): remove deprecated 'raw' alias for live
- refactor(caucus): replace /topic skill with implicit topic intake

### Docs
- docs: restructure README as the project front door
- docs(README): describe implicit caucus topic intake, drop /topic

### Other Changes
- chore: two-word naming — audit is the mode, auditor is the agent

## v0.104.0 … v0.98.0 (2026-07-05)

### Features
- feat(relay): add watchdog to revive duo/team's skipped self-rearm
- feat(cli): honor --help/-h and mux help <verb> on every public verb
- feat(relay): enforce no-sleep-poll via PreToolUse hook in every agent home
- feat(agents): wire bg-run into validation fragment for all six roles
- feat(poll): idle relay poller wakes on refine candidates too
- feat(explore): give pane-mode explore a supervisor leaf so /handover works
- feat(mux): mux issue accepts --repo for cross-repo lifecycle

### Fixes
- fix(relay): resolve pane-mode target root via common root, not repo root
- fix(user-config): reject default_model/default_effort values containing colons
- fix(no-sleep-poll): make hook quote-aware to eliminate false positives and fix unspaced ps|grep
- fix(pane-mode): align stamp side with compare side using _mux_git_common_root
- fix(tg-relay): truncate raw text before escaping in audit preview
- fix(tg-relay): loud failure on control-command dispatch drift
- fix(supervisors): env-var overrides for poller/watchdog binaries to stop test stub bypass
- fix(cli): add focused --help for mux raw and mux config
- fix(no-sleep-poll): make quote stripper escape-aware for backslash-escaped quotes
- fix(user-config): reject nickname/config_dir/prompt_file values containing colons
- fix(tg-relay-tests): correct vacuous backslash-boundary fixtures to use real backslash
- fix(test): make run.sh exit code explicitly reflect failed counter

### Docs
- docs: update stale (qa)/(live) suffix descriptions to (role - nick - basename) format
- docs(session-modes): scope value-gate summary to filing vs promotion correctly
- docs: retire AGENTS.md content; make it a symlink to CLAUDE.md

### Other Changes
- test(tg-relay): cover XDG_STATE_HOME log-path default and 0700 dir creation
- test(explore): add e2e SIGTERM-driven respawn test for explore-context-renewal
- test(run.sh): cover process-leak-detection branch when suite already fails
- test(poll): isolate _MUX_EXPLORE_STATE_GLOB in discover-agent-panes tests
- feat/issue 1140 caucus mode

## v0.97.0 … v0.94.5 (2026-07-04)

### Features
- feat(explore): /handover skill + supervisor-based context rebirth
- feat(tg-relay): self-register /agents and /idle via setMyCommands on startup
- feat(qa): add watchdog to revive a skipped self-rearm

### Fixes
- fix(launcher): export MUX_MODE for every role in an internal path

### Refactors
- refactor(relay): collapse team/duo backend resolvers into _mux_resolve_backends
- refactor: run adhoc supervisor stty sane per child exit, not per idle tick

### Docs
- docs: dedupe session identity/locks explanation into an internal document
- docs(explore): keep issue bodies delivery-only, strip discussion history
- docs(self-critique): stop unverified "unrelated" dismissals and small-fix avoidance

### Other Changes
- feat/issue 1058 per backend default model effort
- test(cycle): cover _mux_run_merge_release rc=2 lookup-failure branch
- test(tg-relay): cover indexed-role pane defaulting and dead-pane refusal
- test(foreground): direct coverage for local-driver QA/explore/live launchers
- qa: add a value gate for strong-tier findings
- test(tg-relay): cover audit log escape, preview, sha256, line composition

## v0.94.4 … v0.92.22 (2026-07-03)

### Features
- feat(adhoc): retire mux next-loop for tmux driver; rebirth via supervisor
- feat: give QA mode its own shared/personality-qa.md fragment

### Fixes
- fix(statusline): render effort level verbatim instead of coercing to high
- fix(test): unset ambient MUX_USER_NAME in fallback-username test
- fix(poll): parse session name once per relay-poll (re)start
- fix(adhoc): guard local-driver worktree reuse against live sessions
- fix: reject unrecognized modes in mux mode-dispatch chain
- fix: lock _mux_persist_prompt_profile read-modify-write
- fix(relay): resolve duo reviewer pane backend to review, not dev
- fix: team/duo non-satellite launch prints session name for non-interactive callers
- fix: reject adhoc/qa "with" satellites under mux.driver=local
- fix: route live tokens through curl -K - stdin config, not argv
- fix: enforce primary-worktree adhoc singleton across drivers/backends
- fix: add .mux-root fallback to an internal path bootstrap via shared resolver
- fix: collapse tg-relay per-update extraction to one jq call
- fix: scan ps once per _mux_agent_status invocation
- fix: renumber adhoc-protocol Core rules list to close gap at item 10
- fix: escape backticks in mux help so it stops executing 'mux next-work'
- fix: apply native-Claude launch env via builtins, not env argv
- fix: add mux quota to help text output
- fix(gitbash): add duo mode token to mux-gitbash-launcher
- fix(adhoc): reap orphaned agent child when supervisor is killed
- fix(relay): enforce plan-forward dedup guard on live comment entrypoint
- fix: guard mux-launcher against bash <4.3, document the floor
- fix(docs): correct broken anchor to session-modes mux.driver section
- fix: teach worktree-ownership guard to detect live local-driver sessions
- fix: wire _relay_substantive_handoff_file into gh-issue-comment-file
- fix: gate-check reviewer-pane fallback branches on @mux_mode (duo=1, team=2)
- fix: enforce project-locality for explore/qa/live pane-mode
- fix: move tg-relay log out of /tmp into per-user state dir

### Refactors
- refactor: render only the runtime driver's branch via {{MUX_DRIVER}} includes
- refactor(relay): dedupe local-driver state helpers into shared _mux_local_* functions
- refactor(relay): dedupe team/duo session-start notify into shared _mux_notify_session_start
- refactor(qa): extract _mux_qa_session_name shared helper
- refactor: dedup team/duo worktree preparation into _mux_prepare_role_worktree
- refactor: dedup team/duo backend-cap validation + repo_root resolution
- refactor(session): extract stale-session reuse branch into shared helper
- refactor(quota): collapse _mux_quota_render_line to a single jq pass
- refactor(relay): collapse mode-templated worktree/slot helpers
- refactor(user-config): fast-exit _mux_load_user_config when env pre-set
- refactor(relay): memoize _mux_is_windows/_mux_resolve_driver process-invariants
- refactor: extract duplicated interruptible-sleep idiom into shared helpers
- refactor(next-work): reuse stale-lock scan's issue fetch to halve gh calls
- refactor(relay): memoize gh label create in lock/raw-report ensures
- refactor: extract shared fork/exec helper for native launch branches
- refactor: extract shared placeholder-branch resolution in cycle.sh
- refactor(test): extract shared gh label-state-machine mock
- refactor: thread group date into _release_flush_group
- refactor: extract single-backend dispatch into shared helper
- refactor: rename notify_shuke to notify-user; pane-local envelope
- refactor(relay): dedup cwd/repo-root resolution into _mux_resolve_launch_context

### Performance
- perf: collapse statusline.sh per-field jq calls into one pass per JSON doc
- perf: cache pane target in _tmux_send_literal_to_pane

### Docs
- docs(adhoc): fix pre- 3-segment worktree path in an internal path
- docs(install-topology): document built-in @include fallback tier
- docs: fix stale test/mux-regression.sh reference in CLAUDE.md
- docs(adhoc): fix false 'no pane' claim in rebirth-local for tmux-hosted adhoc
- docs: correct mux gitbash link target to mux-gitbash-launcher
- docs: add duo verb to user-guide Commands reference
- docs: align README QA cadence description with cycle-count model
- docs: correct MUX_NOTIFY persistence — env-only, not user.conf
- docs: surface adhoc --worktree/--no-worktree flags in mux help
- docs: correct an internal document Copilot-wiring contradiction
- docs: list duo-dev.md/duo-review.md as prompt-override filenames
- docs: stop attributing duo-dev rebirth to mux next-loop
- docs: add --worktree/--no-worktree to adhoc command synopsis blocks
- docs: document {{MUX_BACKEND_TIER}}/{{MUX_DRIVER}} @include path substitution
- docs(cli): list qa-state-dir verb in mux help output
- docs: add duo to MUX_NOTIFY suppressed session-start list
- docs: cite _tg_reply function instead of stale line number
- docs: drop stale user.conf removal-timeline framing
- docs(readme): drop stale install-time prompt-rendering claim

### Other Changes
- test(duo): cover session-start failure cleanup and start-notify
- test: cover Codex delivery-confirmation predicates in tmux-send
- test: cover mux remove-worktree's five error/validation branches
- test: cover _mux_merge_user_backend_entry default-nickname-override dedupe
- test: cover statusline.sh extra_usage=true rendering branch
- test: cover worktree prep linked/containment guards for duo and team
- test: cover _mux_reuse_or_fall_through return-code remap
- test: cover --worktree/--no-worktree adhoc CLI flag parsing
- test: cover mux qa-state-dir CLI dispatch wrapper
- ci: bump actions/checkout v4 -> v7
- test: cover _relay_issue_number_from_branch fallback path
- test: cover _mux_link_legacy_mode_credentials migration bridge
- test: cover format_tokens million-scale (m) branch and k/m boundary
- test(launcher): cover --repo flag error branches and success path
- test(launcher): cover duo-dev/duo-review role dispatch end-to-end
- test: cover satellite co-launch success path in single-backend dispatch
- fix/issue 1063 reply index prune paneid

## v0.92.21 … v0.92.2-beta (2026-07-02)

### Fixes
- fix(border): pad space before right-aligned locator so basename doesn't hug the border
- fix(duo-dev): inline start-relay-poll in poll directive so idle polling actually starts
- fix(relay): keep skills copy in sync on symlink-less platforms
- fix(relay): give role prompts a built-in @include fallback root

### Refactors
- refactor(relay): route all Developer↔Planner traffic through the Reviewer hub
- refactor: extract with-token arg-splitting into shared helper
- refactor(release): drop redundant '-beta' suffix from tags and plumbing

### Docs
- docs(review): correct diff base, batch merge flow, trim reviewer prompts
- docs(plan): trim planner prompt — dedup checklist/workflow, cut over-explained TG mechanics
- docs(adhoc): dedup rebirth mechanics to a single canonical spot
- docs(explore,qa): drop three redundant restatements
- docs: propagate the Reviewer-sole-hub topology into docs + strong-tier fragment
- docs: update pane-border section for basename+pane-id format
- docs(readme): add duo mode to session-mode overview
- docs: fix worktree paths to 4-segment layout in README + adhoc-protocol

### Other Changes
- Merge remote-tracking branch 'origin/main'
- Merge remote-tracking branch 'origin/main'
- Merge remote-tracking branch 'origin/main'
- Merge remote-tracking branch 'origin/main'
- Merge remote-tracking branch 'origin/main'
- Update document: switch to live-specific personality include
- fix Add shared personality-live configuration file
- test: cover duo-mode branches of cycle.sh dispatch helpers
- test: align live-mode personality assertion with personality-live include
- ci: send 1-in-6 ci.yml runs to self-hosted runner via run_number modulo

## v0.92.1-beta … v0.91.6-beta (2026-06-30)

### Features
- feat: pane border shows basename + pane id; drop pane id from agent chip

### Refactors
- refactor: retire next-run, split rebirth into mux next-work + mux next-loop

### Docs
- docs(test): document CI-as-root container gotchas in test/README.md

### Other Changes
- add .gitignore
- test: structural env-scrub so direct single-file runs are hermetic

## v0.91.5-beta … v0.90.0-beta (2026-06-29)

### Features
- feat: move issue-to-issue blocking onto GitHub native dependencies
- feat: canonical subagent templates + claude-kind native render

### Fixes
- fix(,): harden local-driver Dev against relay-poll spin and self-kill
- fix(test): default MUX_TEST_JOBS=2 on Git Bash to bound commit limit
- fix(qa): re-anchor _qa-local-supervisor:117 breadcrumb to mux-agent-launch:430

### Docs
- docs: an internal document walk-through + slim user-guide telegram section
- docs: remove dead bare-URL alias from next-run vocabulary
- docs(user-guide): document mux.autoStart opt-out in team auto-start section

## v0.89.6-beta … v0.88.0-beta (2026-06-28)

### Features
- feat(agents-short): add concision-rewritten prompt set for A/B test
- feat(agents-short): re-slim prompt set + add style-mirror include

### Fixes
- fix(gitbash): quote launch-script paths so backslashes survive execution
- fix(duo-dev): re-enter cycle after a refine-only wake
- fix(adhoc,test): refine-only re-entry + run.sh agent-pid leak

### Refactors
- refactor(review): dedup implementation-merge flow in review.md

### Other Changes
- fix/issue 826 align tmp mount msys fstab
- chore(agents): promote slim prompt set to shipped default

## v0.87.4-beta … v0.87.0-beta (2026-06-27)

### Features
- feat(startup): unify seed prompt to `run mux next-work`; migrate team planner

### Fixes
- fix(startup): strip stale refining label when releasing orphaned lock
- fix(poll): kill orphan pollers via pidfile backstop + MSYS-robust argv scan
- fix(gitbash): path normalise on every runtime emission site

### Other Changes
- test(gitbash): guard MSYS test-fragility classes (§4/§6/§7)

## v0.86.0-beta (2026-06-26)

### Features
- feat(agents): add shared concision fragment to all modes

## v0.85.2-beta … v0.84.0-beta (2026-06-25)

### Features
- feat(relay): add `mux next-work` server-side selection directive
- feat(live): add thinking gate + thin-ticket form to curb over-eager editing

### Fixes
- fix(adhoc-local): terminate backend on context renewal so supervisor restarts

### Refactors
- refactor(adhoc): adopt mux next-work + collapse always-on-cycling.md selection prose

### Performance
- perf(launcher): trim relay tool schema via global --disallowedTools drop set

### Docs
- docs(review): state CI-gate purpose, add no-CI and legacy-failing-check latitude

## v0.83.9-beta … v0.83.7-beta (2026-06-24)

### Docs
- docs(duo): move post-merge teardown from Dev to Reviewer

### Other Changes
- test/issue 783 stub fixture helpers
- test(lint): add stub-coverage static guard for subprocess bin calls

## v0.83.6-beta … v0.83.1-beta (2026-06-23)

### Fixes
- fix(statusline): hold last value during current_usage null window
- fix(relay-poll): route poller pid/log scratch through MUX_POLL_DIR

### Other Changes
- ci: run matrix jobs in per-job containers for isolation
- test(mux-qa-local): replace exec sleep 300 fake-launch barrier with killable wait loop
- test: replace silent sleep-then-assert race patterns with _settle_until
- test(tg-relay): drop export of fake TG creds in favour of subshell-scoped assignment

## v0.83.0-beta … v0.81.8-beta (2026-06-22)

### Features
- feat(relay): add mux.autoStart git config; fix -n on local driver
- feat(relay): show pane cwd in top pane border to identify active project

### Fixes
- fix(skill): branch next-run on role capability, name duo Dev mode
- fix(tg-relay): resolve install root through symlink chain
- fix(relay): reset pi pane context with /new instead of /clear

### Docs
- docs: add proprietary LICENSE and copyright headers (SHUKE LABS LTD)

## v0.81.7-beta … v0.81.6-beta (2026-06-21)

### Features
- feat: export session repo as GH_REPO into spawned agents + add `mux repo`
- feat: one-shot post-merge branch cleanup (mux branch cleanup)
- feat: add mandatory repo-hygiene gate to reviewer charter
- feat(review): sanctioned CI-outage merge path on local-green evidence
- feat(relay): accept tmux pane-id (%NNN) as a send-tmux target
- feat(test): add MUX_TEST_CORES core-limited CI-parity mode

### Fixes
- fix(test): add per-script timeout backstop and kill bare long-sleep barriers
- fix(end-cycle): reset without --force after a squash-merged PR
- fix(cycle): end-cycle tolerates detached HEAD from branch cleanup
- fix(relay): mux issue ready releases assigned_to lock
- fix(qa): reap orphaned QA agent when local supervisor is killed
- fix(test): cap in-group parallelism via MUX_TEST_JOBS

### Refactors
- refactor(relay): rename _tmux_send_path_to_* helpers, drop stale TODO
- refactor(worktree): drop slug path digest, project name as final path segment
- refactor(review): make CI-outage merge fragment cause-agnostic and generic

### Other Changes
- ci: gate workflow jobs behind CI_ENABLED to pause Actions minutes
- refine: correct issue body in place, not only via comment
- test: assert first line of all heading-bearing shared fragments
- test: restore parity with PR --repo injection
- ci: route workflows to self-hosted runner via RUNNER_LABEL var

## v0.81.5-beta … v0.80.0-beta (2026-06-20)

### Features
- feat(duo): add 2-agent duo mode (dev plans+implements, independent reviewer)
- feat(config): read mux user settings from git config

### Fixes
- fix(qa): launch initial QA child in local supervisor on startup
- fix(trust): normalize Windows trust key to C:/... form
- fix(qa): key wake state per-repo to stop cross-repo collision
- fix(poll): route duo idle poll-wake to developer pane
- fix(pi): make launched pi workers functional

### Refactors
- refactor: unify repo slug resolution into a single source of truth

### Docs
- docs: instruct agents to run context renewal bare (no pipes)

## v0.79.6-beta … v0.79.1-beta (2026-06-19)

### Fixes
- fix: normalize Windows paths in prompt profile registry to prevent format mismatch
- fix(tests): isolate env vars that cause context-dependent test failures
- fix(local-driver): stamp pane title from supervisor on every child spawn
- fix(local-driver): adhoc supervisor termination and failure backoff
- fix: test_start_live_does_not_attach_prefix_longer_sibling fails with unknown backend codex
- fix(tests): isolate ambient mux driver state

## v0.79.0-beta … v0.75.1-beta (2026-06-18)

### Features
- feat(adhoc): primary-worktree mode via git config mux.adhocWorktree
- feat: add structured GitHub issue automation helper
- feat(local-driver): add QA runtime state + wake inbox delivery
- feat(local-driver): add foreground supervisor + file-handoff for adhoc mode

### Fixes
- fix(explore): use MUX_BACKEND_NICK for refine lock in pane mode
- fix(qa): make sweep angles and filing/promotion contract tier-aware
- fix(docs): align dev-tier-weak routing and tier docs with base dev workflow

### Other Changes
- revert: drop per-mode models map consumer
- feat/issue 676 local driver phase1

## v0.75.0-beta … v0.73.0-beta (2026-06-17)

### Features
- feat: add pi as a first-class backend kind
- feat: use prompt profiles for runtime homes to avoid cross-repo prompt overwrite
- feat(statusline): show active_backend from gateway response as nick

## v0.72.1-beta … v0.71.5-beta (2026-06-16)

### Features
- feat: statusline shows active backend nickname (MUX_BACKEND_NICK)

### Fixes
- fix: escape jq variable names for Git Bash compatibility
- fix: strip CR from jq output in backends.json loader for Windows
- fix: env-gate Windows jq workarounds in backends loader
- fix: make jq calls deterministic on Windows native jq

### Docs
- docs(an internal path): clarify that 'act on it' means open the ticket

### Other Changes
- Revert: escape jq variable names for Git Bash compatibility
- Merge remote-tracking branch 'origin/main'
- Merge remote-tracking branch 'origin/main'
- Merge remote-tracking branch 'origin/main'
- Merge remote-tracking branch 'origin/main'

## v0.71.4-beta … v0.71.3-beta (2026-06-15)

### Fixes
- fix: deliver send-tmux by real window index, not hard-coded window 0
- fix: cap per-suite virtual memory in test/run.sh to prevent OOM

## v0.71.2-beta … v0.67.0-beta (2026-06-14)

### Features
- feat: realign gateway integration with AQG selector contract
- feat: scrub operator-shell ANTHROPIC_DEFAULT_*_MODEL in launcher
- feat: fast-forward placeholder branch to origin/<default> after end-cycle
- feat: codify What/Where/Evidence body template for raw-report tickets
- feat: collapse Planner startup probe into mux startup-state

### Fixes
- fix: normalize MUX_ANTHROPIC_GATEWAY to scheme+authority before exporting ANTHROPIC_BASE_URL
- fix: route gateway_selector backends through AQG, not direct to vendor

### Refactors
- refactor: drop dead direct-Anthropic statusline quota path

### Docs
- docs(qa): add secrets and sensitive-value safety rules
- docs: reconcile gateway precedence with shipped gateway_selector routing

### Other Changes
- feat/issue 643 release stale locks

## v0.66.0-beta … v0.56.0-beta (2026-06-13)

### Features
- feat: list agent panes grouped by project
- feat: add light Anthropic gateway integration point
- feat: disable Claude Code prompt suggestions in agent homes
- feat: route role-targeted delivery by pane identity
- feat: display pane ids as #N in agent labels and /agents output
- feat: key gateway statusline quota by backend nick
- feat: per-account statusLine usage-cache key
- feat: replace backends.conf with backends.json
- feat: tier the explore prompt by backend strength
- feat: consume per-mode models map at agent launch
- feat: gate named-session reuse on per-role pane health check

### Fixes
- fix: silence merge-release lock removal when label already absent
- fix: start Controller panes in the main repo checkout
- fix: validate Anthropic usage payloads before rendering quota
- fix: write Claude trust to per-role state file
- fix: drop an internal path prefix from agent-prompt tool references
- fix: unset ANTHROPIC_AUTH_TOKEN in statusline cache-read tests
- fix: consume unified gateway quota shape (agent-quota-gateway)
- fix: harden bg-run regression stub and tmpdir cleanup

### Refactors
- refactor: collapse refined lifecycle into ready/blocked
- refactor!: make auto-start the default for adhoc/team, drop --auto-start, add -n

## v0.55.3-beta … v0.55.0-beta (2026-06-12)

### Features
- feat: add mux quota CLI for per-backend Anthropic usage

### Fixes
- fix: spawn dormant poller at QA cycle cap so idle reports standby
- fix: surface failed lock release during merge as a warning

### Refactors
- refactor: drop vestigial :auth_var suffix from _MUX_CLAUDE_VARIANTS

## v0.54.2-beta (2026-06-13)

### Docs
- docs: fix交涉对象从planner改为reviewer

### Other Changes
- Merge remote-tracking branch 'origin/main'

## v0.54.1-beta … v0.49.0-beta (2026-06-12)

### Features
- feat: migrate pre- settings.json symlinks to per-home real files
- feat: auto-provision statusLine for Claude relay agent homes
- feat: fast-exit provisioning when desired state already present
- feat: add bg-run background command runner with pane-wake notifications
- feat: raw-report intake label preferred during refinement
- feat: tier developer prompt by backend strength

### Fixes
- fix: kill orphaned native agent child on Windows session close
- fix: use minimal_path helper instead of hardcoded PATH in tests
- fix: /idle replies "no agents are idle" instead of "no agent sessions running"
- fix(test): wrap jq to prevent MSYS2 argument mangling on Git Bash
- fix(test): export MSYS2_ARG_CONV_EXCL globally instead of jq wrapper
- fix: unify Claude auth on ANTHROPIC_AUTH_TOKEN

### Docs
- docs: state shared GitHub account; author is not an ownership signal
- docs: gate ready-promotion on quality, not authorship

### Other Changes
- refactor/issue 552 remove registry

## v0.48.0-beta … v0.42.0-beta (2026-06-11)

### Features
- feat: route Git Bash agent launches through winpty with Windows config paths
- feat: replace idle TG heartbeat with on-demand agent status queries
- feat: add `mux issue <state> <number>` to set refinement lifecycle atomically
- feat: emit progress lines to stderr during install
- feat: load 7-field tier entries in backends.conf, warn on 8+
- feat: expand Claude settings payload with UX-quieting keys
- feat: emit launch progress lines on stderr

### Fixes
- fix: launch native agent CLIs via scoped MSYS=enable_pcon instead of winpty
- fix: spawn native agent CLIs as a forked child so Cygwin allocates a ConPTY
- fix: converge .credentials.json symlink placeholder to hardlink
- fix: atomic merge-time lock label + release helper

### Refactors
- refactor: route test minimal-PATH through minimal_path helper
- refactor: use mux issue for lifecycle transitions in agent protocols
- refactor: strip lifecycle labels before adding target in _mux_issue_set_lifecycle
- refactor: retire Claude credential-sharing framework

### Docs
- docs: teach relay agents hybrid inline-vs-file message format

### Other Changes
- Merge remote-tracking branch 'origin/main'

## v0.41.0-beta (2026-06-10)

### Features
- feat: deliver short inline text via tmux bracket-paste

## v0.40.2-beta (2026-06-11)

### Fixes
- fix: launch tmux panes with non-interactive login shell

## v0.40.1-beta (2026-06-10)

### Docs
- docs: document MUX_GH_REPO and MUX_GH_LIST_LIMIT overrides

## v0.40.0-beta … v0.36.18-beta (2026-06-09)

### Features
- feat: support CLAUDE_CODE_OAUTH_TOKEN for native Claude backends
- feat: self-promote low-risk refined tickets to ready
- feat: tier-scoped QA prompt via backend tier flag
- feat: provision hasCompletedOnboarding in Claude relay homes

### Fixes
- fix: add --limit to gh issue list scans in claim/refine/poll paths
- fix: capture pane id with brace-free #D to stop %#pane_id leaking into TG
- fix: cache mux_bin shims at deterministic path to stop per-call leak

### Docs
- docs: add push-only signals invariant to relay rules
- docs: mark plan template sections omittable, ban filler sections

### Other Changes
- feat/issue 494 hardlink credentials
- test: cover pending-claim disarm timeout path in cycle.sh
- test: assert --limit forwarded to gh issue list in _relay-poll

## v0.36.17-beta … v0.36.3-beta (2026-06-08)

### Fixes
- fix: allow symlinked prompt fragments under the user config root
- fix: back up real skills dir instead of rm -rf on symlink conversion
- fix: pass --repo to gh in issue claim helpers so they work outside the repo
- fix: force UTF-8 locale before curl so notify_shuke sends CJK
- fix: resolve pane ID to session name before writing tg-relay sticky file
- fix: restore 'no relay PR in flight' gate in mux gate-check
- fix: forward --repo to gh in cycle, issue-comments, tmux-send, and relay-poll
- fix: fall back to tar when rsync is absent in install working-tree mode
- fix: scope TMUX_TMPDIR to match test TMPDIR so gitbash tmux sockets resolve

### Refactors
- refactor: dedup identical context-renewal claim rollback helpers

### Docs
- docs: align mux help and markdown with 'with' and --session syntax
- docs: fix stale test/mux-regression.sh reference in README

### Other Changes
- test: add direct unit tests for single-pane session helpers
- test: make working-tree launcher invocations portable to Git Bash
- test: cover _mux_start_live new-session paths (create/reuse/legacy-raw)

## v0.36.2-beta … v0.35.5-beta (2026-06-07)

### Features
- feat: add mux gate-check for team-mode pre-cycle gates

### Fixes
- fix: remove orphan trap clear from next-run
- fix: export relay issue-comment helpers and guard against missing ones
- fix: include explore and adhoc in notify_shuke role suffix
- fix: drop Escape from /clear keystroke block (issue)

### Refactors
- refactor: extract shared single-pane session-start helpers

### Docs
- docs: guard issue edits against in-flight delivery in explore and qa agents
- docs: clarify force-replace timing for explicit mapped-backend credentials
- docs: remove mid-document redundancy in explore.md and qa.md

### Other Changes
- chore: remove 'mux start .' adhoc alias

## v0.35.4-beta … v0.30.1-beta (2026-06-06)

### Features
- feat(issue-383): team-start pane roster + reply anchor; refuse unresolvable replies
- feat: scan for merged PRs at QA startup instead of waiting
- feat: route tmux session targets through central _tmux_session_target helper
- feat: symlink-first credential linking with graceful Windows fallback
- feat: add behaviour-change doc-update check to shared ticket checklist

### Fixes
- fix(issue-382): index notify_shuke by pane id; exact-match session targets
- fix: answer TG-origin directives over Telegram per-message across all modes
- fix: resolve notify-qa-merge slug from main repo, not caller worktree
- fix: anchor notify_shuke sender identity on $TMUX_PANE not active pane
- fix: dismiss autocomplete menu before submitting /clear in renewal
- fix(session.sh): anchor tmux session targets with exact-match marker
- fix: anchor remaining an internal path tmux session targets with exact-match marker
- fix: anchor send/config tmux session targets with exact-match marker
- fix: link credential/config files from bare canonical home
- fix: extract unified pane-title API to prevent title corruption
- fix: drop TMUX guard from _mux_set_pane_title_full (regression)
- fix: work around tmux 3.6b set-option not supporting = prefix
- fix: route set-hook through _tmux_session_target_no_prefix
- fix: stop install.sh honoring inherited MUX_MODE for adhoc prompts
- fix(team): chain splits on pane ids so pane order matches roles
- fix: route bare session-form show-option/split-window/select-layout/list-panes targets through _tmux_session_target helpers
- fix(test): isolate TMUX in credential-sharing launch tests, name aborting tests
- fix: guard _mux_parse_session_name against empty session name
- fix: mkdir canonical home in _mux_link_canonical_credentials for write-through
- fix: harden /clear→/next-run blind sequence with double Escape + double Enter

### Docs
- docs(issue-385): document `with` satellite syntax in README and session-modes
- docs: clarify QA can also promote refined tickets to ready
- docs: require explore agents to echo issue URL + final labels
- docs: document MUX_NOTIFY=0 knob for silencing session-start notifications

### Other Changes
- ci: run tests in parallel across 4 matrix groups
- test: dedup tmux -P pane-id mock into shared helper

## v0.30.0-beta … v0.28.0-beta (2026-06-05)

### Features
- feat(cli): add \`with\` syntax for co-launching satellite agents in the same session
- feat: allow QA and explore to mark self-raised tickets as ready
- feat: ensure skills symlink at agent launch time

### Fixes
- fix: drain backlog-refinement queue before idle polling in adhoc mode
- fix: auto-symlink config.toml for codex variants from canonical home
- fix: replace Chinese QA notification strings with English

### Docs
- docs: update CLI reference for `with` syntax

## v0.27.1-beta … v0.26.2-beta (2026-06-04)

### Features
- feat: unit tests for an internal path library modules

### Fixes
- fix: resolve symlinks before computing .mux-root marker path in launchers
- fix: replace regex-based _mux_parse_session_name with tmux option reads
- fix: clear error message when jq is missing
- fix: refuse elevated Git Bash before creating an unreachable tmux session

### Refactors
- refactor: remove tmuxinator dependency, unify on tmux-native driver
- refactor: split mux-regression.sh into topical modules with parallel execution

## v0.26.1-beta (2026-06-05)

### Fixes
- fix: launcher fallback for Windows Git Bash where symlinks degrade to copies

## v0.26.0-beta … v0.23.2-beta (2026-06-04)

### Features
- feat: support custom codex and copilot nicknames in backends.conf
- feat: proportional validation guidance for code-changing agents
- feat(qa): redesign qa-poll lifecycle — cycle-boundary restart, pane liveness, merge wake

### Docs
- docs(adhoc): replace CI wait with local test run on Linux

### Other Changes
- install: fall back to copy when ln -snf fails on Windows
- install: fix tar symlink extraction failure on Windows

## v0.23.1-beta … v0.18.0-beta (2026-06-03)

### Features
- feat(qa): push wake signal after reviewer and adhoc merges
- feat(qa): add lazy 5h/35h cadence poller
- feat: mark adhoc/team mode label on every merged PR
- feat(install): auto-discover an internal path scripts instead of hardcoded link list
- feat: explore/qa/live default to pane mode when inside tmux
- feat: clean up auto-generated changelog format
- feat: notify-qa-merge delivers wake signals to pane-mode QA

### Fixes
- fix: list single-pane adhoc and qa sessions as routable in tg-relay
- fix: list single-pane explore sessions as routable in tg-relay
- fix: drain full refine queue on idle instead of stopping after one ticket
- fix: resolve next-run via PATH before falling back to worktree an internal path

### Refactors
- refactor: dedup relay/qa poller and issue-candidate filter

### Docs
- docs(agents): add high-visibility role boundary rules to QA and explore prompts

### Other Changes
- chore: remove auto-merged label from workflows

## v0.17.10-beta … v0.15.3-beta (2026-06-02)

### Features
- feat: support *_CLAUDE_BASE_URL via backends.conf 6th field
- feat: make --auto-start configurable via user.conf with CLI override

### Fixes
- fix: reconcile single-agent pane title at poll start
- fix: exec-wrap agent launch so SIGHUP reaches node on pane close
- fix: remove self-deadlock from an internal path prompt-wait and strict-verify
- fix: bump TMUX_PANE_READY_TIMEOUT default from 30s to 60s
- fix: launch team tmux panes via initial command, drop prompt-wait
- fix: link next-run into ~/.local/bin on install
- fix: guarantee blank line on every @include boundary in compiled prompts

### Refactors
- refactor: decouple GitHub issue comment posting from send-tmux
- refactor: remove _mux_normalize_framework_labels entirely
- refactor: run qa from repo root, drop the dedicated qa worktree

### Docs
- docs: drop stale 'dedicated worktree' from README qa diagram

### Other Changes
- Fix pipe handling in jq merge to prevent SIGPIPE errors
- test: update stale planner-prompt assertion to match
- test: cover team tmux launch shape and launch-script cleanup
- chore: remove dead _tmux_wait_for_pane_prompt and orphaned helpers

## v0.15.2-beta … v0.11.0-beta (2026-06-01)

### Features
- feat: add adhoc idle refine pass
- feat: auto-normalize framework labels once per repo at session launch
- feat: add self-critique prompt checkpoints
- feat: keep explore issue bodies current
- feat: add manual-wake qa mode

### Fixes
- fix: harden next-run handoff delivery
- fix: recover leftover placeholder branch; fix upstream-tip fallback and reuse notice
- fix: guard end-cycle against destroying unpushed/unmerged branch work
- fix: stop relay-poll tests from firing real Telegram messages and tidy idle format
- fix: infer adhoc relay-poll target
- fix: resolve symlinked relay poll helpers
- fix: use body-file for refine issue comments
- fix: align planner gate check wording

### Refactors
- refactor: clean up shared prompt fragments

### Docs
- docs: prefer merge-first sync on pushed branches
- docs: tighten adhoc and explore prohibitions

### Other Changes
- Fix adhoc slot lock prompt rendering
- feat/issue 242 explore agent updates issue body directly
- feat/issue 240 extract shared prompt fragments
- Add test-writing guide for agents (test/README.md): in-process vs subprocess mocking, no-real-network rule
- feat/issue 244 show active ticket number in dev pane title
- Fix relay-poll session cleanup
- Prefer --body-file for multiline issue updates
- Rename relay-poll to _relay-poll
- fix/issue 282 stable worktree lifecycle

## v0.10.0-beta … v0.5.0-beta (2026-05-31)

### Features
- feat: add raw launch mode
- feat: auto-regenerate CHANGELOG.md after each beta tag
- feat: require ready before delivery claims
- feat: rename raw mode to live
- feat: expand shared agent prompt includes at render time
- feat: provision Claude settings for relay homes

### Fixes
- fix: ramp relay poll intervals
- fix: remove stale runtime path hints from agent prompts
- fix: scope test runner tmpdir
- fix: route notify_shuke through wrapper script
- fix: expose relay helpers as mux commands
- fix: reorder explore ready handoff
- fix: route raw sessions through tg-relay
- fix: add relay-poll idle heartbeat routing

### Docs
- docs: rewrite README with product hook, concept diagram, and prerequisites
- docs: refresh README quick start
- docs: clarify raw mode ask-vs-act boundary
- docs: add session modes overview
- docs(explore): add pre-question self-check to ban redundant asks
- docs: add live mode to README overview

### Other Changes
- adhoc: verify work branch exists before resuming after next-run handoff
- fix/issue 224 interrupted adhoc renewal rollback

## v0.4.9-beta … v0.2.0-beta (2026-05-30)

### Features
- feat: make backend registry user-configurable
- feat(issue-68): add explicit credential sharing
- feat: add auto-start launch prompts for issue 170

### Fixes
- fix: sweep issue-146 prompt user-name literals
- fix(issue-156): stop next-run waiting on its own pane
- fix: honor leading #session parsing in tg-relay
- fix(issue-173): disallow AskUserQuestion for claude launches
- fix(issue-176): anchor next-run pane resolution
- fix: launch adhoc sessions as tmux commands
- fix: terminate Claude auto-start prompts after MCP config

### Docs
- docs(issue-154): drop installed-command bin prefixes
- docs(issue-162): add QA agent RFC
- docs(issue-177): audit relay docs
- docs: clarify reviewer merges via CLI, not GitHub auto-merge
- docs: align explore label guidance
- docs: require docs impact in plans

## v0.1.6-beta … v0.1.0-beta (2026-05-29)

### Features
- feat(issue-148): add beta release automation

### Fixes
- fix: support multi-backend team launch
- fix: wait for shell prompt before tmux launch send-keys
- fix: make relay merges worktree-safe
- fix(issue-113): harden tmuxinator team start
- fix: launch explore sessions as tmux commands

### Docs
- docs: issue-149 reframe agent role prompts

