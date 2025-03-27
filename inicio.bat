@echo off
echo [1/4] Iniciando Cloudflare Tunnel...
start powershell -NoExit -Command "cloudflared tunnel --url https://localhost:7187"

timeout /t 15 > nul

echo [2/4] Actualizando URL en config-api-url.js...
powershell -ExecutionPolicy Bypass -File "C:\Users\efrain.villanueva\Documents\AENA\FORMULARIO WEB\actualiza-url.ps1"


echo [3/4] Subiendo cambios a GitHub...
start "" cmd /k ^
"cd /d C:\Users\efrain.villanueva\Documents\AENA\FORMULARIO WEB && git add . && git commit -m \"Actualizando URL automatica\" && git push origin main && pause"

echo [4/4] Levantando servidor backend...
cd "C:\Users\efrain.villanueva\Documents\AENA\FormularioWebBackendAPI"
start "" cmd /k "dotnet run"
