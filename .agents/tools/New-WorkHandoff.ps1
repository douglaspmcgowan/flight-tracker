param(
    [Parameter(Mandatory)] [string]$Root,
    [Parameter(Mandatory)] [string]$BackburnerId,
    [switch]$Overwrite
)

$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'WorkScope.psm1') -Force
New-WorkScopeHandoff @PSBoundParameters | ConvertTo-Json -Depth 20
