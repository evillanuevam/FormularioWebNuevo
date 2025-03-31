@echo off
echo [1/4] Iniciando Cloudflare Tunnel...
start powershell -NoExit -Command "cloudflared tunnel --url https://localhost:7187"
timeout /t 10 > nul

echo [2/4] Ejecutando script para actualizar URL...
powershell -ExecutionPolicy Bypass -File "C:\Users\efrain.villanueva\Documents\AENA\FORMULARIO WEB\inicia-todo.ps1"

echo [3/4] Abriendo Hyper en la carpeta del backend...
powershell -Command "Start-Process 'C:\Users\efrain.villanueva\AppData\Local\Programs\Hyper\Hyper.exe' -ArgumentList '--cwd', 'C:\Users\efrain.villanueva\Documents\AENA\FormularioWebBackendAPI', '--', 'dotnet run'"

echo [4/4] Proceso completo. Puedes cerrar esta ventana si lo deseas.
pause
