param(
    [Parameter(Mandatory)] [string]$Root,
    [Parameter(Mandatory)]
    # `select-frontier` is what moves work forward after a cell closes. Without it the tool
    # could close a cell and never open the next one: `Get-WorkResume` reported
    # `frontier_transition` as the next action and nothing here could perform it, so a project
    # that finished a cell had no supported way to start another. Initialize-WorkScopeProject
    # is not the escape hatch -- it throws on existing state.
    [ValidateSet('add-task', 'complete-task', 'retire-task', 'close-cell', 'select-frontier', 'set-ownership', 'transfer-ownership', 'retire-discovery')]
    [string]$Action,
    [string]$TaskId,
    [string]$DiscoveryId,
    [ValidateSet('ready', 'blocked', 'closed', 'rejected')] [string]$DiscoveryStatus,
    [string]$Reason,
    [string]$Title,
    [string]$Acceptance,
    [string[]]$Dependencies = @(),
    [string]$CheckId,
    [ValidateSet('test', 'command')] [string]$CheckVerifier,
    [string]$CheckExecutable,
    [string[]]$CheckArguments = @(),
    [string[]]$CheckInputs = @(),
    [string[]]$CheckArtifacts = @(),
    [ValidateRange(1, 3600)] [int]$CheckTimeoutSeconds = 300,
    [ValidateRange(64, 10485760)] [int64]$CheckMaxOutputBytes = 1048576,
    [string[]]$Evidence = @(),
    [string]$SessionId,
    [string[]]$Artifacts = @(),
    [string]$Artifact,
    [string]$FromSession,
    [string]$ToSession,
    [switch]$Confirmed
)

$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'WorkScope.psm1') -Force

# See Expand-WorkScopePackedArgument in WorkScope.psm1 for why this is needed.
$Dependencies   = Expand-WorkScopePackedArgument $Dependencies
$CheckArguments = Expand-WorkScopePackedArgument $CheckArguments
$CheckInputs    = Expand-WorkScopePackedArgument $CheckInputs
$CheckArtifacts = Expand-WorkScopePackedArgument $CheckArtifacts
$Evidence       = Expand-WorkScopePackedArgument $Evidence
$Artifacts      = Expand-WorkScopePackedArgument $Artifacts

$result = switch ($Action) {
    'add-task' {
        if (-not $TaskId -or -not $Title -or -not $Acceptance -or
            -not $CheckId -or -not $CheckVerifier -or -not $CheckExecutable) {
            throw 'add-task requires TaskId, Title, Acceptance, CheckId, CheckVerifier, and CheckExecutable.'
        }
        Add-WorkScopeTask -Root $Root -TaskId $TaskId -Title $Title -Acceptance $Acceptance `
            -Dependencies $Dependencies -CheckId $CheckId -CheckVerifier $CheckVerifier `
            -CheckExecutable $CheckExecutable -CheckArguments $CheckArguments `
            -CheckInputs $CheckInputs -CheckArtifacts $CheckArtifacts `
            -CheckTimeoutSeconds $CheckTimeoutSeconds `
            -CheckMaxOutputBytes $CheckMaxOutputBytes
    }
    'complete-task' {
        if (-not $TaskId) {
            throw 'complete-task requires TaskId.'
        }
        Complete-WorkScopeTask -Root $Root -TaskId $TaskId -Evidence $Evidence
    }
    'retire-task' {
        if (-not $TaskId) {
            throw 'retire-task requires TaskId.'
        }
        if (-not $Reason) {
            throw 'retire-task requires Reason.'
        }
        Set-WorkScopeTaskRetired -Root $Root -TaskId $TaskId -Reason $Reason
    }
    'close-cell' {
        Close-WorkScopeCell -Root $Root -Evidence $Evidence
    }
    'select-frontier' {
        Select-WorkScopeFrontier -Root $Root
    }
    'retire-discovery' {
        if (-not $DiscoveryId -or -not $DiscoveryStatus -or -not $Reason) {
            throw 'retire-discovery requires DiscoveryId, DiscoveryStatus, and Reason.'
        }
        Set-WorkScopeDiscoveryStatus -Root $Root -Id $DiscoveryId -Status $DiscoveryStatus -Reason $Reason -Evidence $Evidence
    }
    'set-ownership' {
        if (-not $SessionId) {
            throw 'set-ownership requires SessionId.'
        }
        Set-WorkScopeOwnership -Root $Root -SessionId $SessionId -Artifacts $Artifacts
    }
    'transfer-ownership' {
        if (-not $Artifact -or -not $FromSession -or -not $ToSession) {
            throw 'transfer-ownership requires Artifact, FromSession, and ToSession.'
        }
        Move-WorkScopeOwnership -Root $Root -Artifact $Artifact -FromSession $FromSession -ToSession $ToSession -Confirmed:$Confirmed
    }
}
$result | ConvertTo-Json -Depth 30
