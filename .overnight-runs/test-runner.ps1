$ErrorActionPreference='Stop'
$project=(Get-Location).Path
$run=Join-Path $project '.overnight-runs/runner-regression'
New-Item -ItemType Directory -Path $run -Force | Out-Null
function Write-ProgressLog([string]$message) {
  $line = "$(Get-Date -Format o) $message"
  Write-Host $line
  Add-Content -LiteralPath (Join-Path $run 'status.txt') -Value $line
}
# Redirect at the OS process boundary: native stderr must never become a
# terminating PowerShell ErrorRecord. Each invocation has its own catch/timeout.
function Invoke-Isolated([string]$name, [string]$command, [int]$timeoutSeconds = 900) {
  $out = Join-Path $run "$name.stdout.txt"
  $err = Join-Path $run "$name.stderr.txt"
  $wrapper = Join-Path $run "$name.command.ps1"
  $exitFile = Join-Path $run "$name.exit.txt"
  @"
`$ErrorActionPreference = 'Continue'
`$PSNativeCommandUseErrorActionPreference = `$false
Set-Location -LiteralPath '$project'
$command
`$result = if (`$null -eq `$LASTEXITCODE) { 125 } else { `$LASTEXITCODE }
Set-Content -LiteralPath '$exitFile' -Value `$result
exit `$result
"@ | Set-Content -LiteralPath $wrapper -Encoding UTF8
  $child = $null
  Write-ProgressLog "START $name timeout=${timeoutSeconds}s"
  try {
    $child = Start-Process -FilePath 'powershell.exe' -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File', ('"' + $wrapper + '"')) -WorkingDirectory $project -WindowStyle Hidden -RedirectStandardOutput $out -RedirectStandardError $err -PassThru
    $deadline = (Get-Date).AddSeconds($timeoutSeconds)
    while (-not $child.WaitForExit(30000)) {
      Write-ProgressLog "RUNNING $name pid=$($child.Id) stdout=$((Get-Item $out -ErrorAction SilentlyContinue).Length) stderr=$((Get-Item $err -ErrorAction SilentlyContinue).Length)"
      if ((Get-Date) -ge $deadline) {
        & taskkill.exe /PID $child.Id /T /F *> $null
        Write-ProgressLog "TIMEOUT $name exit=124"
        return 124
      }
    }
    $child.WaitForExit()
    $code = if (Test-Path -LiteralPath $exitFile) { [int](Get-Content -LiteralPath $exitFile -Raw).Trim() } else { 125 }
    Write-ProgressLog "END $name exit=$code stdout=$out stderr=$err"
    return [int]$code
  } catch {
    Add-Content -LiteralPath $err -Value $_.Exception.ToString()
    Write-ProgressLog "BLOCKED $name exit=125 reason=$($_.Exception.Message)"
    return 125
  }
}
function Invoke-Stage([string]$name,[string]$task) {
  $prompt = Join-Path $run "$name.prompt.txt"
  ($common + "`n" + $task) | Set-Content -LiteralPath $prompt -Encoding UTF8
  # One retry only for infrastructure failures. A nonzero result is never success.
  for ($attempt=1; $attempt -le 2; $attempt++) {
    $code = Invoke-Isolated "$name-attempt-$attempt" "Get-Content -LiteralPath '$prompt' -Raw | & codex.cmd --ask-for-approval never --sandbox workspace-write exec -" 1200
    if ($code -eq 0) { return 0 }
    Write-ProgressLog "FAILED $name attempt=$attempt exit=$code; remaining independent stages will continue"
  }
  return $code
}
function Invoke-Gates([string]$label) {
  $codes = @()
  $codes += Invoke-Isolated "$label-typescript" '& npx.cmd --no-install tsc --noEmit' 300
  $codes += Invoke-Isolated "$label-tests" '& npm.cmd test' 300
  $codes += Invoke-Isolated "$label-build" '& npm.cmd run build' 600
  $codes += Invoke-Isolated "$label-foundation" '& node.exe scripts/foundation-check.cjs' 180
  $codes += Invoke-Isolated "$label-catalog" '& node.exe scripts/catalog-gate.cjs' 180
  Write-ProgressLog "GATES $label exits=$($codes -join ',') (zero means verified command only)"
  return ($codes | Where-Object { $_ -ne 0 }).Count -eq 0
}

$a = Invoke-Isolated 'stderr-success' '& node.exe -e "console.error(''warning'');process.exit(0)"' 30
$b = Invoke-Isolated 'failed-command' '& node.exe -e "console.error(''intentional failure'');process.exit(7)"' 30
$c = Invoke-Isolated 'continued-command' '& node.exe -e "console.log(''continued'');process.exit(0)"' 30
if ($a -ne 0 -or $b -ne 7 -or $c -ne 0) { throw "Regression failed: $a,$b,$c" }
Write-ProgressLog 'PASS stderr warning preserved, failure recorded as 7, subsequent command ran'
