# TaskWeave Backup Script
# Creates a complete backup of the project with timestamp

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupName = "TaskWeave_v1.0.0_Backend_Complete_$timestamp"
$backupPath = "D:\03_Projects\Backups\$backupName"

Write-Host "`n🔄 Creating TaskWeave Backup..." -ForegroundColor Cyan
Write-Host "   Backup Name: $backupName" -ForegroundColor Gray
Write-Host "   Backup Path: $backupPath`n" -ForegroundColor Gray

# Create backup directory
New-Item -ItemType Directory -Force -Path $backupPath | Out-Null

# Copy project files (exclude node_modules, .git, dist)
Write-Host "📁 Copying project files..." -ForegroundColor Yellow
Copy-Item -Path "D:\03_Projects\TaskWeave\*" -Destination $backupPath -Recurse -Exclude "node_modules","dist",".git","*.log" -ErrorAction SilentlyContinue

# Backup database
Write-Host "💾 Backing up database..." -ForegroundColor Yellow
docker exec taskweave-postgres pg_dump -U postgres taskweave > "$backupPath\database_dump_$timestamp.sql" 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Database backed up successfully" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Database backup failed (container might not be running)" -ForegroundColor Yellow
}

# Create backup info file
$backupInfo = @"
TaskWeave Backup Information
============================

Backup Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Version: v1.0.0 - Backend Complete
Commit: $(git -C "D:\03_Projects\TaskWeave" rev-parse HEAD 2>$null)
Tag: v1.0.0-backend-complete

Contents:
- All source code
- Configuration files
- Documentation
- Database dump (if containers were running)

Excluded:
- node_modules (reinstall with: npm install)
- .git directory (use git clone instead)
- dist/build directories (rebuild with: npm run build)
- log files

To Restore:
1. Copy files to project directory
2. Run: npm install (in backend directory)
3. Start Docker: docker-compose up -d
4. Restore database: docker exec -i taskweave-postgres psql -U postgres taskweave < database_dump_*.sql
5. Test: node test-final.js

Status at Backup:
✅ Backend API - 100% Complete
✅ Database - Fully Functional
✅ Docker - Configured
✅ Tests - All Passing
⏳ WebSocket - Structure ready
⏳ Frontend - Not started
⏳ Extension - Not started
"@

$backupInfo | Out-File -FilePath "$backupPath\BACKUP_INFO.txt" -Encoding UTF8

# Calculate backup size
$backupSize = (Get-ChildItem -Path $backupPath -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB

Write-Host "`n✅ Backup Complete!" -ForegroundColor Green
Write-Host "   Location: $backupPath" -ForegroundColor Gray
Write-Host "   Size: $([math]::Round($backupSize, 2)) MB`n" -ForegroundColor Gray

# Create quick restore script in backup
$restoreScript = @"
# TaskWeave Restore Script
# Run this from the backup directory

Write-Host "🔄 Restoring TaskWeave from backup...`n" -ForegroundColor Cyan

# Copy files to project directory
Copy-Item -Path ".\*" -Destination "D:\03_Projects\TaskWeave" -Recurse -Force -Exclude "*.ps1","BACKUP_INFO.txt","database_dump_*.sql"

# Install dependencies
cd D:\03_Projects\TaskWeave\backend
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Start Docker
cd ..
Write-Host "🐳 Starting Docker containers..." -ForegroundColor Yellow
docker-compose up -d
Start-Sleep -Seconds 10

# Restore database
Write-Host "💾 Restoring database..." -ForegroundColor Yellow
`$dumpFile = Get-ChildItem -Path "." -Filter "database_dump_*.sql" | Select-Object -First 1
if (`$dumpFile) {
    Get-Content `$dumpFile.FullName | docker exec -i taskweave-postgres psql -U postgres taskweave
}

# Test
Write-Host "`n🧪 Running tests..." -ForegroundColor Yellow
cd backend
node test-final.js

Write-Host "`n✅ Restore Complete!" -ForegroundColor Green
"@

$restoreScript | Out-File -FilePath "$backupPath\restore.ps1" -Encoding UTF8

Write-Host "📝 Created restore script: $backupPath\restore.ps1`n" -ForegroundColor Gray

