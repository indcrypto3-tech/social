# Script to push database schema to production Supabase
Write-Host "🚀 Pushing database schema to production..." -ForegroundColor Green

# Prompt for production database URL
$productionUrl = Read-Host "Enter your Supabase production DATABASE_URL"

if ([string]::IsNullOrWhiteSpace($productionUrl)) {
    Write-Host "❌ Error: DATABASE_URL cannot be empty" -ForegroundColor Red
    exit 1
}

# Temporarily set the environment variable
$env:DATABASE_URL = $productionUrl

Write-Host "📊 Running drizzle-kit push..." -ForegroundColor Cyan

# Run the push command
npm run db:push

# Check if successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Schema pushed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to push schema" -ForegroundColor Red
}

# Clean up
$env:DATABASE_URL = ""

Write-Host "🧹 Cleaned up environment variable" -ForegroundColor Yellow
