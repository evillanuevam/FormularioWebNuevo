# 1. Iniciar Cloudflare Tunnel
Write-Host "[1/4] Iniciando Cloudflare Tunnel..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cloudflared tunnel --url https://localhost:7187"

# 2. Esperar a que aparezca la URL en la consola (no en el archivo)
Start-Sleep -Seconds 8
Write-Host "[2/4] Capturando URL desde consola PowerShell..."

# Capturar la ventana de PowerShell abierta (la más reciente que tiene 'cloudflared')
$cloudflaredProcess = Get-Process -Name "powershell" | Sort-Object StartTime -Descending | Select-Object -First 1

# Leer la consola del proceso (no es sencillo con PowerShell nativo, así que lo simulamos leyendo la salida con `Get-Content` desde archivo temporal)
# Pero como no hay archivo de log, haremos workaround:
# Vamos a reiniciar Cloudflare pero capturando su output directamente:

Write-Host "[2/4] Reiniciando Cloudflare Tunnel para capturar URL..."
$cloudflaredOutput = powershell -Command {
    cloudflared tunnel --url https://localhost:7187 2>&1 | ForEach-Object {
        $_
        if ($_ -match "https://.*?\.trycloudflare\.com") {
            $_
            break
        }
    }
}

# Extraer la URL de la salida
$urlMatch = $cloudflaredOutput | Select-String -Pattern "https://.*?\.trycloudflare\.com" | Select-Object -First 1
if (-not $urlMatch) {
    Write-Host " No se pudo obtener la URL desde la consola."
    exit 1
}
$url = $urlMatch.Matches[0].Value
Write-Host "[] URL capturada: $url"

# 3. Actualizar archivo config-api-url.js
Write-Host "[3/4] Actualizando archivo JS..."

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
Write-Host " Archivo actualizado correctamente."

# 4. Hacer commit y push a GitHub
Write-Host "[4/4] Subiendo cambios a GitHub..."
Set-Location "C:\Users\efrain.villanueva\Documents\AENA\FORMULARIO WEB"
git add .
git commit -m "Actualizando URL automática" 2>$null
git push origin main

# Levantar el backend
Write-Host "[4/4] Levantando servidor backend..."
Start-Process cmd -ArgumentList "/k cd /d C:\Users\efrain.villanueva\Documents\AENA\FormularioWebBackendAPI && dotnet run"
