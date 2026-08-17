param(
    [Parameter(Mandatory)] [string]$Root,
    [Parameter(Mandatory)]
    # `select-frontier` is what moves work forward after a cell closes. Without it the tool
    # could close a cell and never open the next one: `Get-WorkResume` reported
    # `frontier_transition` as the next action and nothing here could perform it, so a project
    # that finished a cell had no supported way to start another. Initialize-WorkScopeProject
    # is not the escape hatch -- it throws on existing state.
    # `amend-discovery` is the correcting entry. Capture and disposition were the only two
    # writers, so a finding whose facts decayed could only be closed and recaptured under a new
    # id, and a *closed* item could not be touched at all -- disposition refuses the status it
    # already holds. A wrong fact in a closure reason was therefore permanent, and the correction
    # ended up recorded outside the state file. It never changes status, so retirement keeps one
    # owner.
    # `set-intent` and `add-spec` are the request side of the model. Before them the schema went
    # project -> tracks -> capability@depth -> tasks -> evidence and encoded nothing about what was
    # asked, so a cell could close on complete evidence while the work had drifted entirely.
    # `definition_of_done` looked like the missing field but every project seeded it with "All
    # active-cell tasks are closed with evidence", which grades the bookkeeping rather than the
    # result. There is no separate `add-requirement`: a requirement and a specification are the same
    # testable statement at two altitudes, and keeping both copies only lets them drift.
    [ValidateSet('add-task', 'complete-task', 'retire-task', 'repair-closed-evidence', 'repair-closed-evidence-batch', 'close-cell', 'start-followup', 'block-cell', 'resume-cell', 'set-session-mode', 'select-frontier', 'accept-handoff', 'sync-schema', 'set-ownership', 'transfer-ownership', 'retire-discovery', 'supersede-discovery', 'recover-selected-discovery', 'amend-discovery', 'set-intent', 'add-spec')]
    [string]$Action,
    [string]$TaskId,
    # The request side: project intent (prose, why) and specs (testable, what must be true).
    [string]$Intent,
    [string]$SpecId,
    [string]$Statement,
    [string]$Notes,
    [ValidateSet('draft', 'active')] [string]$SpecStatus,
    [string[]]$Satisfies = @(),
    [string]$DiscoveryId,
    [string]$TargetDiscoveryId,
    [ValidateSet('ready', 'blocked', 'closed', 'rejected')] [string]$DiscoveryStatus,
    # retire-discovery -DiscoveryStatus blocked: what the item waits on. A prerequisite id,
    # or an open decision id from the owning project's Open Decisions document. Required
    # when blocking, because Reason reaches only the event log and Test-TaskStateFormat.ps1
    # grades the item.
    [string[]]$Blockers = @(),
    [string]$Reason,
    [hashtable]$TaskReceiptMap,
    [string]$SelectionEventId,
    [string]$ClosureEventId,
    [string]$PriorCellId,
    [string]$PriorClosureEventId,
    [string]$TrackId,
    [string]$CapabilityId,
    [string]$HandoffEventId,
    [string]$ReceiverSession,
    [string]$Title,
    # amend-discovery only. Named apart from the discovery's own vocabulary because -Value and
    # -Risk would read as generic on a tool that also writes tasks, checks and ownership.
    [ValidateSet('low', 'medium', 'high')] [string]$DiscoveryValue,
    [ValidateSet('low', 'medium', 'high')] [string]$DiscoveryRisk,
    [ValidateSet('actionable', 'waiting', 'human', 'time', 'archive', 'system', 'future')] [string]$ObligationClass,
    [string]$SemanticKey,
    [string]$Acceptance,
    [string[]]$Dependencies = @(),
    [string]$CheckId,
    [ValidateSet('test', 'command')] [string]$CheckVerifier,
    [string]$CheckExecutable,
    [string[]]$CheckArguments = @(),
    [string[]]$CheckInputs = @(),
    [string[]]$CheckArtifacts = @(),
    # 4 hours; see the note on the matching parameter in WorkScope.psm1. Change both together.
    [ValidateRange(1, 14400)] [int]$CheckTimeoutSeconds = 300,
    [ValidateRange(64, 10485760)] [int64]$CheckMaxOutputBytes = 1048576,
    [string[]]$Evidence = @(),
    [string]$SessionId,
    [ValidateSet('conductor')] [string]$Mode,
    [ValidateSet('on', 'off')] [string]$ModeStatus,
    [string]$Goal,
    [string[]]$Artifacts = @(),
    [string]$Artifact,
    [string]$FromSession,
    [string]$ToSession,
    [switch]$Confirmed
)

$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'WorkScope.psm1') -Force -DisableNameChecking

# See Expand-WorkScopePackedArgument in WorkScope.psm1 for why this is needed.
foreach ($name in @('Blockers', 'Dependencies', 'CheckArguments', 'CheckInputs', 'CheckArtifacts', 'Evidence', 'Artifacts', 'Satisfies')) {
    Set-Variable -Name $name -Value (Expand-WorkScopePackedArgument (Get-Variable -Name $name -ValueOnly))
}

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
            -CheckMaxOutputBytes $CheckMaxOutputBytes `
            -Satisfies $Satisfies
    }
    'set-intent' {
        if (-not $Intent) {
            throw 'set-intent requires Intent.'
        }
        Set-WorkScopeIntent -Root $Root -Intent $Intent
    }
    'add-spec' {
        if (-not $SpecId -or -not $Statement) {
            throw 'add-spec requires SpecId and Statement.'
        }
        $specArguments = @{ Root = $Root; SpecId = $SpecId; Statement = $Statement }
        if ($Notes) { $specArguments['Notes'] = $Notes }
        if ($SpecStatus) { $specArguments['Status'] = $SpecStatus }
        Add-WorkScopeSpec @specArguments
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
    'repair-closed-evidence' {
        if (-not $TaskId -or -not $Reason -or @($Evidence).Count -eq 0) {
            throw 'repair-closed-evidence requires TaskId, Reason, and Evidence.'
        }
        Repair-WorkScopeClosedEvidence -Root $Root -TaskId $TaskId -Evidence $Evidence -Reason $Reason
    }
    'repair-closed-evidence-batch' {
        if (-not $Reason -or $null -eq $TaskReceiptMap -or $TaskReceiptMap.Count -eq 0) {
            throw 'repair-closed-evidence-batch requires Reason and TaskReceiptMap.'
        }
        Repair-WorkScopeClosedEvidenceBatch -Root $Root -TaskReceiptMap $TaskReceiptMap -Reason $Reason
    }
    'close-cell' {
        Close-WorkScopeCell -Root $Root -Evidence $Evidence
    }
    'start-followup' {
        if (-not $TrackId -or -not $CapabilityId -or -not $PriorCellId -or -not $PriorClosureEventId -or -not $Reason) {
            throw 'start-followup requires TrackId, CapabilityId, PriorCellId, PriorClosureEventId, and Reason.'
        }
        Start-WorkScopeFollowup -Root $Root -TrackId $TrackId -CapabilityId $CapabilityId -PriorCellId $PriorCellId `
            -PriorClosureEventId $PriorClosureEventId -Reason $Reason -Confirmed:$Confirmed
    }
    'block-cell' {
        if (-not $Reason -or -not $Blockers) {
            throw 'block-cell requires Reason and Blockers.'
        }
        Block-WorkScopeCell -Root $Root -Reason $Reason -Blockers $Blockers
    }
    'resume-cell' {
        if (-not $Reason) { throw 'resume-cell requires Reason.' }
        Resume-WorkScopeBlockedCell -Root $Root -Reason $Reason
    }
    'set-session-mode' {
        if (-not $SessionId -or -not $Mode -or -not $ModeStatus -or -not $Goal) {
            throw 'set-session-mode requires SessionId, Mode, ModeStatus, and Goal.'
        }
        Set-WorkScopeSessionMode -Root $Root -SessionId $SessionId -Mode $Mode -Status $ModeStatus -Goal $Goal
    }
    'select-frontier' {
        Select-WorkScopeFrontier -Root $Root
    }
    'accept-handoff' {
        if (-not $DiscoveryId -or -not $SelectionEventId -or -not $HandoffEventId -or -not $ReceiverSession) {
            throw 'accept-handoff requires DiscoveryId, SelectionEventId, HandoffEventId, and ReceiverSession.'
        }
        Accept-WorkScopeHandoff -Root $Root -Id $DiscoveryId -SelectionEventId $SelectionEventId `
            -HandoffEventId $HandoffEventId -ReceiverSession $ReceiverSession -Confirmed:$Confirmed
    }
    'sync-schema' {
        Sync-WorkScopeSchema -Root $Root
    }
    'retire-discovery' {
        if (-not $DiscoveryId -or -not $DiscoveryStatus -or -not $Reason) {
            throw 'retire-discovery requires DiscoveryId, DiscoveryStatus, and Reason.'
        }
        Set-WorkScopeDiscoveryStatus -Root $Root -Id $DiscoveryId -Status $DiscoveryStatus -Reason $Reason -Evidence $Evidence -Blockers $Blockers
    }
    'supersede-discovery' {
        if (-not $DiscoveryId -or -not $TargetDiscoveryId -or -not $Reason -or -not $Evidence) {
            throw 'supersede-discovery requires DiscoveryId, TargetDiscoveryId, Reason, and Evidence.'
        }
        Supersede-WorkScopeDiscovery -Root $Root -Id $DiscoveryId -TargetId $TargetDiscoveryId -Reason $Reason -Evidence $Evidence
    }
    'recover-selected-discovery' {
        if (-not $DiscoveryId -or -not $DiscoveryStatus -or -not $Reason -or -not $Evidence -or -not $SelectionEventId) {
            throw 'recover-selected-discovery requires DiscoveryId, DiscoveryStatus, Reason, Evidence, and SelectionEventId.'
        }
        Restore-WorkScopeSelectedDiscovery -Root $Root -Id $DiscoveryId -Status $DiscoveryStatus -Reason $Reason -Evidence $Evidence `
            -SelectionEventId $SelectionEventId -ClosureEventId $ClosureEventId -HandoffEventId $HandoffEventId
    }
    'amend-discovery' {
        # Evidence is checked here rather than only downstream: it is Mandatory on
        # Add-WorkScopeDiscoveryCorrection, so omitting it produced a parameter-binding error
        # naming a function the caller never invoked, under a guard whose message listed the two
        # arguments that were already present.
        if (-not $DiscoveryId -or -not $Reason -or -not $Evidence) {
            throw 'amend-discovery requires DiscoveryId, Reason and Evidence.'
        }
        $amendArguments = @{ Root = $Root; Id = $DiscoveryId; Reason = $Reason; Evidence = $Evidence }
        # Bound-parameter presence is the signal, not emptiness: passing -Title '' must be an
        # error rather than a silent no-op, and omitting it must leave the field alone.
        if ($PSBoundParameters.ContainsKey('Title')) { $amendArguments['Title'] = $Title }
        if ($PSBoundParameters.ContainsKey('DiscoveryValue')) { $amendArguments['Value'] = $DiscoveryValue }
        if ($PSBoundParameters.ContainsKey('DiscoveryRisk')) { $amendArguments['Risk'] = $DiscoveryRisk }
        if ($PSBoundParameters.ContainsKey('ObligationClass')) { $amendArguments['ObligationClass'] = $ObligationClass }
        if ($PSBoundParameters.ContainsKey('SemanticKey')) { $amendArguments['SemanticKey'] = $SemanticKey }
        Add-WorkScopeDiscoveryCorrection @amendArguments
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
