param([Parameter(Mandatory)] [string]$Root)

$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'WorkScope.psm1') -Force
$result = Test-WorkScopeState -Root $Root
$result | ConvertTo-Json -Depth 20
if (-not $result.valid) {
    exit 1
}
