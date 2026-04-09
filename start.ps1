# Start Backend and Frontend together

Write-Host "Starting Crop Health Monitoring System..." -ForegroundColor Green
Write-Host ""

# Start Backend in new window
Write-Host "[1/2] Starting Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; python -m uvicorn app.main:app --reload --port 8000"

# Wait 5 seconds for backend to start
Start-Sleep -Seconds 5

# Start Frontend in new window
Write-Host "[2/2] Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Both servers are starting in separate windows..." -ForegroundColor Yellow
Write-Host "Press any key to exit (servers will keep running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
