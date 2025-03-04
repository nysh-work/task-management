# Task Management App Deployment Guide

This guide provides detailed instructions for deploying your Task Management application to Vercel.

## Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Git (for GitHub deployment)
- A Vercel account (free tier is available)

## Preparing Your Application

Before deploying, make sure your application is ready:

1. Ensure all dependencies are correctly listed in `package.json`
2. Make sure your application builds successfully locally with `npm run build`
3. Verify that environment variables are properly configured
4. If you're using environment variables, create a `.env.local` file for local development and note which variables will need to be set in Vercel

## Deployment Options

### Option 1: Vercel CLI

1. Install the Vercel CLI globally:
   ```
   npm install -g vercel
   ```

2. Log in to your Vercel account:
   ```
   vercel login
   ```

3. Deploy from your project directory:
   ```
   vercel
   ```

4. Follow the prompts to configure your project:
   - Confirm the project directory
   - Select or create a project
   - Configure project settings (build command, output directory, etc.)

5. After deployment, you'll receive a URL where your application is hosted.

6. For subsequent deployments, simply run:
   ```
   vercel
   ```
   
   Or for production deployments:
   ```
   vercel --prod
   ```

### Option 2: GitHub Integration (Recommended)

1. Push your code to a GitHub repository:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

2. Sign in to [Vercel](https://vercel.com/) with your GitHub account

3. Click "Add New..." → "Project"

4. Select your repository from the list

5. Configure your project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next

6. Add any required environment variables in the "Environment Variables" section

7. Click "Deploy"

8. Your application will be built and deployed, and you'll receive a URL

## Environment Variables

If your application uses environment variables, you'll need to add them to your Vercel project:

1. Go to your Vercel Dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add each environment variable and its value
5. Choose which environments (Production, Preview, Development) should have access to each variable
6. Save your changes

## Custom Domains

To use a custom domain with your Vercel deployment:

1. Go to your Vercel Dashboard
2. Select your project
3. Go to "Settings" → "Domains"
4. Add your domain and follow the verification process
5. Update your DNS records as instructed by Vercel

## Handling Browser APIs in Next.js

Since our application uses browser-specific APIs (Geolocation, Notifications) that aren't available during server-side rendering, we've implemented checks to ensure these APIs are only accessed in the browser:

```javascript
if (typeof window !== 'undefined' && 'geolocation' in navigator) {
  // Geolocation code here
}

if (typeof window !== 'undefined' && 'Notification' in window) {
  // Notification code here
}
```

## Troubleshooting Common Issues

### Build Failures

If your build fails on Vercel:

1. Check the build logs for specific errors
2. Ensure your application builds locally with `npm run build`
3. Verify that all dependencies are correctly listed in `package.json`
4. Check that you're using the correct Node.js version

### Missing Environment Variables

If your application behaves differently in production:

1. Verify that all required environment variables are set in Vercel
2. Check that the values match what you're using in development

### API Routes Not Working

If your API routes return 404 errors:

1. Ensure they're in the correct directory (`app/api/` for App Router or `pages/api/` for Pages Router)
2. Check that the route path matches what your client code is requesting

## Continuous Deployment

With GitHub integration, Vercel automatically deploys:

- Every push to the main branch deploys to production
- Pull requests generate preview deployments

To disable automatic deployments:

1. Go to your Vercel Dashboard
2. Select your project
3. Go to "Settings" → "Git"
4. Disable "Auto Deploy"

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js on Vercel](https://vercel.com/guides/deploying-nextjs-with-vercel) 