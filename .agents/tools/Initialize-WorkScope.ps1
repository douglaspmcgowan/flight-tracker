param(
    [Parameter(Mandatory)] [string]$Root,
    [Parameter(Mandatory)] [string]$ProjectId,
    [Parameter(Mandatory)] [ValidateSet('application', 'operations', 'agent-harness', 'coordination', 'client')] [string]$ProjectKind,
    [Parameter(Mandatory)] [string]$InitiativeId,
    [Parameter(Mandatory)] [string]$TrackId,
    [Parameter(Mandatory)] [string]$CapabilityId,
    [Parameter(Mandatory)] [string]$CapabilityName,
    [Parameter(Mandatory)] [ValidateSet('D0', 'D1', 'D2', 'D3', 'D4', 'D5')] [string]$TargetDepth,
    [ValidateSet('drilldown', 'expand')] [string]$FrontierMode = 'drilldown',
    [ValidateSet('D0', 'D1', 'D2', 'D3', 'D4', 'D5')] [string]$DepthCeiling = 'D4',
    [ValidateSet('capability', 'track', 'project', 'portfolio', 'system')] [string]$BreadthBoundary = 'track',
    [ValidateSet('dependency-first', 'highest-value', 'highest-risk', 'shortest-ready', 'balanced')] [string]$SelectionStrategy = 'dependency-first',
    [Parameter(Mandatory)] [string]$OwnerSession
)

$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'WorkScope.psm1') -Force
Initialize-WorkScopeProject @PSBoundParameters | ConvertTo-Json -Depth 30
