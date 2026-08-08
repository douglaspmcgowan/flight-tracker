<!-- GENERATED FROM .agents/work/state.json. DO NOT EDIT DIRECTLY. -->
# Active Work

Project: flight-tracker
Initiative: flight-finder-coordination
Primary track: project-operations
Capability: handoff-completion
Depth: D2 (Complete)
Frontier mode: drilldown
Depth ceiling: D2
Breadth boundary: capability
Selection strategy: dependency-first
Status: closed

## Goal

Complete and verify Flight Finder handoff completion at D2.

## In scope

- handoff-completion

## Out of scope

- None

## Done when

- Every task below is closed.
- Scope-cell verification evidence is recorded.
- Generated views reconcile with canonical state.

## Tasks

- [x] FT-FULL-CONTRACT: Run the existing shared harness verifier through a project-local PowerShell 7 wrapper because the prescribed legacy cmd owner is incompatible with Process.Kill(true) (status: closed; acceptance: The canonical shared harness project verifier exits zero against the enrolled coordination checkout under PowerShell 7.)

## Declared acceptance checks

- FT-FULL-CONTRACT/full-project-contract: C:\Program Files\WindowsApps\Microsoft.PowerShell_7.6.4.0_x64__8wekyb3d8bbwe\pwsh.exe argv=["-NoProfile","-File","scripts\\verify-agent-project.ps1"]; inputs=[scripts/verify-agent-project.ps1]; artifacts=[MAP.md, scripts/verify-agent-project.ps1, skills-manifest.json]; timeout=300s; max-output=2097152B

## Blockers and dependencies

- None

## Verification evidence

- [test/pass] FT-FULL-CONTRACT | .agents/work/evidence/3e112356-826c-4a43-a9fc-d7cedd56d36a.json | sha256:6eaaa00c00da | receipt:3e112356-826c-4a43-a9fc-d7cedd56d36a

## Discoveries captured

- None

## Next transition

stop
