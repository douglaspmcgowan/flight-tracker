[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repository = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$harnessManager = Join-Path $env:USERPROFILE '.agents\tools\Manage-Harness.ps1'

if (-not (Test-Path -LiteralPath $harnessManager -PathType Leaf)) {
    throw "Shared harness manager is unavailable at $harnessManager"
}

& $harnessManager `
    -Action VerifyProject `
    -Repository $repository `
    -ProjectName 'flight-tracker'
