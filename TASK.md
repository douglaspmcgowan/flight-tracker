# Task

## Goal

Publish the Flight Tracker coordination repository with its portable project contract, durable documents, sidecar source, and verified exclusion boundary.

## Queue

- [~] Complete local project, security, and repository-boundary verification.
- [ ] Publish `douglaspmcgowan/flight-tracker` from `master` with the `agent-project` topic.
- [ ] Verify the pushed repository in a disposable clone and confirm the GitHub Actions checks.

## Blocked

- Local Python compilation is unavailable because the previous Python 3.12 installation was removed. The repository workflow runs the required Python 3.12 compilation on GitHub.

## Verification

- Publication-boundary preflight observed failing before implementation and passing afterward.
- Run `C:\Users\dougl\.agents\tools\Test-AgentProjectState.cmd -Repository .`.
- Run redacted Gitleaks, staged whitespace checks, remote workflow checks, and disposable-clone verification.
