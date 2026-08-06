$ErrorActionPreference = 'Stop'

$root = Join-Path $env:TEMP ('correct-skill-test-' + [Guid]::NewGuid().ToString('N'))
$repo = Join-Path $root 'repo'
New-Item -ItemType Directory -Path $repo -Force | Out-Null

try {
    $script = Join-Path $PSScriptRoot 'Record-Correction.ps1'
    $result = & $script `
        -Id 'correction-20260729-test-record' `
        -Incident 'An agent created a duplicate helper without inspecting the existing owner.' `
        -RootCauseStatus reproduced `
        -ArtifactDecision extend `
        -ExistingSearch 'rg --files repository','shared skill inventory' `
        -Scope project,shared `
        -Enforcement rule,skill,test `
        -Evidence 'AGENTS.md','skill inventory' `
        -Artifact 'AGENTS.md','skills/correct/SKILL.md' `
        -Verification 'Record-Correction.test.ps1' `
        -Repository $repo

    $log = Join-Path $repo '.agents\feedback\FEEDBACK-LOG.md'
    if (-not (Test-Path -LiteralPath $log)) { throw 'Feedback log was not created.' }
    $content = Get-Content -Raw -LiteralPath $log
    foreach ($expected in @(
        'correction-20260729-test-record',
        'artifactDecision: extend',
        'existingSearch:',
        '  - project',
        '  - shared',
        '  - rule',
        '  - skill',
        '  - test'
    )) {
        if (-not $content.Contains($expected)) { throw "Feedback log lacks: $expected" }
    }
    if ($content -match '(?m)[ \t]+$') {
        throw 'Feedback log contains trailing whitespace.'
    }
    if (@($result.Enforcement).Count -ne 3) { throw 'Enforcement did not remain list-valued.' }
    if ($result.ArtifactDecision -ne 'extend') { throw 'Artifact decision was not preserved.' }

    $base = @{
        Id = 'correction-20260729-adversarial'
        Incident = 'Duplicate helper created.'
        RootCauseStatus = 'hypothesis'
        ArtifactDecision = 'extend'
        ExistingSearch = @('repository inventory')
        Scope = @('project')
        Enforcement = @('rule')
        Evidence = @('chat location')
        Surface = @('project')
        Artifact = @('AGENTS.md')
        Consequence = 'Extra maintenance.'
        Verification = 'test path'
        Owner = 'Douglas'
        ReviewTrigger = 'next correction review'
        Repository = $repo
    }
    foreach ($field in @(
        'Incident', 'ExistingSearch', 'Evidence', 'Surface', 'Artifact',
        'Consequence', 'Verification', 'Owner', 'ReviewTrigger'
    )) {
        $attempt = @{}
        foreach ($entry in $base.GetEnumerator()) { $attempt[$entry.Key] = $entry.Value }
        $attempt[$field] = 'password=forbidden-value'
        $blocked = $false
        try { & $script @attempt | Out-Null }
        catch { $blocked = $true }
        if (-not $blocked) { throw "Credential-like value was not rejected in $field." }
    }

    $credentialPatterns = @(
        'Bearer abcdefghijklmnopqrstuvwxyz',
        '-----BEGIN PRIVATE KEY-----',
        'https://user:credential@example.invalid',
        'github_pat_abcdefghijklmnopqrstuvwxyz',
        (('eyJ' + ('A' * 16)) + '.' + ('B' * 24) + '.' + ('C' * 32)),
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuv'
    )
    for ($patternIndex = 0; $patternIndex -lt $credentialPatterns.Count; $patternIndex++) {
        $value = $credentialPatterns[$patternIndex]
        $attempt = @{}
        foreach ($entry in $base.GetEnumerator()) { $attempt[$entry.Key] = $entry.Value }
        $attempt.Incident = $value
        $blocked = $false
        $errorMessage = ''
        try { & $script @attempt | Out-Null }
        catch {
            $blocked = $true
            $errorMessage = $_.Exception.Message
        }
        if (-not $blocked) { throw "Credential pattern case $patternIndex was not rejected." }
        if ($errorMessage.Contains($value)) {
            throw "Credential pattern case $patternIndex was echoed in its rejection."
        }
    }

    $normalized = @{}
    foreach ($entry in $base.GetEnumerator()) { $normalized[$entry.Key] = $entry.Value }
    $normalized.Id = 'correction-20260729-normalize'
    $normalized.Owner = "Line one`r`nline two"
    & $script @normalized | Out-Null
    $content = Get-Content -Raw -LiteralPath $log
    if (-not $content.Contains('owner: Line one line two')) {
        throw 'Multiline fields were not normalized to a single record line.'
    }

    $safeHash = @{}
    foreach ($entry in $base.GetEnumerator()) { $safeHash[$entry.Key] = $entry.Value }
    $safeHash.Id = 'correction-20260729-safe-hash'
    $safeHash.Evidence = @('sha256: ' + ('a' * 64), 'source-command-verification-before-completion')
    & $script @safeHash | Out-Null

    Write-Output 'Correction skill tests passed.'
}
finally {
    if (Test-Path -LiteralPath $root) {
        Remove-Item -LiteralPath $root -Recurse -Force
    }
}
