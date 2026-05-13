$path = 'c:\Users\paras\OneDrive\Desktop\Paras Eureka Forbes\index.html'
$content = Get-Content -Raw -Path $path
$pattern = '<a href="#contact" class="product-btn">Ask for This SKU</a>'
$replacement = '<a href="#contact" class="product-btn" data-i18n="btn_ask">Ask for This SKU</a>'
$newContent = $content -replace [regex]::Escape($pattern), $replacement
Set-Content -Path $path -Value $newContent
Write-Host "Done"
