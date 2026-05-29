$path = Join-Path -Path $PSScriptRoot -ChildPath 'index.html'
$text = Get-Content -Raw -Path $path
$regex = [regex]'<div class="price" data-mrp="0">₹([0-9,]+)</div>'
$new = $regex.Replace($text, {
    param($m)
    $mopStr = $m.Groups[1].Value
    $mop = [int]($mopStr -replace ',', '')
    $mrp = [math]::Ceiling($mop * 1.2 / 500) * 500
    $mrpStr = [string]::Format('{0:N0}', $mrp)
    $mopStrFormatted = [string]::Format('{0:N0}', $mop)
    return "<div class=""price-info"">
        <div class=""mrp"">MRP ₹$mrpStr</div>
        <div class=""price"">MOP ₹$mopStrFormatted</div>
      </div>"
})
Set-Content -Path $path -Value $new
Write-Host "Updated"
