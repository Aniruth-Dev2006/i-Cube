# Quick Start Script for RAG System
# Run this script to start all services

Write-Host "🚀 Starting RAG System..." -ForegroundColor Green
Write-Host ""

# Check if Python is installed
Write-Host "Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 16+" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "RAG System Quick Start" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will start:" -ForegroundColor White
Write-Host "  1. Python RAG API (port 8000)" -ForegroundColor White
Write-Host "  2. Node.js Backend (port 3000)" -ForegroundColor White
Write-Host "  3. React Frontend (port 5173)" -ForegroundColor White
Write-Host ""
Write-Host "Make sure you have:" -ForegroundColor Yellow
Write-Host "  ✓ Run 'cd RAG && pip install -r requirements.txt'" -ForegroundColor Yellow
Write-Host "  ✓ Run 'cd RAG && python setup_db.py'" -ForegroundColor Yellow
Write-Host "  ✓ Run 'cd RAG && python process_pdfs.py'" -ForegroundColor Yellow
Write-Host "  ✓ Run 'cd server && npm install'" -ForegroundColor Yellow
Write-Host "  ✓ Run 'cd client && npm install'" -ForegroundColor Yellow
Write-Host ""

$continue = Read-Host "Continue? (y/n)"
if ($continue -ne "y") {
    Write-Host "Exiting..." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "Starting services..." -ForegroundColor Green
Write-Host ""

# Start Python RAG API
Write-Host "Starting Python RAG API..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd RAG; python app.py" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Node.js Backend
Write-Host "Starting Node.js Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; node app.js" -WindowStyle Normal

Start-Sleep -Seconds 2

# Start React Frontend
Write-Host "Starting React Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "✓ All services started!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access points:" -ForegroundColor White
Write-Host "  • Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  • Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  • RAG API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "  • RAG Health: http://localhost:8000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop services" -ForegroundColor Yellow
