# Solicitar URL del tunel
$url = Read-Host "Pega aqui la URL del tunel generada por Cloudflare"

# Validar que es una URL valida
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

# Git automatico
cd "C:\Users\efrain.villanueva\Documents\AENA\FORMULARIO WEB"

# Ejecutar los comandos git desde CMD para evitar errores de argumentos
cmd /c "git add ."
cmd /c "git commit -m ""Actualizando URL automatica"""
cmd /c "git push origin main"

# Abrir Hyper
Start-Process "C:\Users\efrain.villanueva\AppData\Local\Programs\Hyper\Hyper.exe"

# Esperar a que Hyper abra
Start-Sleep -Seconds 2

# Usar SendKeys para escribir 'dotnet run'
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.SendKeys]::SendWait("dotnet run{ENTER}")
