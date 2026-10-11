$env:PATH = "C:\php;$env:PATH"
Write-Host "Starting Laravel (http://localhost:8000) and Vite (http://localhost:5173)..." -ForegroundColor Cyan
npx concurrently -c "#93c5fd,#fdba74" "php artisan serve" "npm run dev" --names="server,vite"
