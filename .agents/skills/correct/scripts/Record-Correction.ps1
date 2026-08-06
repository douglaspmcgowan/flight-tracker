[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-z0-9][a-z0-9-]+$')]
    [string]$Id,

    [Parameter(Mandatory = $true)]
    [string]$Incident,

    [Parameter(Mandatory = $true)]
    [ValidateSet('hypothesis', 'supported', 'reproduced')]
    [string]$RootCauseStatus,

    [Parameter(Mandatory = $true)]
    [ValidateSet('extend', 'consolidate', 'replace', 'remove', 'create')]
    [string]$ArtifactDecision,

    [Parameter(Mandatory = $true)]
    [string[]]$ExistingSearch,

    [Parameter(Mandatory = $true)]
    [ValidateSet('path', 'project', 'shared', 'platform', 'provider-model', 'human')]
    [string[]]$Scope,

    [Parameter(Mandatory = $true)]
    [ValidateSet('rule', 'skill', 'memory', 'verifier', 'hook', 'permission', 'test', 'brief', 'backlog')]
    [string[]]$Enforcement,

    [Parameter(Mandatory = $true)]
    [string[]]$Evidence,

    [string[]]$Surface = @(),
    [string[]]$Artifact = @(),
    [string]$Consequence = '',
    [string]$Verification = '',
    [string]$Owner = 'Douglas',
    [string]$ReviewTrigger = '',
    [ValidateSet('recorded', 'enforced', 'superseded', 'retired')]
    [string]$Status = 'recorded',
    [string]$Repository
)

$ErrorActionPreference = 'Stop'

function Assert-ValueFree([string]$Name, [AllowNull()][string[]]$Values) {
    $blocked = @(
        '(?i)\b(password|passwd|pwd|secret|token|api[_-]?key|private[_-]?key|client[_-]?secret|access[_-]?key|session[_-]?key|review[_-]?secret|bw[_-]?session)\b\s*[:=]\s*["'']?\S+',
        '(?i)\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{8,}',
        '(?i)-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',
        '(?i)\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|AKIA[A-Z0-9]{16})\b',
        '(?i)(?<![A-Za-z0-9_-])eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}(?![A-Za-z0-9_-])',
        '(?i)\bhttps?://[^/\s:@]+:[^@\s/]+@',
        '(?i)\b(?:User ID|UID|Password|PWD)\s*=\s*[^;\s]+'
    )
    foreach ($value in $Values) {
        foreach ($pattern in $blocked) {
            if ([string]$value -match $pattern) {
                throw "$Name appears to contain a credential value. Record names and locations only."
            }
        }
        if (Test-StandaloneCredentialValue ([string]$value)) {
            throw "$Name appears to contain a credential value. Record names and locations only."
        }
    }
}

function Test-StandaloneCredentialValue([AllowNull()][string]$Value) {
    if ([string]::IsNullOrWhiteSpace($Value)) { return $false }

    foreach ($match in [regex]::Matches($Value, '(?<![A-Za-z0-9_+/=-])[A-Za-z0-9_+/=-]{32,}(?![A-Za-z0-9_+/=-])')) {
        $candidate = $match.Value.TrimEnd('=')
        if ($candidate.Length -lt 32) { continue }

        $prefixStart = [Math]::Max(0, $match.Index - 24)
        $prefix = $Value.Substring($prefixStart, $match.Index - $prefixStart)
        if ($candidate -match '^[A-Fa-f0-9]+$') {
            if ($prefix -match '(?i)(?:sha(?:1|256|512)?|hash|commit)\s*[:=]?\s*$') { continue }
            if ($candidate.Length -ge 48) { return $true }
            continue
        }

        $classes = 0
        if ($candidate -cmatch '[A-Z]') { $classes++ }
        if ($candidate -cmatch '[a-z]') { $classes++ }
        if ($candidate -match '[0-9]') { $classes++ }
        if ($candidate -match '[_+/=-]') { $classes++ }
        if ($classes -lt 2) { continue }

        $counts = @{}
        foreach ($character in $candidate.ToCharArray()) {
            $key = [string]$character
            if ($counts.ContainsKey($key)) { $counts[$key]++ }
            else { $counts[$key] = 1 }
        }
        $entropy = 0.0
        foreach ($count in $counts.Values) {
            $probability = [double]$count / [double]$candidate.Length
            $entropy -= $probability * [Math]::Log($probability, 2)
        }
        if ($entropy -ge 4.2) { return $true }
    }
    return $false
}

function Normalize-Field([AllowNull()][string]$Value) {
    if ($null -eq $Value) { return '' }
    return ([regex]::Replace($Value, '[\r\n\t]+', ' ') -replace ' {2,}', ' ').Trim()
}

$writtenFields = [ordered]@{
    Id = @($Id)
    Incident = @($Incident)
    RootCauseStatus = @($RootCauseStatus)
    ArtifactDecision = @($ArtifactDecision)
    ExistingSearch = @($ExistingSearch)
    Scope = @($Scope)
    Surface = @($Surface)
    Enforcement = @($Enforcement)
    Evidence = @($Evidence)
    Artifact = @($Artifact)
    Consequence = @($Consequence)
    Verification = @($Verification)
    Owner = @($Owner)
    Status = @($Status)
    ReviewTrigger = @($ReviewTrigger)
}
foreach ($field in $writtenFields.GetEnumerator()) {
    Assert-ValueFree $field.Key $field.Value
}
foreach ($requiredList in @(
    @{ Name = 'ExistingSearch'; Values = @($ExistingSearch) },
    @{ Name = 'Scope'; Values = @($Scope) },
    @{ Name = 'Enforcement'; Values = @($Enforcement) },
    @{ Name = 'Evidence'; Values = @($Evidence) }
)) {
    if ($requiredList.Values.Count -eq 0) { throw "$($requiredList.Name) must contain at least one value." }
}

if ($Repository) {
    $root = (Resolve-Path -LiteralPath $Repository).Path
    $logPath = Join-Path $root '.agents\feedback\FEEDBACK-LOG.md'
}
else {
    $agentsRoot = Split-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) -Parent
    $logPath = Join-Path $agentsRoot 'feedback\FEEDBACK-LOG.md'
}

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add('')
$lines.Add("## $Id")
$lines.Add('')
$lines.Add("timestamp: $((Get-Date).ToUniversalTime().ToString('o'))")
$lines.Add("incident: $(Normalize-Field $Incident)")
$lines.Add("consequence: $(Normalize-Field $Consequence)")
$lines.Add("rootCauseStatus: $RootCauseStatus")
$lines.Add("artifactDecision: $ArtifactDecision")
$lines.Add('existingSearch:')
foreach ($value in $ExistingSearch) { $lines.Add("  - $(Normalize-Field $value)") }
$lines.Add('scope:')
foreach ($value in $Scope) { $lines.Add("  - $(Normalize-Field $value)") }
$lines.Add('surfaces:')
foreach ($value in $Surface) { $lines.Add("  - $(Normalize-Field $value)") }
$lines.Add('enforcement:')
foreach ($value in $Enforcement) { $lines.Add("  - $(Normalize-Field $value)") }
$lines.Add('evidence:')
foreach ($value in $Evidence) { $lines.Add("  - $(Normalize-Field $value)") }
$lines.Add('artifacts:')
foreach ($value in $Artifact) { $lines.Add("  - $(Normalize-Field $value)") }
$lines.Add("verification: $(Normalize-Field $Verification)")
$lines.Add("owner: $(Normalize-Field $Owner)")
$lines.Add("status: $Status")
$lines.Add("reviewTrigger: $(Normalize-Field $ReviewTrigger)")

$parent = Split-Path $logPath -Parent
if ($PSCmdlet.ShouldProcess($logPath, 'Append value-free correction record')) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
    if (-not (Test-Path -LiteralPath $logPath)) {
        [System.IO.File]::WriteAllText(
            $logPath,
            "# Feedback log`r`n`r`nAppend-only, value-free correction records. Supersede or retire an entry by appending a record that references its ID.`r`n",
            [System.Text.UTF8Encoding]::new($false)
        )
    }
    [System.IO.File]::AppendAllText(
        $logPath,
        ($lines -join [Environment]::NewLine) + [Environment]::NewLine,
        [System.Text.UTF8Encoding]::new($false)
    )
}

[pscustomobject]@{
    Id = $Id
    Log = $logPath
    ArtifactDecision = $ArtifactDecision
    Scope = $Scope
    Enforcement = $Enforcement
}
