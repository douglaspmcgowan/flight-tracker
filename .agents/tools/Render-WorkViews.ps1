param([Parameter(Mandatory)] [string]$Root)

$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'WorkScope.psm1') -Force
Sync-WorkScopeViews -Root $Root | ConvertTo-Json -Depth 20
