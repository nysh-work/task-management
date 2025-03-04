#!/bin/bash

# Task Management App Deployment Script for Vercel

echo "=== Task Management App Deployment ==="
echo "This script will guide you through deploying your app to Vercel."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI is not installed globally."
    echo "You can install it with: npm install -g vercel"
    echo "Or deploy using npx: npx vercel"
    echo ""
    echo "Alternatively, you can deploy through the Vercel website:"
    echo "1. Push your code to a GitHub repository"
    echo "2. Go to vercel.com and sign in"
    echo "3. Click 'New Project'"
    echo "4. Import your repository and follow the setup wizard"
    exit 1
fi

echo ""
echo "=== Deployment Options ==="
echo "1. Deploy with Vercel CLI"
echo "2. Deploy using GitHub integration (recommended)"
echo ""

read -p "Choose an option (1 or 2): " option

case $option in
    1)
        echo ""
        echo "=== Deploying with Vercel CLI ==="
        echo "Running: vercel deploy"
        vercel
        ;;
    2)
        echo ""
        echo "=== GitHub Deployment Instructions ==="
        echo "1. Make sure your code is in a GitHub repository"
        echo "   - If not, create a new repository on GitHub"
        echo "   - Initialize git: git init"
        echo "   - Add files: git add ."
        echo "   - Commit: git commit -m \"Initial commit\""
        echo "   - Add remote: git remote add origin YOUR_GITHUB_REPO_URL"
        echo "   - Push: git push -u origin main (or master)"
        echo ""
        echo "2. Go to vercel.com and sign in with GitHub"
        echo "3. Click 'Add New...' → 'Project'"
        echo "4. Select your repository"
        echo "5. Keep the default settings or customize as needed"
        echo "6. Click 'Deploy'"
        echo ""
        echo "Your app will be deployed and you'll get a URL to access it."
        ;;
    *)
        echo "Invalid option selected."
        exit 1
        ;;
esac

echo ""
echo "=== After Deployment ==="
echo "To update your deployed app after making changes:"
echo "1. Commit your changes: git add . && git commit -m \"Your update message\""
echo "2. Push to GitHub: git push"
echo "3. Vercel will automatically deploy the new version"
echo ""
echo "For more information, check the DEPLOYMENT_GUIDE.md file in your project." 