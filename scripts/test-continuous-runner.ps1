# Regression checks exercise only the runner, without invoking Codex or providers.
$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $project
$run = Join-Path $project ('.overnight-runs\runner-test-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $run -Force | Out-Null
$source = Get-Content (Join-Path $project 'run-sous-continuous.ps1') -Raw
$start = $source.IndexOf('function Write-ProgressLog')
$end = $source.IndexOf('foreach ($stage in $stages)')
. ([scriptblock]::Create($source.Substring($start, $end - $start)))
$a = Invoke-Isolated 'stderr-success' '& node.exe -e "console.error(''warning'');process.exit(0)"' 30
$b = Invoke-Isolated 'failed-command' '& node.exe -e "console.error(''intentional failure'');process.exit(7)"' 30
$c = Invoke-Isolated 'continued-command' '& node.exe -e "console.log(''continued'');process.exit(0)"' 30
$d = Invoke-Isolated 'missing-executable' '& sous-nonexistent-command.cmd' 30
$e = Invoke-Isolated 'timeout' '& node.exe -e "setInterval(()=>{},1000)"' 1
if ($a -ne 0 -or $b -ne 7 -or $c -ne 0 -or $d -eq 0 -or $e -ne 124) { throw "Runner regression failed: $a,$b,$c,$d,$e" }
# Replace only the process launcher for deterministic retry and gate coverage.
$script:calls = @()
function Invoke-Isolated([string]$name, [string]$command, [int]$timeoutSeconds) {
 $script:calls += $name
 return 7
}
$common = 'Regression test only'
$stage = Invoke-Stage 'mock-stage' 'No development work'
if ($stage -ne 7 -or $script:calls.Count -ne 2) { throw 'Stage retries were not bounded at two' }
$script:calls = @()
$gates = Invoke-Gates 'mock-gates'
if ($gates -or $script:calls.Count -ne 7) { throw 'A failed gate skipped independent checks or falsely passed' }
Write-ProgressLog 'PASS: stderr isolation, exit codes, continuation, missing executable, timeout, bounded retries and all independent gates'
