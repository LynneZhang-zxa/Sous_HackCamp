$ErrorActionPreference = 'Continue'
$PSNativeCommandUseErrorActionPreference = $false
Set-Location -LiteralPath 'C:\Users\L\Desktop\sous\Sous_HackCamp'
& node.exe scripts/foundation-check.cjs
if ($null -eq $LASTEXITCODE) { exit 1 }
exit $LASTEXITCODE
