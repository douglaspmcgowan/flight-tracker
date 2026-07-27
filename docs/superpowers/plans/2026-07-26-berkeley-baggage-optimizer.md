# Berkeley Baggage Optimizer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persisted, source-backed total-trip-cost optimizer for Douglas’s two-traveler, four-bag Norfolk-to-Berkeley search.

**Architecture:** A pure baggage-cost module owns airline fee matching, benefit application, and total-cost ranking. Search metadata is persisted on every sibling `Query`; the existing creation and group-cascade APIs remain the write seams. A focused tracker component renders the calculation, while a deterministic city-area map expands Berkeley to OAK and SFO in both manual and natural-language entry.

**Tech Stack:** Next.js 16, React 19, TypeScript, Prisma/PostgreSQL, Vitest, Testing Library, Playwright.

---

## File map and seams

- `apps/web/src/lib/city-airports.ts`: input city text; output a stable airport-area preset or `null`.
- `apps/web/src/lib/baggage-cost.ts`: input fare snapshot plus persisted trip settings; output an auditable cost breakdown or an unsupported state.
- `apps/web/prisma/schema.prisma` and a new migration: persist trip settings without changing existing tracker defaults.
- `apps/web/src/components/ManualEntryForm.tsx`: output `ParsedQuery` and `ManualFormValues` containing city-expanded destinations and trip settings.
- `apps/web/src/app/api/queries/route.ts`: validate the creation payload and copy settings to every route.
- `apps/web/src/app/api/queries/[id]/route.ts`: validate edits and cascade them to sibling queries.
- `apps/web/src/components/TripCostComparison.tsx`: input snapshots and query settings; render sorted totals and an assumption editor.
- `apps/web/src/app/q/[id]/page.tsx`: load settings, pass them to the comparison, and sort sibling routes by known total trip cost.
- `e2e/application.spec.ts`: exercise the exact ORF → Berkeley, August 14–17, two-traveler/four-bag workflow.

### Task 1: Pure city and baggage domains

**Files:**

- Create: `apps/web/src/lib/city-airports.ts`
- Create: `apps/web/src/lib/city-airports.test.ts`
- Create: `apps/web/src/lib/baggage-cost.ts`
- Create: `apps/web/src/lib/baggage-cost.test.ts`

- [x] Write failing tests for Berkeley expansion, the Delta AmEx $110 case, the Delta Medallion $0 case, standard carrier fees, unknown carriers, one-way calculations, and total sorting.
- [x] Run `npm --workspace apps/web test -- src/lib/city-airports.test.ts src/lib/baggage-cost.test.ts` and confirm the new imports fail.
- [x] Implement pure, side-effect-free functions with source metadata embedded beside each fee schedule.
- [x] Re-run the focused tests and require a clean pass.

### Task 2: Persist trip assumptions

**Files:**

- Modify: `apps/web/prisma/schema.prisma`
- Create: `apps/web/prisma/migrations/20260726230000_add_baggage_optimizer/migration.sql`
- Modify: `apps/web/src/app/api/queries/route.ts`
- Modify: `apps/web/src/app/api/queries/route.test.ts`
- Modify: `apps/web/src/app/api/queries/[id]/route.ts`
- Modify: `apps/web/src/app/api/queries/[id]/route.test.ts`

- [x] Add API tests requiring integers in the documented ranges and one of the three benefit identifiers.
- [x] Add `travelerCount`, `checkedBagCount`, and `baggageBenefit` with compatibility-preserving defaults.
- [x] Store all three fields on every created route.
- [x] Add all three to the existing group-cascade update transaction and edit-event audit trail.
- [x] Generate Prisma types and run both route test files.

### Task 3: Search workflow and Berkeley expansion

**Files:**

- Modify: `apps/web/src/components/ConfirmationCard.tsx`
- Modify: `apps/web/src/components/ManualEntryForm.tsx`
- Modify: `apps/web/src/components/ManualEntryForm.module.css`
- Modify: `apps/web/src/components/ManualEntryForm.test.tsx`
- Modify: `apps/web/src/components/SearchBar.tsx`
- Modify: `apps/web/src/lib/scraper/parse-query.ts`
- Modify: `apps/web/src/lib/scraper/parse-query.test.ts`
- Modify: `apps/web/messages/*/components.json`

- [x] Add failing component tests for the Berkeley quick choice and two-traveler/four-bag values.
- [x] Extend parsed-query normalization so raw input containing “Berkeley” deterministically produces OAK and SFO.
- [x] Add a compact area preset and a “Trip cost” field group containing travelers, collective checked bags, and the two Delta Platinum interpretations.
- [x] Carry the fields through preview state and the create request.
- [x] Show the assumptions in the confirmation card and run focused tests.

### Task 4: Total-cost comparison and editing

**Files:**

- Create: `apps/web/src/components/TripCostComparison.tsx`
- Create: `apps/web/src/components/TripCostComparison.module.css`
- Create: `apps/web/src/components/TripCostComparison.test.tsx`
- Modify: `apps/web/src/app/q/[id]/page.tsx`
- Modify: `apps/web/src/app/q/[id]/page.module.css`
- Modify: `apps/web/messages/*/components.json`
- Modify: `apps/web/messages/*/pages.json`

- [x] Write a failing render test that expects airfare, bag fees, total, source link, and a visible unsupported-fee state.
- [x] Render available snapshots cheapest-total-first, deduplicated to the latest record for each flight.
- [x] Add an authenticated/client-authorized settings editor using the existing tracker PATCH endpoint.
- [x] Load and pass the persisted settings from the tracker page.
- [x] Update multi-route sort values to use total trip cost whenever the fee is known.
- [x] Run component and page-level tests.

### Task 5: Exact scenario and final gates

**Files:**

- Modify: `e2e/application.spec.ts`
- Modify: `WORK_QUEUE.md`
- Modify: `STATUS.md`
- Modify: `LOG.md`

- [x] Add a Playwright test for ORF, the Berkeley area preset, August 14–17, 2026, two travelers, four bags, max two stops, and Delta Platinum AmEx.
- [x] Verify the preview request contains OAK and SFO and the create request contains all trip settings without depending on live Google results.
- [x] Run the Impeccable detector against every changed UI file and correct all relevant findings.
- [x] Run focused tests, full `npm run ci`, production audit at critical severity, desktop/mobile Playwright, and a fresh Vercel deployment smoke.
- [x] Promote the verified deployment to `flight-finder-hazel.vercel.app`, test the public authentication surface in the browser, update durable project state, and publish the operating brief.
