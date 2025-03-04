# Task Management App Deployment Script for Vercel (PowerShell)

Write-Host "=== Task Management App Deployment ===" -ForegroundColor Cyan
Write-Host "This script will guide you through deploying your app to Vercel."

# Check if Vercel CLI is installed
try {
    Get-Command vercel -ErrorAction Stop | Out-Null
    $vercelInstalled = $true
} catch {
    $vercelInstalled = $false
}

if (-not $vercelInstalled) {
    Write-Host "Vercel CLI is not installed globally." -ForegroundColor Yellow
    Write-Host "You can install it with: npm install -g vercel"
    Write-Host "Or deploy using npx: npx vercel"
    Write-Host ""
    Write-Host "Alternatively, you can deploy through the Vercel website:" -ForegroundColor Green
    Write-Host "1. Push your code to a GitHub repository"
    Write-Host "2. Go to vercel.com and sign in"
    Write-Host "3. Click 'New Project'"
    Write-Host "4. Import your repository and follow the setup wizard"
    
    $useNpx = Read-Host "Would you like to continue with npx vercel? (y/n)"
    if ($useNpx -ne "y") {
        exit
    }
}

Write-Host ""
Write-Host "=== Deployment Options ===" -ForegroundColor Cyan
Write-Host "1. Deploy with Vercel CLI"
Write-Host "2. Deploy using GitHub integration (recommended)"
Write-Host ""

$option = Read-Host "Choose an option (1 or 2)"

switch ($option) {
    "1" {
        Write-Host ""
        Write-Host "=== Deploying with Vercel CLI ===" -ForegroundColor Green
        Write-Host "Running: vercel deploy"
        
        if ($vercelInstalled) {
            vercel
        } else {
            npx vercel
        }
    }
    "2" {
        Write-Host ""
        Write-Host "=== GitHub Deployment Instructions ===" -ForegroundColor Green
        Write-Host "1. Make sure your code is in a GitHub repository"
        Write-Host "   - If not, create a new repository on GitHub"
        Write-Host "   - Initialize git: git init"
        Write-Host "   - Add files: git add ."
        Write-Host "   - Commit: git commit -m ""Initial commit"""
        Write-Host "   - Add remote: git remote add origin YOUR_GITHUB_REPO_URL"
        Write-Host "   - Push: git push -u origin main (or master)"
        Write-Host ""
        Write-Host "2. Go to vercel.com and sign in with GitHub"
        Write-Host "3. Click 'Add New...' → 'Project'"
        Write-Host "4. Select your repository"
        Write-Host "5. Keep the default settings or customize as needed"
        Write-Host "6. Click 'Deploy'"
        Write-Host ""
        Write-Host "Your app will be deployed and you'll get a URL to access it."
    }
    default {
        Write-Host "Invalid option selected." -ForegroundColor Red
        exit
    }
}

Write-Host ""
Write-Host "=== After Deployment ===" -ForegroundColor Cyan
Write-Host "To update your deployed app after making changes:"
Write-Host "1. Commit your changes: git add . && git commit -m ""Your update message"""
Write-Host "2. Push to GitHub: git push"
Write-Host "3. Vercel will automatically deploy the new version"
Write-Host ""
Write-Host "For more information, check the DEPLOYMENT_GUIDE.md file in your project." 