# Ruta al log generado por Cloudflare
$logPath = "$env:USERPROFILE\.cloudflared\latest.log"
$timeout = 30
$found = $false
$url = ""

Write-Host "[] Buscando URL generada por Cloudflare..."

for ($i = 0; $i -lt $timeout; $i++) {
    if (Test-Path $logPath) {
        $log = Get-Content $logPath -Raw
        $match = $log | Select-String -Pattern "https://.*?\.trycloudflare\.com"
        if ($match) {
            $url = $match.Matches[0].Value
            $found = $true
            break
        }
    }
    Start-Sleep -Seconds 1
}

if (-not $found) {
    Write-Host " No se encontró la URL del túnel después de $timeout segundos."
    exit 1
}

Write-Host "[] URL encontrada: $url"

# Ruta del archivo JS
$jsPath = "C:\Users\efrain.villanueva\Documents\AENA\FORMULARIO WEB\js\utils\config-api-url.js"

# Forzar reescritura de la línea dinámica siempre
$content = Get-Content $jsPath
$newContent = @()

foreach ($line in $content) {
    if ($line -match '^\s*API_BASE_URL:\s*".*?\.trycloudflare\.com"') {
        $newContent += "    API_BASE_URL: `"$url`"" + "  //url dinamica de cloudflare"
    } else {
        $newContent += $line
    }
}

# Guardar el archivo actualizado
$newContent | Set-Content $jsPath -Encoding UTF8

Write-Host "[OK] Archivo actualizado con la nueva URL: $url"

