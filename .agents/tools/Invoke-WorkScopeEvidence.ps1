param(
    [Parameter(Mandatory)] [string]$Root,
    [Parameter(Mandatory)] [string]$CheckId,
    [Parameter(Mandatory)] [ValidateSet('test', 'command')] [string]$Verifier,
    [Parameter(Mandatory)] [string]$Subject,
    [Parameter(Mandatory)] [string]$Executable,
    [string[]]$Arguments = @(),
    [string[]]$Artifacts = @()
)

$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'WorkScope.psm1') -Force
Invoke-WorkScopeVerification @PSBoundParameters | ConvertTo-Json -Depth 20
