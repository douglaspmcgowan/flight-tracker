---
name: source-command-docket
description: Route a brief, review, or decision to Douglas's existing personal Docket and preserve any blocking answer in TASK.md. Use when Douglas asks to docket, queue for review, send to his phone, or collect a decision.
---

# Docket

Use the existing Docket repository and client. Search the current repository, `~/projects/docket`, and `~/.agents/MAP.md` before choosing a path. Do not create another queue, publisher, or card schema.

## Current contract

- Personal cards publish to the authenticated cloud board by default.
- Existing `sensitive` metadata is historical and does not filter personal publication.
- `REVIEW_URL` is the non-secret endpoint.
- Bitwarden holds one hidden `REVIEW_SECRET` field.
- Vercel receives the same bearer value under `APP_SECRET`.
- `BLOB_READ_WRITE_TOKEN` is a separate provider-managed storage credential.
- The full-tuple broker injects `REVIEW_SECRET` only into an approved Docket command. Never read, print, log, or place the value in arguments.

## Procedure

1. **Find the existing client.** Prefer `$env:USERPROFILE\projects\docket\enqueue.js`. If absent, use the repository map or report the missing client.
2. **Reuse existing groups and cards.** List current groups before naming another project or set:

   ```powershell
   node "$env:USERPROFILE\projects\docket\enqueue.js" --groups
   ```

   Use `--list "<project>"` to find a living card that should be updated.
3. **Choose one kind.**
   - `brief`: information Douglas should read and retain.
   - `review`: one independently judgeable artifact.
   - `decision`: a real fork with consequences.
4. **Make the card self-contained.** Include the recommendation, the reason, the consequences of each option when relevant, the project/set, and a stable content-derived ID for repeatable updates.
5. **Write value-safe JSON to a temporary file.** Keep credentials and unrelated private data out of the body.
6. **Publish through the registered full-tuple broker.** The approved tuple must bind the exact Node executable, `enqueue.js` arguments, destination variable `REVIEW_SECRET`, environment, Bitwarden item ID, and field name. When the tuple is unavailable, preserve the JSON in the existing Docket outbox and record the gate.
7. **Verify the returned card ID.** A success claim requires the client response and ID. Delete the temporary JSON after verified publication.
8. **Record blocking decisions.** Add `[?] docket <id> — <title>` under `TASK.md` → `Needs decision`. Include the Docket location and the next pull/sync command. Non-blocking reading does not enter the task ledger.
9. **Receive decisions through the existing client or `sync-cloud.js`.** Accept a pulled decision only for a known local card and only when its answer timestamp is newer than the local result.

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
```

Run the repository test suite when code or sync policy changed. A missing credential, broker tuple, endpoint, or client is a named external gate and remains in `TASK.md`.
