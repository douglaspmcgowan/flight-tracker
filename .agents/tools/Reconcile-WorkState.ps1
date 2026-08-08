param(
    [Parameter(Mandatory)] [string]$Root,
    [switch]$Repair,
    # Bind this project's state to its repository identity so the same checkout is writable
    # from a container or a second device. Runs only at the canonical project.root, reads the
    # value from this checkout's own git origin, and commits through the normal event chain.
    [switch]$BindRemote
)

$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'WorkScope.psm1') -Force
if ($BindRemote) {
    Set-WorkScopeProjectRemote -Root $Root -Confirmed | ConvertTo-Json -Depth 5
}
$before = Test-WorkScopeReconciliation -Root $Root
if (-not $before.reconciled -and $Repair) {
    $transactionPath = Join-Path $Root '.agents\work\transaction.json'
    if (Test-Path -LiteralPath $transactionPath) {
        Repair-WorkScopeTransaction -Root $Root | Out-Null
    }
    if ((Test-WorkScopeState -Root $Root).valid) {
        Sync-WorkScopeViews -Root $Root | Out-Null
    }
}
$result = Test-WorkScopeReconciliation -Root $Root
$result | ConvertTo-Json -Depth 20
if (-not $result.reconciled) {
    exit 1
}
