$ErrorActionPreference = 'Continue'
$PSNativeCommandUseErrorActionPreference = $false
Set-Location -LiteralPath 'C:\Users\L\Desktop\sous\Sous_HackCamp'
& node.exe -e "console.log('continued');process.exit(0)"
$result = if ($null -eq $LASTEXITCODE) { 125 } else { $LASTEXITCODE }
Set-Content -LiteralPath 'C:\Users\L\Desktop\sous\Sous_HackCamp\.overnight-runs\runner-regression\continued-command.exit.txt' -Value $result
exit $result
