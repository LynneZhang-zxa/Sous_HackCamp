$ErrorActionPreference = 'Continue'
$PSNativeCommandUseErrorActionPreference = $false
Set-Location -LiteralPath 'C:\Users\L\Desktop\sous\Sous_HackCamp'
& node.exe scripts/catalog-gate.cjs
$result = if ($null -eq $LASTEXITCODE) { 125 } else { $LASTEXITCODE }
Set-Content -LiteralPath 'C:\Users\L\Desktop\sous\Sous_HackCamp\.overnight-runs\20261108-022104\gate-1-catalog.exit.txt' -Value $result
exit $result
