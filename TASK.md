# Task

## Goal

Close the open Flight Finder work: resolve the phantom release commit, settle the
conflicting test counts, prevent the duplicate ORF–OAK tracker recurring, and
prepare the fork-ownership move up to the point where only Douglas can authorize
the push.

## Queue

- [x] Re-verify `8883dff`, establish what survived, correct all five asserting documents, and record the root cause durably.
- [x] Run the suite and replace every conflicting test count with one dated figure in both `STATUS.md` files and the vault Verification doc.
- [x] Add the tracker uniqueness constraint, its migration, and regression tests.
- [x] Prepare the fork-ownership move: `upstream` remote, capsule check, runbook, `gh auth status`. Nothing pushed.
- [x] Re-check production `/api/health` and write the five-minute authenticated walkthrough.
- [x] Update the four vault brief docs and pass the vault link gate.
- [ ] **Blocked — needs a reachable database:** confirm, export and delete the duplicate ORF–OAK tracker row, then apply the uniqueness migration.
- [ ] **Blocked — needs a reachable database:** re-run the Playwright end-to-end suite.
- [ ] **Needs Douglas:** create `douglaspmcgowan/flight-finder` and push `master`.
- [ ] **Needs Douglas:** enter the admin password and run the authenticated walkthrough.

## Completed

- `8883dff` re-verified absent by `git rev-parse`, `git cat-file` and `git log --all`. `master` is a single root commit `cabc7ec`. Root cause: the backup path wrote the working tree as one new root commit instead of bundling the commit graph, so a squashing bundle snapshot is not a history backup. Recorded in `base-flight-finder/docs/release-history-loss-2026-08-06.md`.
- Established that the two capsule bundles hold *different* single root commits — `20260727-final` has `cabc7ec`, `20260727-final2` has `e07d6db` — with byte-identical trees and no shared ancestry. The handoff prompt's claim that both list `cabc7ec` is wrong.
- Corrected `STATUS.md`, `LOG.md`, `WORK_QUEUE.md`, `CURRENT-TASK.md` and `docs/flight-finder-production-brief-2026-07-26.md` so none asserts a nonexistent commit.
- Ran `npm run ci` green: **1,483 unit/API tests passed, 2 skipped** (1,440 web + 43 CLI), lint, typecheck, Next.js build, CLI bundle.
- Added `Query_route_daterange_user_key` with a `NULLS NOT DISTINCT` backing index, a preflight-guarded migration, a duplicate-resolution script, and 5 regression tests.
- Added the `upstream` remote, confirmed `capsule` resolves, wrote `docs/fork-ownership-runbook.md`, and confirmed `gh auth status` shows `douglaspmcgowan` logged in with `repo` scope.
- Re-checked production `/api/health`: HTTP 200, `status: ok`, database and Redis connected. Wrote `docs/authenticated-walkthrough-2026-08-06.md`.
- Updated the four vault brief docs; `Verify-VaultLinks.ps1` returns `BROKEN=0 AMBIGUOUS=0 ORPHANS=1 RESULT=PASS`, with the single orphan an unrelated Morning Report note.

## Verification

- `npm run ci` exit 0 on 2026-08-06 with all changes present.
- The 5 new tests pass; 62 tests pass across the two touched files.
- `git bundle verify` and `git bundle list-heads` on both capsule bundles.
- `Verify-VaultLinks.ps1` — `RESULT=PASS`, `BROKEN=0`.

## Discovered, not previously recorded

- A fresh checkout fails `typecheck` until `npm run db:generate` runs: the Prisma 7 client is generated into `apps/web/src/generated/prisma`, is untracked, and its absence produces ~20 cascading type errors.
- Production `/api/health` reports `cron.lastScrape: null` and `cron.nextScrape: null` against a 3-hour interval. Scheduled production collection is unproven, possibly not running.
- `npm run test:e2e` cannot run without a live `DATABASE_URL`: `run-e2e.mjs` executes `db:migrate` first and exits on failure.
