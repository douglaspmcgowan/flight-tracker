# Task

## Goal

Make the combined Flight Finder cash, awards, analyst, alerts, and scheduling application operational and verified in production while keeping this coordination repository portable under harness v3.

## Active

- [~] T2 — Replace the marketing-mode production surface with the authenticated combined application | evidence: authenticated production routes and APIs pass live verification | owner: `base-flight-finder` | provenance: archived `WORK_QUEUE.md`
- [~] T3 — Finish production scraping, scheduling, Redis coordination, and the configured notification path | evidence: database/Redis health plus one elapsed scheduled run and alert delivery | owner: `base-flight-finder` | provenance: archived `CURRENT-TASK.md` and `WORK_QUEUE.md`

## Queue

- [ ] T4 — Redeploy the combined application with Redis and verify database and Redis health | after: T3 | evidence: production health checks pass | provenance: archived `CURRENT-TASK.md`
- [ ] T5 — Verify cash tracking, award search, Analyst comparison, alerts, settings, and authentication in production | after: T2, T3 | evidence: live production workflow checks pass | provenance: archived `WORK_QUEUE.md`
- [ ] T6 — Run final tests, build, dependency/security review, and adversarial browser verification | after: T5 | evidence: all repository gates pass | provenance: archived `CURRENT-TASK.md` and `WORK_QUEUE.md`
- [ ] T7 — Promote the verified production build and refresh the durable brief, `STATUS.md`, and `LOG.md` | after: T6 | evidence: production deployment and documentation agree | provenance: archived `CURRENT-TASK.md` and `WORK_QUEUE.md`
- [ ] T8 — Expand Berkeley destinations to OAK and SFO | after: T7 | evidence: nearby-airport search is covered and live-verified | provenance: archived `CURRENT-TASK.md` and `WORK_QUEUE.md`
- [ ] T9 — Add first-class traveler and checked-bag parameters, including the two-traveler/four-bag default | after: T7 | evidence: unit, API, and UI coverage | provenance: archived `CURRENT-TASK.md` and `WORK_QUEUE.md`
- [ ] T10 — Add editable Delta SkyMiles Platinum AmEx and Platinum Medallion benefit presets | after: T9 | evidence: benefit eligibility and pricing tests pass | provenance: archived `CURRENT-TASK.md` and `WORK_QUEUE.md`
- [ ] T11 — Calculate and rank estimated total trip cost from airfare plus round-trip checked-bag charges | after: T9, T10 | evidence: ranking tests cover fare and bag assumptions | provenance: archived `CURRENT-TASK.md` and `WORK_QUEUE.md`
- [ ] T12 — Add a maximum-stops control for the requested one-or-two-stop constraint | after: T7 | evidence: API and UI tests cover the stop limit | provenance: archived `WORK_QUEUE.md`
- [ ] T13 — Add automated coverage for the Aug 14–17, 2026 Norfolk-to-Berkeley scenario | after: T8, T9, T10, T11, T12 | evidence: unit, API, and Playwright checks pass | provenance: archived `CURRENT-TASK.md` and `WORK_QUEUE.md`
- [ ] T14 — Live-test the completed trip optimizer and document fare and baggage assumptions | after: T13 | evidence: deployed UI proof and durable documentation | provenance: archived `CURRENT-TASK.md` and `WORK_QUEUE.md`

## Blocked

- [!] T15 — Configure and live-verify the seats.aero credential and cached-search mapping | blocked: Douglas must provide or authorize a Pro credential; do not expose it in task state | provenance: archived `CURRENT-TASK.md` and `STATUS.md`
- [!] T16 — Reconnect automatic Git deployment for the Flight Finder application | blocked: the current Vercel account cannot administer the upstream repository | provenance: `STATUS.md`

## Needs decision

- [?] D1 — Choose which duplicate ORF–OAK tracker to retain before removing either one: `cmruqcc1m00003ou71nhcm5jy` or `cmruqcpwc00063ou7zb61i4an` | evidence: Douglas names the retained tracker | provenance: `STATUS.md`

## Completed

- [x] T1 — Onboard this coordination repository to harness v3 in the isolated `codex/harness-v3-onboarding-2` worktree | evidence: pushed `SyncProject` and `VerifyProject`, installed project verifier, `git diff --check`, `gitleaks git`, and `gitleaks dir` passed; sidecar syntax compiled under installed Python 3.14; exact Python 3.12 local verification remains unavailable because that runtime is not installed | owner: repository harness and coordination files | archive: `.agents/archive/pre-harness-v3/`, selected after repository and harness searches found no existing project archive owner | provenance: 2026-07-30 onboarding request
- [x] T17 — Publish `douglaspmcgowan/flight-tracker` from `master` with the `agent-project` topic | evidence: disposable clone contained 34 tracked files, excluded paths were absent, and GitHub Actions `verify`, `gitleaks`, and `Dependency Graph` passed | provenance: pre-v3 `TASK.md`
- [x] T18 — Establish the production foundation | evidence: fast-flights worker, Prisma Postgres, protected application surface, corrected seats.aero mapping, database-backed admin, Redis, and ntfy delivery were individually verified | provenance: archived `CURRENT-TASK.md`
- [x] T19 — Implement and verify the combined local application through the July 26 deployment checkpoint | evidence: `STATUS.md` and `LOG.md` record 1,420 tests plus lint, typecheck, build, CLI bundle, and responsive browser checks | provenance: archived `WORK_QUEUE.md`, `STATUS.md`, and `LOG.md`

## Verification

- Harness onboarding: `powershell.exe -File C:\tmp\agent-harness-google-drive-account-root\.agents\tools\Manage-Harness.ps1 -Action VerifyProject -HarnessRoot C:\tmp\agent-harness-google-drive-account-root\.agents -Repository C:\tmp\onboard-flight`
- Project contract: `C:\Users\dougl\.agents\tools\Test-AgentProjectState.cmd -Repository C:\tmp\onboard-flight`
- Python syntax (required CI/runtime target): `py -3.12 -m py_compile fast-flights-sidecar\catcher.py fast-flights-sidecar\main.py fast-flights-sidecar\probe.py`
- Python syntax (installed local runtime): `py -3.14 -m py_compile fast-flights-sidecar\catcher.py fast-flights-sidecar\main.py fast-flights-sidecar\probe.py`
- Whitespace: `git diff --check`
- Secret scan: `gitleaks git --redact --no-banner .`
- Application deployment action after this harness-only migration: from `C:\Users\dougl\projects\base-flight-finder`, run `npx.cmd vercel deploy --yes` only when a production deployment is explicitly intended.
- Application post-deployment verifier: from `C:\Users\dougl\projects\base-flight-finder`, run the repository's production health and browser verification documented there.
