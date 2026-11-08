$ErrorActionPreference = 'Continue'
$PSNativeCommandUseErrorActionPreference = $false
Set-Location -LiteralPath 'C:\Users\L\Desktop\sous\Sous_HackCamp'
& sous-nonexistent-command.cmd
$result = if ($null -eq $LASTEXITCODE) { 125 } else { $LASTEXITCODE }
Set-Content -LiteralPath 'C:\Users\L\Desktop\sous\Sous_HackCamp\.overnight-runs\runner-test-20261108-024756\missing-executable.exit.txt' -Value $result
exit $result
