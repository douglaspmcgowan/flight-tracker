# Award Comparison Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a two-mode award-search and cash-comparison workspace to the existing Flight Finder app.

**Architecture:** A server route hosts a client workspace. The existing award APIs remain the source of truth, with the award-detail response extended by one best matching cash snapshot. Pure view-model helpers own valuation, freshness, and form normalization so the UI can be tested without network or browser setup.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, CSS Modules, Prisma/PostgreSQL, Vitest, Testing Library, Playwright.

---

## File structure and seams

- `src/app/awards/page.tsx`: server-rendered page shell; seam is `<AwardWorkspace />`.
- `src/app/awards/page.module.css`: route-level layout and header.
- `src/components/AwardWorkspace/AwardWorkspace.tsx`: client state, API calls, and mode composition; seam is the existing JSON API envelope.
- `src/components/AwardWorkspace/AwardWorkspace.module.css`: responsive Simple and Analyst presentation.
- `src/components/AwardWorkspace/award-view-model.ts`: pure parsing, valuation, ranking, and freshness functions; seam is typed input to deterministic output.
- `src/components/AwardWorkspace/award-view-model.test.ts`: pure behavior tests.
- `src/components/AwardWorkspace/AwardWorkspace.test.tsx`: interaction and state tests.
- `src/app/api/awards/searches/[id]/route.ts`: extend detail data with `cashComparison`; seam is the existing `{ ok, data }` response.
- `src/app/api/awards/searches/[id]/route.test.ts`: ownership and comparison tests.
- `src/app/page.tsx` and `src/app/page.module.css`: add an Awards entry to the existing self-hosted navigation.
- `e2e/award-workspace.spec.ts`: assembled browser flow with API fixtures.

No commits are planned because Douglas has not authorized committing or pushing.

### Task 1: Cash comparison seam

**Files:**

- Modify: `apps/web/src/app/api/awards/searches/[id]/route.ts`
- Modify: `apps/web/src/app/api/awards/searches/[id]/route.test.ts`

- [ ] **Step 1: Write the failing comparison test**

Add a `priceSnapshot.findFirst` mock and assert that the detail response contains:

```ts
cashComparison: {
  queryId: 'cash-1',
  price: 435,
  currency: 'USD',
  airline: 'Southwest',
  travelDate: '2026-08-14T00:00:00.000Z',
  scrapedAt: '2026-07-24T00:00:00.000Z',
}
```

The mock expectation must include matching origin/destination, overlapping dates, owner scoping when present, `status: 'available'`, and `orderBy: { price: 'asc' }`.

- [ ] **Step 2: Verify failure**

Run:

```powershell
npx.cmd vitest run 'src/app/api/awards/searches/[id]/route.test.ts'
```

Expected: FAIL because `priceSnapshot.findFirst` is absent and `cashComparison` is missing.

- [ ] **Step 3: Implement the narrow query**

After authorization, call:

```ts
const cashComparison = await prisma.priceSnapshot.findFirst({
  where: {
    status: 'available',
    query: {
      origin: search.origin,
      destination: search.destination,
      dateFrom: { lte: search.dateTo },
      dateTo: { gte: search.dateFrom },
      ...(search.userId ? { userId: search.userId } : {}),
    },
  },
  orderBy: { price: 'asc' },
  select: {
    queryId: true,
    price: true,
    currency: true,
    airline: true,
    travelDate: true,
    scrapedAt: true,
  },
});
```

Return `cashComparison` beside `search`.

- [ ] **Step 4: Verify**

Run the focused test and TypeScript:

```powershell
npx.cmd vitest run 'src/app/api/awards/searches/[id]/route.test.ts'
npx.cmd tsc --noEmit -p tsconfig.json
```

Expected: focused tests and typecheck pass.

### Task 2: Pure award view model

**Files:**

- Create: `apps/web/src/components/AwardWorkspace/award-view-model.ts`
- Create: `apps/web/src/components/AwardWorkspace/award-view-model.test.ts`

- [ ] **Step 1: Write failing pure tests**

Cover:

```ts
expect(centsPerPoint({ cashPrice: 435, mileageCost: 20000, taxesFees: '$35.00' })).toBe(2);
expect(centsPerPoint({ cashPrice: null, mileageCost: 20000, taxesFees: '$35.00' })).toBeNull();
expect(rankSnapshots(rows)[0]?.id).toBe('best-complete-row');
expect(freshnessLabel('2026-07-25T08:00:00Z', new Date('2026-07-25T10:00:00Z'))).toEqual({
  label: 'Observed 2h ago',
  stale: false,
});
expect(freshnessLabel('2026-07-23T08:00:00Z', new Date('2026-07-25T10:00:00Z')).stale).toBe(true);
expect(parseProgramList('Aeroplan, United, aeroplan')).toEqual(['aeroplan', 'united']);
```

- [ ] **Step 2: Verify failure**

Run:

```powershell
npx.cmd vitest run src/components/AwardWorkspace/award-view-model.test.ts
```

Expected: FAIL because the module is missing.

- [ ] **Step 3: Implement deterministic helpers**

Export typed `AwardSearchSummary`, `AwardSearchDetail`, `AwardSnapshotView`, `CashComparison`, `centsPerPoint`, `rankSnapshots`, `freshnessLabel`, `formatDateOnly`, `parseProgramList`, and `taxesAsNumber`.

Use:

```ts
export function centsPerPoint(input: {
  cashPrice: number | null;
  mileageCost: number | null;
  taxesFees: string | null;
}): number | null {
  if (input.cashPrice == null || input.mileageCost == null || input.mileageCost <= 0) return null;
  const taxes = taxesAsNumber(input.taxesFees);
  return Math.round(((input.cashPrice - taxes) / input.mileageCost) * 10000) / 100;
}
```

Rank rows with known mileage first, then mileage ascending, taxes ascending, seats descending, and observation time descending.

- [ ] **Step 4: Verify**

Run the focused test and typecheck. Expected: pass.

### Task 3: Two-mode award workspace

**Files:**

- Create: `apps/web/src/app/awards/page.tsx`
- Create: `apps/web/src/app/awards/page.module.css`
- Create: `apps/web/src/components/AwardWorkspace/AwardWorkspace.tsx`
- Create: `apps/web/src/components/AwardWorkspace/AwardWorkspace.module.css`
- Create: `apps/web/src/components/AwardWorkspace/AwardWorkspace.test.tsx`

- [ ] **Step 1: Write failing interaction tests**

Mock `fetch` and cover:

1. Empty provider-disabled state still permits saving a search.
2. Form submission sends uppercase airport codes, ISO dates, cabin, and normalized programs.
3. Simple mode displays best points, taxes, seats, program, freshness, attribution, and airline-confirmation warning.
4. Analyst mode displays the comparison ledger and a labeled cents-per-point value.
5. Mode switching preserves the selected search and stores `flight-finder-award-mode` in `sessionStorage`.
6. Refresh handles 424 with an inline provider message while retaining prior observations.
7. Alert form sends `award_seats_available`, search id, threshold, program, and cabin.

- [ ] **Step 2: Verify failure**

Run:

```powershell
npx.cmd vitest run src/components/AwardWorkspace/AwardWorkspace.test.tsx
```

Expected: FAIL because the components are missing.

- [ ] **Step 3: Implement the server shell**

Render a semantic page with:

```tsx
<main className={styles.root} id="main-content">
  <header className={styles.header}>
    <Link href="/" className={styles.brand}>Flight Finder</Link>
    <ThemeToggle />
  </header>
  <AwardWorkspace />
  <Footer />
</main>
```

- [ ] **Step 4: Implement client state and API flow**

The workspace must:

- load the collection on mount;
- load newest detail when searches exist;
- create and select a new search;
- switch Simple/Analyst modes without losing state;
- refresh through `/api/awards/searches/<id>/refresh`;
- create rules through `/api/alert-rules`;
- keep previous successful data visible on transient errors;
- use `aria-live="polite"` for operation status.

- [ ] **Step 5: Implement Simple mode**

Use a route-first summary, a best-observation line, program/cabin/seats/taxes metadata, freshness, refresh and alert actions, seats.aero attribution, and the exact warning:

> Confirm availability with the airline before transferring points.

- [ ] **Step 6: Implement Analyst mode**

Use semantic table markup on wide screens. Include columns for date, program, cabin, seats, miles, taxes, cash comparison, cents per point, and observed time. Add `data-label` on cells and CSS that turns each row into a labeled stack below 760px.

- [ ] **Step 7: Implement all states and responsive CSS**

Use the existing Altitude tokens. Include default, hover, focus-visible, active, disabled, loading, error, success, empty, stale, and overflow states. Keep 44px targets for coarse pointers. Respect reduced motion.

- [ ] **Step 8: Verify**

Run focused component tests, typecheck, and lint on the new files. Expected: pass.

### Task 4: Existing-app navigation

**Files:**

- Modify: `apps/web/src/app/page.tsx`
- Modify: `apps/web/src/app/page.module.css`

- [ ] **Step 1: Add a focused rendering test if the page test harness supports the server page**

Assert the self-hosted top bar contains an `/awards` link named “Awards.”

- [ ] **Step 2: Add the navigation entry**

Place the Awards link beside Settings and Theme Toggle using the existing top-bar vocabulary. Give it a 44px coarse-pointer target and visible focus.

- [ ] **Step 3: Verify**

Run the relevant page/component test and TypeScript. Expected: pass.

### Task 5: Assembled browser verification

**Files:**

- Create: `base-flight-finder/e2e/award-workspace.spec.ts` if the existing Playwright configuration can run deterministic API fixtures.
- Modify: implementation files only when browser evidence exposes a defect.

- [ ] **Step 1: Add deterministic browser coverage**

Intercept award collection/detail/refresh and alert endpoints with representative fixtures. Verify:

- creation from empty state;
- Simple summary;
- Analyst ledger;
- mode persistence after reload;
- provider-disabled refresh;
- alert creation;
- keyboard focus order;
- no horizontal page overflow at 390px;
- desktop ledger at 1440px.

- [ ] **Step 2: Run browser coverage**

Run the project Playwright command or the narrow spec with the configured web server. Expected: all checks pass.

- [ ] **Step 3: Inspect the live app**

Run production at `http://127.0.0.1:3003/awards`. Inspect mobile, tablet, and desktop. Read screenshots back and fix material hierarchy, spacing, contrast, or overflow defects.

- [ ] **Step 4: Run Impeccable critique and audit**

Run the bundled detector on the created TSX/CSS files, then review focus, states, contrast, responsive behavior, and AI-slop bans. Fix every P0/P1 and material P2.

- [ ] **Step 5: Run the assembled gate**

```powershell
npm.cmd run test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Expected: all project gates pass. Record any inherited failure separately with evidence.

## Plan self-review

- Spec coverage: FR-001 through FR-010 map to Tasks 1–5.
- Placeholder scan: no TBD, TODO, “similar to,” or unspecified error-handling steps remain.
- Type consistency: the detail API’s `cashComparison` shape is consumed by the pure view model and both presentation modes.
- Scope: one cohesive surface plus its narrow data seam and existing-app navigation.
