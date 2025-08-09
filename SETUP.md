# Mikael AI - Setup Instructions

## 🚀 Vercel Blob + Postgres Integration

Your Mikael AI app is now integrated with Vercel's cloud services for production-ready storage and database functionality.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Clerk Account**: Already configured with your existing keys
3. **Git Repository**: Push your code to GitHub/GitLab/Bitbucket

## 🛠️ Setup Steps

### Step 1: Deploy to Vercel

1. Connect your repository to Vercel
2. Deploy your project (it will work with existing Clerk keys)

### Step 2: Add Vercel Postgres Database

1. Go to your Vercel project dashboard
2. Click on the **Storage** tab
3. Click **Create Database** → **Postgres**
4. Choose a database name (e.g., `mikael-ai-db`)
5. Select your region
6. Click **Create**

**Vercel will automatically add these environment variables:**
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NO_SSL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### Step 3: Add Vercel Blob Storage

1. In your Vercel project dashboard
2. Go to **Storage** tab
3. Click **Create Database** → **Blob**
4. Choose a store name (e.g., `mikael-ai-storage`)
5. Click **Create**

**Vercel will automatically add:**
- `BLOB_READ_WRITE_TOKEN`

### Step 4: Initialize Database

1. After deployment, visit: `https://your-app.vercel.app/api/setup`
2. This will create all necessary database tables
3. You should see: `{"message": "Database initialized successfully"}`

### Step 5: Test Your App

1. Visit your deployed app
2. Sign up/Sign in with Clerk
3. Upload a video or image
4. Verify it appears in your dashboard

## 🎯 What's Included

### ✅ Database Tables
- **users**: Synced with Clerk authentication
- **videos**: Video/image metadata and status
- **video_processing_jobs**: Background job tracking
- **video_exports**: Export history and settings

### ✅ Storage Buckets
- **videos/**: User video files
- **images/**: User image files  
- **thumbnails/**: Auto-generated thumbnails
- **exports/**: Processed video exports

### ✅ Features
- **Persistent Storage**: No more lost uploads
- **User Isolation**: Each user sees only their content
- **Real-time Updates**: Processing status updates
- **Automatic Thumbnails**: Generated for videos
- **File Management**: Upload, delete, organize
- **Export System**: Save processed videos

## 🔧 Local Development

For local development, you can:

1. Create a `.env.local` file with your environment variables
2. Use Vercel CLI: `vercel env pull .env.local`
3. Run: `npm run dev`

## 📊 Free Tier Limits

**Vercel Postgres (Free):**
- 256MB database size
- 60 hours compute time/month
- 256MB data transfer/month

**Vercel Blob (Free):**
- 1GB storage
- 100GB bandwidth/month
- 10,000 requests/month

## 🚀 Scaling Up

When you outgrow the free tier:

**Pro Plan ($20/month):**
- 100GB storage
- 1TB bandwidth
- 20GB database
- Unlimited compute time

## 🐛 Troubleshooting

### Database Connection Issues
1. Check environment variables in Vercel dashboard
2. Visit `/api/setup` to initialize tables
3. Check Vercel function logs

### File Upload Issues
1. Verify `BLOB_READ_WRITE_TOKEN` is set
2. Check file size limits (100MB max)
3. Ensure file types are supported

### Authentication Issues
1. Verify Clerk keys are set
2. Check Clerk dashboard for user activity
3. Ensure middleware is properly configured

## 📞 Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Clerk Docs**: [clerk.com/docs](https://clerk.com/docs)
- **Issues**: Create an issue in your repository

---

🎉 **Congratulations!** Your Mikael AI app is now production-ready with professional cloud infrastructure!