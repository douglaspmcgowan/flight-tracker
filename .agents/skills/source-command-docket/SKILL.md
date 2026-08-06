---
name: source-command-docket
description: Route a brief, review, or decision to Douglas's existing personal Docket and preserve any blocking answer in authoritative project task state. Use when Douglas asks to docket, queue for review, send to his phone, or collect a decision.
---

# Docket

Use the existing Docket repository and client. Search the current repository, `~/projects/docket`, and `~/.agents/MAP.md` before choosing a path. Do not create another queue, publisher, or card schema.

## Work Scope routing

Before recording any Docket decision in task state, check the exact project path `.agents/work/state.json`. When it exists, that structured state is authoritative and `PROJECT.md`, `TRACKS.md`, `TASK.md`, `BACKBURNER.md`, and `LOG.md` are generated, read-only views.

- Load and follow the `work-scope` skill, including its guard, ownership, evidence, and handoff rules. Resolve tools from the package containing that loaded skill.
- Run `Test-WorkState.ps1`, `Get-WorkResume.ps1`, and `Reconcile-WorkState.ps1` with `-Root <project-root>`. A present but invalid state fails closed; do not fall back to legacy files.
- A blocking decision inside the active capability becomes a structured task through `Update-WorkState.ps1`, with acceptance criteria requiring the stable Docket decision record. Bind closure only to executed evidence from `Invoke-WorkScopeEvidence.ps1`.
- Add dependent work with `-Dependencies <decision-task-id>`. Create the decision task first because Work Scope rejects missing dependency IDs.
- A decision outside the active cell becomes a `prerequisite` or `adjacent` item through `Capture-WorkDiscovery.ps1`. Use `New-WorkHandoff.ps1` for an independently owned outcome.
- Never add a `[?]` marker directly to a generated `TASK.md`. The direct `TASK.md` instruction below is legacy-only.

## Current contract

- **The authenticated cloud board is the default target for every read and every mutation.** Douglas reviews `https://vault-review-mobile.vercel.app`; the loopback board is normally not running. A card that exists only in the local store has not reached him.
- The local SQLite store at `$env:USERPROFILE\.docket-local` is the mirror and the offline path, not the authority for what Douglas sees.
- `docket-cli.js` (entered through `docket.ps1`) is the single interface for list, get, create, update, delete, move, archive, unarchive, results, groups, push, sync, prune, mirror, export, and import. Do not hand-roll HTTP calls or a second client.
- Conflict rule: card content resolves local-wins (agents author locally and push); answers resolve cloud-wins (Douglas answers on his phone, `sync` merges only newer answers for known local ids).
- `push`/`sync` are additive and never remove a cloud card. Reconcile drift explicitly with `prune`.
- Existing `sensitive` metadata is historical and does not filter personal publication.
- `REVIEW_URL` is the non-secret endpoint.
- Bitwarden Secrets Manager resource ID `6006ee63-f495-497f-a4c9-b496017e7266` is the existing `REVIEW_SECRET` resource in the `Agent Runtime` project. The allowlist binds that value-safe resource ID to child environment variable `REVIEW_SECRET`.
- Vercel receives the same bearer value under `APP_SECRET`.
- `BLOB_READ_WRITE_TOKEN` is a separate provider-managed storage credential.
- The full-tuple broker injects `REVIEW_SECRET` only into an approved Docket command. Never read, print, log, or place the value in arguments.
- Reuse the existing Bitwarden `Agents` organization, `Agent Runtime` project, `REVIEW_SECRET`, and available machine account. Discover and verify these value-free identities before any creation action.
- Registered broker commands: `docket-sync` runs `sync-cloud.js`; **`docket-admin` runs `docket-cli.js --from-request` and is the tuple every cloud CRUD command rides inside**; `docket-align-vercel-secret` runs `scripts\align-vercel-app-secret.js`.
- One `docket-admin` tuple exists rather than one per subcommand, because the broker pins an exact argument list. The subcommand travels in `$env:USERPROFILE\.docket-local\cli-request.json`, written by `docket.ps1`. Request mode rejects `--url`, so a tampered request file cannot aim the injected bearer at another host.

Run the alignment command only when setting up or repairing the Vercel production bearer:

```powershell
& "$env:USERPROFILE\.agents\tools\Invoke-WithBitwardenSecret.ps1" -CommandId "docket-align-vercel-secret"
```

## Procedure

1. **Find the existing client.** Use `$env:USERPROFILE\projects\docket` (CLI, server, store adapter) and `$env:USERPROFILE\.docket-local` (mirror). Report a missing repository or store.
2. **Read the board before writing to it.** The cloud is the default target, so this is one command:

   ```powershell
   & "$env:USERPROFILE\projects\docket\docket.ps1" 'groups'
   & "$env:USERPROFILE\projects\docket\docket.ps1" 'list --search "<topic>" --fields id,title,project,set'
   ```

   Reuse an existing project, set, and stable card ID rather than inventing a parallel grouping.
3. **Choose one kind.**
   - `brief`: information Douglas should read and retain.
   - `review`: one independently judgeable artifact.
   - `decision`: a real fork with consequences.
4. **Make the card self-contained.** Include the recommendation, the reason, the consequences of each option when relevant, the project/set, and a stable content-derived ID for repeatable updates.
5. **Write value-safe JSON to an outbox folder, one file per card.** Keep credentials and unrelated private data out of the body.
6. **Load the outbox into the local mirror, then publish.**

   ```powershell
   node "$env:USERPROFILE\projects\docket\docket-cli.js" import --target local --outbox "<outbox-folder>"
   & "$env:USERPROFILE\projects\docket\docket.ps1" 'sync'
   ```

   `sync` publishes every unresolved local card and pulls answers. The broker tuple pins the exact Node executable, script, working directory, environment allowlist, Bitwarden project ID, resource ID, and destination variable.
7. **Retire what is done.** When a card's subject has been resolved, archive it rather than leaving it open:

   ```powershell
   & "$env:USERPROFILE\projects\docket\docket.ps1" 'archive <id> <id> --comment "resolved <date>"'
   ```

   Archive on **both** targets — a local archive alone leaves the card on Douglas's board. Use `delete` only when the card should not exist at all, and export a backup first.
8. **Verify with an independent read, never a push count.**

   ```powershell
   & "$env:USERPROFILE\projects\docket\docket.ps1" 'export --out "<backup.json>"'
   ```

   Compare the cloud pending set against the local pending set id-for-id. Report any difference. Preserve failed outbox records and report their IDs.
9. **Reconcile drift when counts disagree.** `push` never removes a cloud card, so cloud-only cards accumulate. Run `docket.ps1 'prune --dry-run'`, then `prune --archive` (non-destructive) or `prune` (delete). Always export a backup first.
10. **Record blocking decisions.** Add `[?] docket <id> — <title>` under `TASK.md` → `Needs decision`. Include the Docket location and the next brokered sync command. Non-blocking reading does not enter the task ledger.
11. **Accept pulled decisions conservatively.** `sync` accepts a decision only for a known local card and only when its answer timestamp is newer than the local result.

## Batch discipline

- Use one card per independently decidable issue.
- Merge near-duplicate judgments.
- Update a living card under its stable ID.
- Delegate large card assembly only when source files and ownership are disjoint.
- Report succeeded and failed IDs separately.

## Verification

Before completion:

```powershell
node "$env:USERPROFILE\projects\docket\enqueue.js" --selftest
node "$env:USERPROFILE\projects\docket\sync-cloud.js" --selftest
node --test "$env:USERPROFILE\projects\docket\test\docket-cli.test.js"
```

Run the repository test suite when code or sync policy changed. Never run `sync.js` from `Projects\vault-review-mobile`; that folder is an older portable bundle whose `sync.js` is an unsafe raw publisher. A missing credential, machine-account project assignment, broker tuple, endpoint, or client is a named external gate and remains in `TASK.md`.
