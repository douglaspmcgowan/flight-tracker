param([Parameter(Mandatory)] [string]$Root)

$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'WorkScope.psm1') -Force
Get-WorkScopeResume -Root $Root | ConvertTo-Json -Depth 20
