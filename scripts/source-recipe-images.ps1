$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$recipes = Get-Content -Raw -LiteralPath "$PSScriptRoot/image-audit-input.json" | ConvertFrom-Json
$records = @()
$previous = @()
if (Test-Path "$root/public/recipes/image-audit.json") { $previous = @(Get-Content -Raw "$root/public/recipes/image-audit.json" | ConvertFrom-Json) }
$queries = @{
 'creamy-garlic-chicken'='chicken cream sauce'; 'tomato-beef-stew'='beef potato stew'; 'bibimbap'='intitle:Bibimbap';
 'black-bean-quesadillas'='vegetarian quesadilla'; 'greek-chickpea-salad'='chickpea salad'; 'thai-basil-chicken'='pad krapao chicken';
 'lemon-herb-chicken'='roast chicken potatoes'; 'avocado-pasta'='avocado pasta'; 'beef-broccoli-stir-fry'='beef broccoli';
 'baked-sweet-potato-beans'='sweet potato beans'; 'broccoli-cheddar-frittata'='broccoli frittata'; 'lemon-couscous-chickpeas'='couscous chickpeas';
 'creamy-polenta-mushrooms'='polenta mushrooms'; 'sesame-tofu-noodles'='tofu noodles'; 'spinach-ricotta-shells'='stuffed pasta shells';
 'white-bean-kale-skillet'='white beans kale'; 'cauliflower-chickpea-traybake'='roasted cauliflower chickpeas';
 'quinoa-roasted-vegetable-bowls'='quinoa vegetables'; 'peanut-sweet-potato-stew'='peanut stew'; 'eggplant-tomato-pasta'='pasta alla norma';
 'turkey-bean-chili'='turkey chili'; 'baked-lemon-cod'='baked cod'; 'pork-tenderloin-apples'='pork apples';
 'salmon-potato-traybake'='salmon potatoes'; 'ginger-chicken-lettuce-cups'='chicken lettuce wraps';
 'beef-meatballs-tomato-sauce'='meatballs tomato sauce'; 'shrimp-coconut-noodle-soup'='laksa shrimp'; 'chicken-fajita-skillet'='chicken fajitas';
 'lentil-shepherds-pie'='vegetarian shepherd pie'; 'banana-oat-pancakes'='banana pancakes'; 'apple-cinnamon-porridge'='apple porridge';
 'savory-spinach-oatmeal'='savory oatmeal'; 'mediterranean-tuna-bean-salad'='tuna bean salad'; 'roasted-carrot-hummus-wraps'='hummus wrap'
}
foreach ($recipe in $recipes) {
  $prior = $previous | Where-Object { $_.id -eq $recipe.id -and $_.status -ne 'unresolved' }
  if ($prior -and !$queries.ContainsKey($recipe.id)) { $records += $prior; continue }
  Start-Sleep -Seconds 7
  $query = $recipe.title
  if ($queries.ContainsKey($recipe.id)) { $query = $queries[$recipe.id] }
  $uri = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Cextmetadata&iiurlwidth=800&gsrsearch=' + [uri]::EscapeDataString($query + ' filetype:bitmap')
  try {
    $data = (Invoke-WebRequest -Uri $uri -UseBasicParsing).Content | ConvertFrom-Json
    $pages = $data.query.pages.PSObject.Properties.Value | Sort-Object index
    $chosen = $null
    foreach ($page in $pages) {
      $info = $page.imageinfo[0]
      $license = $info.extmetadata.LicenseShortName.value
      if ($info.url -match '\.(jpg|jpeg|png)(\?|$)' -and $license -match '^(CC BY|CC0|Public domain)' -and $info.thumburl) { $chosen = $page; break }
    }
    if (!$chosen) { throw 'No reusable photograph candidate' }
    $info = $chosen.imageinfo[0]
    $extension = if ($info.url -match '\.png(\?|$)') { 'png' } else { 'jpg' }
    $file = "$($recipe.id)-commons.$extension"
    Invoke-WebRequest -Uri $info.thumburl -UseBasicParsing -OutFile "$root/public/recipes/$file"
    $records += [pscustomobject]@{ id=$recipe.id; title=$recipe.title; image="/recipes/$file"; fileTitle=$chosen.title; source=$info.descriptionurl; author=([regex]::Replace($info.extmetadata.Artist.value,'<[^>]+>','')); license=$info.extmetadata.LicenseShortName.value; licenseUrl=$info.extmetadata.LicenseUrl.value; description=([regex]::Replace($info.extmetadata.ImageDescription.value,'<[^>]+>','')); status='candidate-needs-visual-review' }
    Write-Output "$($recipe.id): $($chosen.title)"
  } catch {
    $records += [pscustomobject]@{id=$recipe.id; title=$recipe.title; image=$recipe.image; status='unresolved'; error=$_.Exception.Message}
    Write-Output "$($recipe.id): unresolved"
  }
  ConvertTo-Json -InputObject @($records) -Depth 8 | Set-Content -Encoding utf8 -LiteralPath "$root/public/recipes/image-audit.json"
}
