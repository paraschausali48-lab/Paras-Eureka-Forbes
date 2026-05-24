$c = Get-Content index.html -Raw; $o = [regex]::Matches($c, '<div\b[^>]*>').Count; $cl = [regex]::Matches($c, '</div>').Count; Write-Host "Open: $o, Close: $cl"
