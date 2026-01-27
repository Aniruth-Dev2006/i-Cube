# Setup Script for RAG System
# Run this once to set up everything

Write-Host "🔧 RAG System Setup Script" -ForegroundColor Cyan
Write-Host ""

$currentDir = Get-Location

# Step 1: Install Python dependencies
Write-Host "Step 1: Installing Python dependencies..." -ForegroundColor Yellow
Set-Location "RAG"
python -m pip install --upgrade pip
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install Python dependencies" -ForegroundColor Red
    Set-Location $currentDir
    exit 1
}
Write-Host "✓ Python dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Setup database
Write-Host "Step 2: Setting up database..." -ForegroundColor Yellow
python setup_db.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to setup database" -ForegroundColor Red
    Set-Location $currentDir
    exit 1
}
Write-Host "✓ Database setup completed" -ForegroundColor Green
Write-Host ""

# Step 3: Process PDFs
Write-Host "Step 3: Processing PDFs and generating embeddings..." -ForegroundColor Yellow
Write-Host "⏰ This may take 5-10 minutes..." -ForegroundColor Yellow
python process_pdfs.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to process PDFs" -ForegroundColor Red
    Set-Location $currentDir
    exit 1
}
Write-Host "✓ PDFs processed successfully" -ForegroundColor Green
Write-Host ""

Set-Location $currentDir

# Step 4: Install Node.js backend dependencies
Write-Host "Step 4: Installing Node.js backend dependencies..." -ForegroundColor Yellow
Set-Location "server"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install backend dependencies" -ForegroundColor Red
    Set-Location $currentDir
    exit 1
}
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
Write-Host ""

Set-Location $currentDir

# Step 5: Install React frontend dependencies
Write-Host "Step 5: Installing React frontend dependencies..." -ForegroundColor Yellow
Set-Location "client"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
    Set-Location $currentDir
    exit 1
}
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

Set-Location $currentDir

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "✓ Setup completed successfully!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Run: .\start-all.ps1" -ForegroundColor Cyan
Write-Host "  2. Open: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  3. Login and click 'Start Chatting'" -ForegroundColor Cyan
Write-Host ""
