$ErrorActionPreference = 'Continue'
$PSNativeCommandUseErrorActionPreference = $false
Set-Location -LiteralPath 'C:\Users\L\Desktop\sous\Sous_HackCamp'
& npx.cmd --no-install tsc --noEmit
if ($null -eq $LASTEXITCODE) { exit 1 }
exit $LASTEXITCODE
