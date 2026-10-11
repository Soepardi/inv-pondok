@echo off
set "PATH=C:\php;%PATH%"
echo Starting Laravel Server (http://localhost:8000) and Vite (http://localhost:5173)...
npx concurrently -c "#93c5fd,#fdba74" "php artisan serve" "npm run dev" --names="server,vite"
