# Ruta del log
$logPath = "C:\Users\efrain.villanueva\Documents\AENA\FORMULARIO WEB\cloudflared.log"
$url = ""

# Esperar un poco más por si aún no se escribió el log
Start-Sleep -Seconds 2

# Intentar leer la URL desde el log
if (Test-Path $logPath) {
    $content = Get-Content $logPath -Raw
    $match = $content | Select-String -Pattern "https://.*?\.trycloudflare\.com"

    if ($match) {
        $url = $match.Matches[0].Value
        Write-Host "URL capturada automaticamente: $url"
    } else {
        Write-Host "No se encontro la URL en el log."
    }
}

# Si no se obtuvo, pedirla manualmente
if (-not $url) {
    Write-Host "No se pudo capturar automaticamente la URL del tunel."
    $url = Read-Host "Pega aqui manualmente la URL del tunel generada por Cloudflare"
}

# Validar
if ($url -notmatch '^https:\/\/.*\.trycloudflare\.com$') {
    Write-Host "URL no valida. Abortando..."
    exit 1
}

# Reemplazar en el JS
$jsPath = "C:\Users\efrain.villanueva\Documents\AENA\FORMULARIO WEB\js\utils\config-api-url.js"
$content = Get-Content $jsPath
$newContent = $content | ForEach-Object {
    if ($_ -match '^\s*API_BASE_URL:\s*".*?\.trycloudflare\.com"') {
        '    API_BASE_URL: "' + $url + '"  //url dinamica de cloudflare'
    } else {
        $_
    }
}
$newContent | Set-Content $jsPath -Encoding UTF8
Write-Host "Archivo actualizado correctamente con: $url"

# Git
cd "C:\Users\efrain.villanueva\Documents\AENA\FORMULARIO WEB"
cmd /c "git add ."
cmd /c "git commit -m ""Actualizando URL automatica"""
cmd /c "git push origin main"
