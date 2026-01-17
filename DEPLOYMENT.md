# Deployment Guide

## Prerequisites
- GitHub account
- Render account (free tier): https://render.com/
- Vercel account (free tier): https://vercel.com/
- Gemini API key: https://makersuite.google.com/app/apikey

## Part 1: Deploy Backend on Render

### Step 1: Prepare Environment Variables
You'll need to set these in Render:
- `GEMNI_API_KEY` - Your Google Gemini API key
- `SECRET_KEY` - Django secret key (generate a new one for production)
- `DEBUG` - Set to `False`
- `ALLOWED_HOSTS` - Will be auto-filled by Render
- `CORS_ALLOWED_ORIGINS` - Add your Vercel frontend URL here after deployment

### Step 2: Create Web Service on Render
1. Go to https://dashboard.render.com/
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `github-repo-analyzer-backend` (or your choice)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `bash build.sh`
   - **Start Command**: `gunicorn backend.wsgi:application`

### Step 3: Add Environment Variables
In the "Environment" section, add:
```
GEMNI_API_KEY=your_gemini_api_key_here
SECRET_KEY=your_new_secret_key_here
DEBUG=False
PYTHON_VERSION=3.11.0
```

### Step 4: Deploy
- Click "Create Web Service"
- Wait for deployment to complete (5-10 minutes)
- Copy your backend URL (e.g., `https://your-app.onrender.com`)

## Part 2: Deploy Frontend on Vercel

### Step 1: Create Vercel Project
1. Go to https://vercel.com/
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### Step 2: Add Environment Variable
In "Environment Variables" section:
```
REACT_APP_API_URL=https://your-backend-url.onrender.com
```
(Replace with your actual Render backend URL from Part 1)

### Step 3: Deploy
- Click "Deploy"
- Wait for deployment (2-3 minutes)
- Copy your frontend URL (e.g., `https://your-app.vercel.app`)

## Part 3: Update Backend CORS

### Important: Update CORS Settings
1. Go back to Render dashboard
2. Open your backend service
3. Go to "Environment" tab
4. Add/Update environment variable:
   ```
   CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
   ```
5. Save changes - this will redeploy your backend

## Testing

1. Visit your Vercel frontend URL
2. Try each feature:
   - Dependency Tracker
   - Commit History
   - Code Refactor (Doc Generator)
   - Documentation Generator

## Troubleshooting

### Backend Issues
- Check Render logs in the "Logs" tab
- Ensure all environment variables are set correctly
- Verify `ALLOWED_HOSTS` includes your Render domain

### Frontend Issues
- Check browser console for errors
- Verify `REACT_APP_API_URL` is set correctly
- Make sure there's no trailing slash in the API URL

### CORS Errors
- Double-check `CORS_ALLOWED_ORIGINS` in Render
- Make sure the URL matches exactly (https, no trailing slash)
- Redeploy backend after changing CORS settings

## Free Tier Limitations

**Render Free Tier:**
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month (enough for 1 service running 24/7)

**Vercel Free Tier:**
- Unlimited deployments
- 100GB bandwidth/month
- Fast global CDN

## Notes
- Backend may be slow on first request (Render free tier cold start)
- Consider upgrading to paid tiers for production use
- GitHub tokens are optional - features work with public repos
