# Project map

## Core documents

| File | Owns |
|---|---|
| `AGENTS.md` | Portable project behavior |
| `CLAUDE.md` | Claude import |
| `.cursor/rules/00-project-contract.mdc` | Cursor project pointer |
| `TASK.md` | Active goal, queue, blockers, decisions, completed evidence, and next verifier |
| `STATUS.md` | Durable capability state |
| `LOG.md` | Append-only completed work |
| `BACKBURNER.md` | Parked work |
| `MAP.md` | This architecture and navigation map |
| `DESIGN.md` | Universal and project interface rules |
| `PRODUCT.md` | Optional product intent |
| `MEMORY.md` | Lean durable-reference index |
| `skills-manifest.json` | Canonical skill bindings |
| `data-manifest.yaml` | External-data authorities, adapters, and restore rules |
| `secret-manifest.json` | Value-free secret inventory and trust boundaries |
| `.agents/archive/pre-harness-v3/` | Read-only provenance for retired task-state files |

## Architecture

| Component | Purpose | Entry point | Owner |
|---|---|---|---|
| Coordination documents | Durable operating state, research, and handoff material | Repository root and `research/` | This repository |
| Fast-flights sidecar | Normalizes keyless Google Flights results for the Flight Finder application | `fast-flights-sidecar/main.py` | This repository |
| Flight Finder application | Next.js application, persistence, alerts, and deployment | `C:\Users\dougl\projects\base-flight-finder` | Separate Git repository |

## Important paths

| Path | Purpose | Generated | Committed |
|---|---|---|---|
| `research/` | Durable research and integration planning | no | yes |
| `fast-flights-sidecar/*.py` | Sidecar source and explicit probe utilities | no | yes |
| `fast-flights-sidecar/requirements.txt` | Reproducible direct dependencies | no | yes |
| `fast-flights-sidecar/venv/` | Local Python environment | yes | no |
| `fast-flights-sidecar/runtime.*.log` | Local service output | yes | no |
| `taskstate/` | Hook/runtime task telemetry | yes | no |
| `C:\Users\dougl\Data\Projects\flight-tracker` | External mutable project-data root | no | no |
| `C:\Users\dougl\projects\base-flight-finder` | Separate application repository | no | no |

## Data flow

The Flight Finder application sends a normalized search request to the local sidecar. `fast-flights` retrieves current Google Flights results, and `main.py` converts them to the application price-data shape. Runtime application state and credentials remain in the separate application repository or its external services. This repository stores documentation, research, and the sidecar source.

## Integrations

| System | Direction | Credential name | Failure behavior |
|---|---|---|---|
| `base-flight-finder` | both | names documented in the application repository | The application handles failures according to its own runbook; this repository does not copy its credentials or runtime data. |
| Google Flights via `fast-flights` | inbound | none | Sidecar returns an HTTP error when the upstream query fails. |

## Ownership and concurrency

The coordination repository and `base-flight-finder` are independent Git repositories. The sidecar uses local port `8123`; do not run parallel sidecar instances on the same port. Application worktrees, databases, deployment targets, and credentials are owned by `base-flight-finder`.

## Update rule

Update this file when a component boundary, data flow, owner, integration, core document, or important path changes.
