$html = Get-Content index.html -Raw
# Remove large product script
$html = $html -replace '(?s)<script>.*?14: \["data:image/avif;base64,.*?</script>', ''
# Remove any other script without src
$html = $html -replace '(?s)<script\b[^>]*>(?!.*?src=).*?</script>', ''
# Remove any style tags
$html = $html -replace '(?s)<style\b[^>]*>.*?</style>', ''
$html | Set-Content index.html
