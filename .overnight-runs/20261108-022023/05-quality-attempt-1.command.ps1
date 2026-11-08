$ErrorActionPreference = 'Continue'
$PSNativeCommandUseErrorActionPreference = $false
Set-Location -LiteralPath 'C:\Users\L\Desktop\sous\Sous_HackCamp'
Get-Content -LiteralPath 'C:\Users\L\Desktop\sous\Sous_HackCamp\.overnight-runs\20261108-022023\05-quality.prompt.txt' -Raw | & codex.cmd --ask-for-approval never --sandbox workspace-write exec -
if ($null -eq $LASTEXITCODE) { exit 1 }
exit $LASTEXITCODE
