param(
    [Parameter(Mandatory)] [string]$Root,
    [Parameter(Mandatory)] [string]$SessionId,
    [Parameter(Mandatory)] [ValidateSet('read', 'modify', 'create', 'delete', 'destructive_action', 'external_publish', 'credential_access')] [string]$ActionKind,
    [Parameter(Mandatory)] [string]$Artifact,
    [string]$ProjectId,
    [string]$TrackId,
    [Parameter(Mandatory)] [string]$CapabilityId
)

$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'WorkScope.psm1') -Force
$result = Invoke-WorkScopeGuard @PSBoundParameters
$result | ConvertTo-Json -Depth 20
if (-not $result.allowed) {
    exit 2
}
