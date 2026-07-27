# Typography and Vercel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace IBM Plex Mono with a semantic Outfit/Geist Mono system, enforce the rule globally, verify the assembled application, and deploy the Next.js web surface to Vercel.

**Architecture:** Shared CSS tokens define the type roles. Component styles select proportional metadata or tabular data according to content. Vercel runs the web/request tier with external data services, while continuous scraping and scheduling remain an external-worker responsibility.

**Tech Stack:** Next.js 16, React 19, CSS Modules, Plotly, Vitest, TypeScript, ESLint, Vercel CLI.

---

### Task 1: Establish the semantic type tokens

**Files:**
- Modify: `apps/web/src/styles/globals.css`
- Modify: `apps/web/src/app/layout.tsx`
- Modify: `DESIGN.md`

- [ ] Replace `--font-mono` with `--font-data: 'Geist Mono', monospace`.
- [ ] Add Geist Mono weights 400–600 to the existing Google Fonts stylesheet and remove IBM Plex Mono.
- [ ] Update the documented font roles and example tokens.
- [ ] Run `rg -n "IBM Plex Mono|font-mono" DESIGN.md apps/web/src` and retain only component-level migration hits.

### Task 2: Migrate component typography

**Files:**
- Modify: CSS modules under `apps/web/src/`
- Modify: `apps/web/src/components/PriceChart.tsx`

- [ ] Change ordinary metadata selectors to `var(--font-body)`.
- [ ] Add `font-variant-numeric: tabular-nums` to date and compact quantity metadata.
- [ ] Change genuine data, command, identifier, and table selectors to `var(--font-data)`.
- [ ] Change Plotly font-family strings to `Geist Mono, monospace`.
- [ ] Run `rg -n "IBM Plex Mono|font-mono" DESIGN.md apps/web/src` and require zero results.

### Task 3: Enforce the global design rule

**Files:**
- Modify: `C:\Users\dougl\.codex\AGENTS.md`

- [ ] Add a durable typography section banning IBM Plex Mono.
- [ ] State the semantic boundary between proportional UI copy and monospace data.
- [ ] Re-read the inserted rule and confirm the existing rhetorical-antithesis rule remains unchanged.

### Task 4: Verify the assembled application

**Files:**
- Test: `apps/web/src/components/AwardWorkspace/AwardWorkspace.test.tsx`
- Test: existing repository suites

- [ ] Run the Impeccable context and typography detector.
- [ ] Run `npm.cmd run lint`.
- [ ] Run `npm.cmd run typecheck`.
- [ ] Run `npm.cmd run test`.
- [ ] Run `npm.cmd run build`.
- [ ] Run `npm.cmd run build --workspace=@flight-finder/cli`.
- [ ] Inspect `/awards` at desktop and narrow widths and verify computed font families.

### Task 5: Deploy the Vercel web surface

**Files:**
- Create if required: `vercel.json`
- Modify if required: `.env.example`

- [ ] Confirm Vercel authentication without exposing credentials.
- [ ] Link or create the Vercel project from the repository root.
- [ ] Configure `CRON_ENABLED=false` and required public/runtime variables through Vercel's secret store.
- [ ] Deploy the verified source state to production.
- [ ] Check the production URL and `/api/health`.
- [ ] Record missing external database, provider, Redis, or worker dependencies as deployment blockers when applicable.

### Task 6: Handoff and completion audit

**Files:**
- Modify: `STATUS.md`
- Modify: `LOG.md`
- Modify: `WORK_QUEUE.md`

- [ ] Record the deployment URL and verified capabilities.
- [ ] Separate working features from provider-gated and worker-gated features.
- [ ] Explain the end-to-end application flow in chat.
- [ ] List the shortest path to operational completion.
