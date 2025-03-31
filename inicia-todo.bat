@echo off
echo [1/4] Iniciando Cloudflare Tunnel...
start powershell -NoExit -Command "cloudflared tunnel --url https://localhost:7187"
timeout /t 10 > nul

echo [2/4] Ejecutando script para actualizar URL...
powershell -ExecutionPolicy Bypass -File "C:\Users\efrain.villanueva\Documents\AENA\FORMULARIO WEB\inicia-todo.ps1"

echo [3/4] Abriendo Hyper y ejecutando dotnet run...
powershell -Command "Start-Process 'C:\Users\efrain.villanueva\AppData\Local\Programs\Hyper\Hyper.exe'"
timeout /t 3 > nul

:: Simular teclas para escribir y ejecutar dotnet run
powershell -Command "$wshell = New-Object -ComObject wscript.shell; $wshell.AppActivate('Hyper'); Start-Sleep -Milliseconds 500; $wshell.SendKeys('dotnet run{ENTER}')"

echo [4/4] Proceso completo. Puedes cerrar esta ventana si lo deseas.
pause
