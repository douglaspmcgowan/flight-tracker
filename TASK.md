<!-- GENERATED FROM .agents/work/state.json. DO NOT EDIT DIRECTLY. -->
# Active Work


Project: flight-tracker
Initiative: flight-finder-coordination
Primary track: project-operations
Capability: handoff-completion
Cell: handoff-completion@D2.followup.1
Depth: D2 (Complete)
Frontier mode: drilldown
Depth ceiling: D2
Breadth boundary: capability
Selection strategy: dependency-first
Status: closed

## Goal

Follow up on handoff-completion@D2: Closed FT-FULL-CONTRACT evidence has gone stale: Windows silently auto-updated the pinned PowerShell 7 AppX package from 7.6.4.0 to a newer build, so the declared acceptance-check executable path no longer exists, and skills-manifest.json content has also drifted since capture. The underlying verification genuinely passed on 2026-08-08; re-running full-project-contract now against the current environment to refresh the evidence trail.

## In scope

- handoff-completion

## Out of scope

- None

## Done when

- Every task below is closed.
- Scope-cell verification evidence is recorded.
- Generated views reconcile with canonical state.

## Tasks

- [x] FT-FULL-CONTRACT-V2: Re-verify full project contract against current environment (status: closed; acceptance: The canonical shared harness project verifier exits zero against the enrolled coordination checkout under the currently installed PowerShell 7.)

## Declared acceptance checks

- FT-FULL-CONTRACT-V2/full-project-contract: C:\Program Files\WindowsApps\Microsoft.PowerShell_7.6.5.0_x64__8wekyb3d8bbwe\pwsh.exe argv=["-NoProfile","-File","scripts\\verify-agent-project.ps1"]; inputs=[scripts/verify-agent-project.ps1]; artifacts=[MAP.md, scripts/verify-agent-project.ps1, skills-manifest.json]; timeout=300s; max-output=2097152B

## Blockers and dependencies

- None

## Verification evidence

- [command/pass] FT-FULL-CONTRACT-V2 | .agents/work/evidence/11c92ea3-5b9c-402c-ac88-6492b8abae04.json | sha256:f648fc257ec7 | receipt:11c92ea3-5b9c-402c-ac88-6492b8abae04

## Discoveries captured

- None

## Next transition

stop
