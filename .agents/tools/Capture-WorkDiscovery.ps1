param(
    [Parameter(Mandatory)] [string]$Root,
    [Parameter(Mandatory)] [string]$Id,
    [Parameter(Mandatory)] [string]$Title,
    [Parameter(Mandatory)] [string]$SuggestedTrack,
    [Parameter(Mandatory)] [string]$SuggestedCapability,
    [Parameter(Mandatory)] [ValidateSet('D0', 'D1', 'D2', 'D3', 'D4', 'D5')] [string]$EntryDepth,
    [Parameter(Mandatory)] [string]$DiscoveredFrom,
    [Parameter(Mandatory)] [ValidateSet('adjacent', 'prerequisite', 'follow-up', 'defect', 'opportunity')] [string]$Relationship,
    [string[]]$Dependencies = @(),
    [string[]]$Blockers = @(),
    [string[]]$Conflicts = @(),
    [Parameter(Mandatory)] [ValidateSet('low', 'medium', 'high')] [string]$Value,
    [Parameter(Mandatory)] [ValidateSet('low', 'medium', 'high')] [string]$Risk,
    [Parameter(Mandatory)] [string[]]$Evidence
)

$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'WorkScope.psm1') -Force

# See Expand-WorkScopePackedArgument in WorkScope.psm1 for why this is needed.
foreach ($name in @('Dependencies', 'Blockers', 'Conflicts', 'Evidence')) {
    if ($PSBoundParameters.ContainsKey($name)) {
        $PSBoundParameters[$name] = Expand-WorkScopePackedArgument $PSBoundParameters[$name]
    }
}

Add-WorkScopeDiscovery @PSBoundParameters | ConvertTo-Json -Depth 30
