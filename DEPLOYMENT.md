# Vercel Deployment Guide

This guide will help you deploy your ProPrep AI mock interview application to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your project repository on GitHub, GitLab, or Bitbucket
3. API keys for Google AI (Gemini) and Firebase

## Environment Variables Setup

Before deploying, you need to set up the following environment variables in your Vercel project:

### Required Environment Variables

1. **Google AI API Keys:**
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - `GOOGLE_API_KEY` - Your Google API key (can be the same as GEMINI_API_KEY)

2. **Firebase Configuration:**
   - `NEXT_PUBLIC_FIREBASE_API_KEY` - Your Firebase API key
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Your Firebase project ID
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
   - `NEXT_PUBLIC_FIREBASE_APP_ID` - Your Firebase app ID
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` - Your Firebase measurement ID

## Deployment Steps

### Method 1: Deploy via Vercel Dashboard

1. **Connect Repository:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository
   - Select your repository and click "Import"

2. **Configure Project:**
   - Framework Preset: Next.js (should be auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

3. **Add Environment Variables:**
   - In the "Environment Variables" section
   - Add each environment variable listed above
   - Make sure to mark them as "Production" environment

4. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be available at the provided Vercel URL

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set Environment Variables:**
   ```bash
   vercel env add GEMINI_API_KEY
   vercel env add GOOGLE_API_KEY
   vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
   vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
   vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
   vercel env add NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
   ```

5. **Redeploy with Environment Variables:**
   ```bash
   vercel --prod
   ```

## Post-Deployment Configuration

1. **Update Firebase Settings:**
   - Go to your Firebase Console
   - Navigate to Authentication > Settings > Authorized domains
   - Add your Vercel domain (e.g., `your-app.vercel.app`)

2. **Test the Application:**
   - Visit your deployed URL
   - Test the login functionality
   - Test the interview flow
   - Verify AI features are working

## Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check that all environment variables are set correctly
   - Ensure your API keys are valid and have proper permissions
   - Check the build logs in Vercel dashboard for specific errors

2. **Runtime Errors:**
   - Verify Firebase configuration is correct
   - Check that all environment variables are marked as "Production"
   - Ensure your Firebase project allows your Vercel domain

3. **AI Features Not Working:**
   - Verify your Google AI API keys are correct
   - Check that you have sufficient API quota
   - Ensure the API keys have access to the Gemini model

### Build Configuration:

The project is configured with:
- Next.js 15.3.3
- TypeScript support
- Tailwind CSS for styling
- Firebase for authentication and database
- Google AI (Gemini) for interview features

### Performance Optimization:

- Images are optimized with Next.js Image component
- External packages are properly configured in `next.config.ts`
- Build errors are ignored for faster deployment (can be changed in production)

## Security Notes

- Never commit API keys to your repository
- Use environment variables for all sensitive data
- Regularly rotate your API keys
- Monitor your API usage to prevent unexpected charges

## Support

If you encounter issues during deployment:
1. Check the Vercel build logs
2. Verify all environment variables are set
3. Test locally with the same environment variables
4. Check the Vercel documentation for Next.js specific issues
