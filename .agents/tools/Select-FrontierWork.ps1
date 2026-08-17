param(
    [Parameter(Mandatory)] [string]$Root,
    # Open a foreign-track item in this session for this selection only, leaving the frontier
    # settings on disk untouched. Without it, starting a new initiative means rewriting two global
    # settings tuned for unrelated work and remembering to restore both.
    [string]$DiscoveryId,
    [switch]$TakeIndependentTrack,
    [switch]$Confirmed
)

$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'WorkScope.psm1') -Force
Select-WorkScopeFrontier @PSBoundParameters | ConvertTo-Json -Depth 30
