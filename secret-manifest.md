# Secret manifest

Project: flight-tracker

This generated view contains variable names and operating metadata only. Secret values, vault session keys, recovery keys, and access tokens are forbidden.

| Variable | Purpose | Provider | Trust boundary | Owner | Rotation | Consumers | Status |
|---|---|---|---|---|---|---|---|
| `PROJECT_DATA_ROOT` | Non-secret filesystem path for external mutable project data | local filesystem | development | Douglas | N/A |  | non-secret |

Canonical source: `secret-manifest.json`
Refresh: `C:\Users\dougl\.agents\tools\Update-SecretManifest.cmd -Repository <repo>`
