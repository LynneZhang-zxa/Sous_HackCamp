$ErrorActionPreference = 'Continue'
$PSNativeCommandUseErrorActionPreference = $false
Set-Location -LiteralPath 'C:\Users\L\Desktop\sous\Sous_HackCamp'
& npm.cmd test
if ($null -eq $LASTEXITCODE) { exit 1 }
exit $LASTEXITCODE
