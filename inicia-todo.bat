@echo off
echo [1/4] Iniciando Cloudflare Tunnel...

REM Redirige salida del tunel a cloudflared.log
start powershell -NoExit -Command "cloudflared tunnel --url https://localhost:7187 | Out-File -Encoding utf8 'C:\Users\efrain.villanueva\Documents\AENA\FORMULARIO WEB\cloudflared.log'"

timeout /t 10 > nul

echo [2/4] Ejecutando script para actualizar URL...
powershell -ExecutionPolicy Bypass -File "C:\Users\efrain.villanueva\Documents\AENA\FORMULARIO WEB\inicia-todo.ps1"

echo [3/4] Script completado. Presiona una tecla para continuar...
pause
