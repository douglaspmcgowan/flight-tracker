# Task

## Goal

Close the open Flight Finder work: resolve the phantom release commit, settle the
conflicting test counts, prevent the duplicate ORF–OAK tracker recurring, and
prepare the fork-ownership move up to the point where only Douglas can authorize
the push.

## Active

- [ ] Nothing is actively in progress. The remaining work is either blocked on a reachable database or waiting on Douglas.

## Blocked

- [ ] Confirm, export and delete the duplicate ORF–OAK tracker row, then apply migration `20260806120000_add_tracker_route_uniqueness`. **Blocked:** no database is reachable from this machine — nothing listening on 5432, Docker Desktop absent, Doppler CLI absent. Run `scripts/resolve-duplicate-trackers.mjs --report` against the database the deployed app uses.
- [ ] Re-run the Playwright end-to-end suite. **Blocked by the same cause:** `apps/web/scripts/run-e2e.mjs` executes `npm run db:migrate` first and exits without a live `DATABASE_URL`. Last real run was 2026-07-26.

## Needs decision

- [ ] **Create `douglaspmcgowan/flight-finder` and push `master`.** Publishing needs Douglas's explicit authorization. Local half is done and `gh auth status` confirms he is logged in with `repo` scope; commands are ready in `base-flight-finder/docs/fork-ownership-runbook.md`. Urgent — `master` is one squashed commit with no remote copy anywhere.
- [ ] **Enter the admin password and run the authenticated walkthrough** in `base-flight-finder/docs/authenticated-walkthrough-2026-08-06.md`. Step 3 settles whether the duplicate tracker is live in production.
- [ ] **Decide whether to push the 51 upstream tags** (`v0.1.0`…`v0.13.2`, `desktop-v0.13.1`). They belong to affromero's release line; the runbook pushes `master` only.

## Queue

- [x] Re-verify `8883dff`, establish what survived, correct all five asserting documents, and record the root cause durably.
- [x] Run the suite and replace every conflicting test count with one dated figure in both `STATUS.md` files and the vault Verification doc.
- [x] Add the tracker uniqueness constraint, its migration, and regression tests.
- [x] Prepare the fork-ownership move: `upstream` remote, capsule check, runbook, `gh auth status`. Nothing pushed.
- [x] Re-check production `/api/health` and write the five-minute authenticated walkthrough.
- [x] Update the four vault brief docs and pass the vault link gate.

## Completed

- `8883dff` re-verified absent by `git rev-parse`, `git cat-file` and `git log --all`. `master` is a single root commit `cabc7ec`. Root cause: the backup path wrote the working tree as one new root commit instead of bundling the commit graph, so a squashing bundle snapshot is not a history backup. Recorded in `base-flight-finder/docs/release-history-loss-2026-08-06.md`.
- Established that the two capsule bundles hold *different* single root commits — `20260727-final` has `cabc7ec`, `20260727-final2` has `e07d6db` — with byte-identical trees and no shared ancestry. The handoff prompt's claim that both list `cabc7ec` is wrong.
- Corrected `STATUS.md`, `LOG.md`, `WORK_QUEUE.md`, `CURRENT-TASK.md` and `docs/flight-finder-production-brief-2026-07-26.md` so none asserts a nonexistent commit.
- Ran `npm run ci` green: **1,483 unit/API tests passed, 2 skipped** (1,440 web + 43 CLI), lint, typecheck, Next.js build, CLI bundle.
- Added `Query_route_daterange_user_key` with a `NULLS NOT DISTINCT` backing index, a preflight-guarded migration, a duplicate-resolution script, a 409 response for duplicate creates, and 5 regression tests.
- Added the `upstream` remote, confirmed `capsule` resolves, wrote `docs/fork-ownership-runbook.md`, and confirmed `gh auth status` shows `douglaspmcgowan` logged in with `repo` scope.
- Re-checked production `/api/health`: HTTP 200, `status: ok`, database and Redis connected. Wrote `docs/authenticated-walkthrough-2026-08-06.md`.
- Updated the four vault brief docs; `Verify-VaultLinks.ps1` returns `BROKEN=0 AMBIGUOUS=0 ORPHANS=1 RESULT=PASS`, with the single orphan an unrelated Morning Report note.

## Verification

- `npm run ci` exit 0 on 2026-08-06 against the committed tree: 1,440 web tests passed / 2 skipped across 117 files, 43 CLI tests passed, build and CLI bundle green.
- The 5 new tests pass; 62 tests pass across the two touched files.
- `git bundle verify` and `git bundle list-heads` on both capsule bundles.
- `Verify-VaultLinks.ps1` — `RESULT=PASS`, `BROKEN=0`.
- Gitleaks pre-commit hook found no leaks on both commits.

## Discovered, not previously recorded

- A fresh checkout fails `typecheck` until `npm run db:generate` runs: the Prisma 7 client is generated into `apps/web/src/generated/prisma`, is untracked, and its absence produces ~20 cascading type errors.
- Production `/api/health` reports `cron.lastScrape: null` and `cron.nextScrape: null` against a 3-hour interval. Scheduled production collection is unproven, possibly not running.
- `Test-AgentProjectState.cmd` fails on this repository for pre-existing structural gaps unrelated to this session: missing `.agents\skill-pathways.json` and `.agents\harness-provenance.json`, unmapped `work-scope` / `skill-discovery` / `skill-authoring` skills, missing managed blocks in `AGENTS.md` and `DESIGN.md`, and `CURRENT-TASK.md` / `WORK_QUEUE.md` / `VERIFY.md` flagged as stale architecture files.
