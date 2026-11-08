$ErrorActionPreference = 'Continue'
$PSNativeCommandUseErrorActionPreference = $false
Set-Location -LiteralPath 'C:\Users\L\Desktop\sous\Sous_HackCamp'
& node.exe -e "console.error('intentional failure');process.exit(7)"
$result = if ($null -eq $LASTEXITCODE) { 125 } else { $LASTEXITCODE }
Set-Content -LiteralPath 'C:\Users\L\Desktop\sous\Sous_HackCamp\.overnight-runs\runner-regression\failed-command.exit.txt' -Value $result
exit $result
