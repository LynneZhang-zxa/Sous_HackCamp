# SOUS unattended bounded development loop (PowerShell 5.1+)
$ErrorActionPreference = 'Stop'
$project = 'C:\Users\L\Desktop\sous\Sous_HackCamp'
if (-not (Test-Path (Join-Path $project 'package.json'))) { throw 'SOUS project not found.' }
Set-Location $project
# Missing executables are recorded per stage; independent checks still run.
$run = Join-Path $project ('.overnight-runs\' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $run -Force | Out-Null
$common = @'
You are modifying the existing SOUS Next.js repository. Read FOUNDATION-REPORT.md and inspect actual source before editing. Work on the assigned stage fully, rather than stopping after planning. Do not commit, push, pull, fetch, reset, rebase, merge, create or switch branches, or modify Git configuration. Do not modify secrets, .env files, remote Alebex configuration, or run paid provider calls. Do not delete unrelated files. Do not introduce authentication or new databases. MANDATORY: attempt every assigned task even when another task or verification fails. Never defer recipe expansion because build, browser, or Alebex access is blocked. On a blocker, record exact evidence, finish all independent subtasks, and continue. A failed check is not permission to skip subsequent stages. Do not fake test success. You may fix package/config issues using existing dependencies; do not upgrade packages or install new ones without an established necessity. Record remaining blockers clearly. Implement large catalog changes in batches of at most five recipes per file-writing tool call; save and validate each batch before proceeding.
'@
$stages = @(
  @{name='01-build'; task='Fix current Next.js 16.4.5 build failures with minimal scoped changes. Diagnose Turbopack @tailwindcss/postcss resolution and Webpack App Router page type/export errors (MicIcon, recipes optional props). Run npm test, npx tsc --noEmit, npm run build and report actual results. Do not alter unrelated features.'},
  @{name='02-recipes'; task='Expand the one centralized catalog from its current 20 recipes to exactly 50 unique complete realistic recipes. Preserve original 20 IDs and data. Add 30 distinct recipes with ingredients, amounts, units, times, servings, ordered practical steps, relevant safety tips. Do not invent nutrition or download external photos; use existing fallback. Add automated catalog validation and verify exact count.'},
  @{name='03-integration'; task='Integrate all 50 recipes into /recipes, /recipes/[id], search, filters, favorites, Collection, and voice cooking links. Ensure 404 for invalid IDs, default /cook behavior with no ID, and correct selected ID in call-start. Preserve Home/Tools/Collection and homepage cleanup. Test each of 50 IDs and shared search and favorites logic.'},
  @{name='04-voice'; task='Audit and minimally fix local universal voice recipe context for all 50 recipes. Detect chicken-specific knowledge leakage, wrong selected ID, step and ingredient mismatch, unsafe claims. Preserve Alebex audio, websocket, tools, agent remote configuration and keys. Mock all provider calls. Do not claim live voice verified without real authorized testing.'},
  @{name='05-quality'; task='Run TypeScript, npm test, production build and safe local route/browser verification if possible. Fix introduced regressions. Preserve existing homepage/navigation. Report remaining limitations honestly; do not claim a build passed if it failed.'}
)

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
    $lastActivity = Get-Date
    $lastBytes = -1
    while (-not $child.WaitForExit(30000)) {
      Write-ProgressLog "RUNNING $name pid=$($child.Id) stdout=$((Get-Item $out -ErrorAction SilentlyContinue).Length) stderr=$((Get-Item $err -ErrorAction SilentlyContinue).Length)"
      $bytes = (Get-Item $out -ErrorAction SilentlyContinue).Length + (Get-Item $err -ErrorAction SilentlyContinue).Length
      if ($bytes -ne $lastBytes) { $lastActivity = Get-Date; $lastBytes = $bytes }
      $stalled = ((Get-Date) - $lastActivity).TotalSeconds -ge 300
      if ((Get-Date) -ge $deadline -or $stalled) {
        # Bound the cleanup helper too; native stderr cannot interrupt cleanup.
        try {
          $killer = Start-Process -FilePath 'taskkill.exe' -ArgumentList @('/PID', $child.Id, '/T', '/F') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $run "$name.cleanup.stdout.txt") -RedirectStandardError (Join-Path $run "$name.cleanup.stderr.txt") -PassThru
          if (-not $killer.WaitForExit(5000)) { Stop-Process -Id $killer.Id -Force -ErrorAction SilentlyContinue }
        } catch { Write-ProgressLog "CLEANUP WARNING $name $($_.Exception.Message)" }
        Stop-Process -Id $child.Id -Force -ErrorAction SilentlyContinue
        Write-ProgressLog "TIMEOUT $name exit=124 stalled=$stalled"
        return 124
      }
    }
    $child.WaitForExit()
    $code = if (Test-Path -LiteralPath $exitFile) { [int](Get-Content -LiteralPath $exitFile -Raw).Trim() } else { 125 }
    Write-ProgressLog "END $name exit=$code stdout=$out stderr=$err"
    return [int]$code
  } catch {
    Add-Content -LiteralPath (Join-Path $run "$name.exception.txt") -Value $_.Exception.ToString()
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
  $codes += Invoke-Isolated "$label-integration" '& node.exe scripts/recipe-integration-check.cjs' 180
  $codes += Invoke-Isolated "$label-voice" '& node.exe scripts/voice-context-check.cjs' 180
  $codes += Invoke-Isolated "$label-catalog" '& node.exe scripts/catalog-gate.cjs' 180
  Write-ProgressLog "GATES $label exits=$($codes -join ',') (zero means verified command only)"
  return ($codes | Where-Object { $_ -ne 0 }).Count -eq 0
}
foreach ($stage in $stages) { $null = Invoke-Stage $stage.name $stage.task }
# Always process all initial priorities before bounded repair rounds.
for ($round=1; $round -le 2; $round++) {
  $null = Invoke-Gates "gate-$round"
  $null = Invoke-Stage "06-repair-$round" "Read execution logs in $run. Attempt every unresolved requirement: build, exactly 50 complete unique recipes preserving original IDs, all listing/detail/search/filter/saved integrations, universal recipe voice context and mocked tests. Repair feasible failures; do not repeat blocked commands without diagnosis. Verify via actual listRecipes(). Never call unverified or blocked tasks complete. No Git mutations, secret changes or paid calls."
}
$verified = Invoke-Gates 'final-gate'
$null = Invoke-Stage '99-final-report' "Read-only audit of source and logs in $run: do not rerun builds, launch servers, or mutate application source after final gates. Use final gate evidence. Write SOUS-OVERNIGHT-REPORT.md distinguishing implemented, verified, failed and blocked work; actual recipe count, checks, changed files and remaining browser/live voice limitations. Gate pass=$verified does not establish all feature requirements. No Git mutations."
# A deterministic report survives even if every Codex invocation is unavailable.
$summary = Join-Path $run 'WORKFLOW-REPORT.md'
@"
# Workflow execution
Logs: $run
Final automated gates passed: $verified
Implemented automation: isolated stderr, per-command exit codes, timeouts, two stage attempts, two repair rounds, unconditional final gates/report.
Feature implementation is not established by process exit alone. See stage logs and independently verified checks. Any nonzero/timeout/missing-service result remains failed or blocked, never completed.
"@ | Set-Content -LiteralPath $summary
Write-ProgressLog "FINISHED gatesPassed=$verified report=$summary"
if (-not $verified) { exit 1 }
exit 0
