$path = 'c:\Users\paras\OneDrive\Desktop\Paras Eureka Forbes\index.html'
$text = Get-Content -Raw -Path $path
$regex = [regex]'<div class="price">₹([0-9,]+)</div>'
$new = $regex.Replace($text, {
    param($m)
    $mopStr = $m.Groups[1].Value
    $mop = [int]($mopStr -replace ',', '')
    $mrp = [math]::Ceiling($mop * 1.2 / 500) * 500
    return "      <div class=\"price\" data-mrp=\"$mrp\">₹$mopStr</div>"
})
Set-Content -Path $path -Value $new
Write-Host "Done"