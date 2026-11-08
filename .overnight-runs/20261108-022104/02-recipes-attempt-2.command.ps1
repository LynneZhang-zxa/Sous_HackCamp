$ErrorActionPreference = 'Continue'
$PSNativeCommandUseErrorActionPreference = $false
Set-Location -LiteralPath 'C:\Users\L\Desktop\sous\Sous_HackCamp'
Get-Content -LiteralPath 'C:\Users\L\Desktop\sous\Sous_HackCamp\.overnight-runs\20261108-022104\02-recipes.prompt.txt' -Raw | & codex.cmd --ask-for-approval never --sandbox workspace-write exec -
$result = if ($null -eq $LASTEXITCODE) { 125 } else { $LASTEXITCODE }
Set-Content -LiteralPath 'C:\Users\L\Desktop\sous\Sous_HackCamp\.overnight-runs\20261108-022104\02-recipes-attempt-2.exit.txt' -Value $result
exit $result
