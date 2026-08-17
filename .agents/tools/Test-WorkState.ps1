param([Parameter(Mandatory)] [string]$Root)

$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'WorkScope.psm1') -Force -DisableNameChecking
$result = Test-WorkScopeState -Root $Root

# A vendored schema that lags canonical leaves state VALID and writes IMPOSSIBLE, so it can never
# surface as a validity error. Report it here as a warning instead, before a capture is refused.
$currency = Test-WorkScopeSchemaCurrency -Root $Root
$result = $result | Select-Object *, @{ Name = 'schema_currency'; Expression = { $currency } }
$result | ConvertTo-Json -Depth 20
if (-not $currency.current -and $currency.status -ne 'not_enrolled') {
    Write-Warning "Vendored Work Scope schema is $($currency.status) against canonical. New writes using fields this snapshot predates will be refused. Refresh with: $($currency.remedy)"
}
if (-not $result.valid) {
    exit 1
}
