# 🎬 Mikael AI - Viral Video Generator

*AI-powered video creation platform with professional cloud infrastructure*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Powered by Clerk](https://img.shields.io/badge/Auth-Clerk-blue?style=for-the-badge)](https://clerk.com)
[![Storage by Vercel](https://img.shields.io/badge/Storage-Vercel%20Blob-orange?style=for-the-badge)](https://vercel.com/storage/blob)

## 🚀 Features

### ✨ AI-Powered Video Creation
- **Smart Templates**: Social Post, Viral, Podcast, Travel layouts
- **Automatic Thumbnails**: Generated from video content
- **Real-time Processing**: Live status updates during video processing
- **Export Options**: Multiple formats and quality settings

### 🔐 Enterprise Authentication
- **Clerk Integration**: Secure user authentication and management
- **User Profiles**: Avatar, email, and profile management
- **Session Management**: Persistent login across devices

### ☁️ Production-Ready Infrastructure
- **Vercel Postgres**: Scalable database with automatic backups
- **Vercel Blob Storage**: Global CDN for fast video delivery
- **Real-time Updates**: Live processing status and notifications
- **File Management**: Upload, organize, and delete media files

### 🎨 Modern UI/UX
- **Dark Theme**: Professional design with orange/yellow branding
- **Responsive Design**: Works perfectly on desktop and mobile
- **Drag & Drop**: Intuitive file upload experience
- **Loading States**: Smooth animations and progress indicators

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Radix UI components
- **Authentication**: Clerk
- **Database**: Vercel Postgres (PostgreSQL)
- **Storage**: Vercel Blob
- **Deployment**: Vercel

## 📋 Quick Start

### 1. Clone & Install
```bash
git clone <your-repo>
cd mikael-video
npm install
```

### 2. Deploy to Vercel
1. Connect repository to Vercel
2. Add Vercel Postgres database
3. Add Vercel Blob storage
4. Deploy!

### 3. Initialize Database
Visit `https://your-app.vercel.app/api/setup` after deployment

### 4. Start Creating
- Sign up with Clerk authentication
- Upload videos or images
- Create viral social media content
- Export and share!

## 📚 Documentation

- **[Setup Guide](./SETUP.md)**: Complete deployment instructions
- **[API Reference](./app/api/)**: Backend API endpoints
- **[Components](./components/)**: UI component library
- **[Database Schema](./lib/db/schema.sql)**: Database structure

## 🏗️ Architecture

```
📁 mikael-video/
├── 📁 app/                    # Next.js app directory
│   ├── 📁 dashboard/          # Main dashboard
│   ├── 📁 editor/[id]/        # Video editor
│   ├── 📁 api/               # API routes
│   └── 📄 page.tsx           # Landing page
├── 📁 components/            # Reusable UI components
├── 📁 lib/                   # Core utilities
│   ├── 📁 db/               # Database client & schema
│   ├── 📁 storage/          # Blob storage utilities
│   └── 📁 auth/             # User sync services
└── 📄 middleware.ts         # Clerk middleware
```

## 🔧 Environment Variables

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Vercel Postgres (auto-generated)
POSTGRES_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...

# Vercel Blob (auto-generated)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

## 🎯 Features Roadmap

- [x] **User Authentication** (Clerk)
- [x] **File Upload** (Vercel Blob)
- [x] **Database Integration** (Vercel Postgres)
- [x] **Video Processing** (Client-side)
- [x] **Export System** (Multiple formats)
- [ ] **AI Integration** (OpenAI/Replicate)
- [ ] **Real-time Collaboration**
- [ ] **Advanced Templates**
- [ ] **Analytics Dashboard**

## 📊 Free Tier Limits

**Vercel Postgres**: 256MB DB, 60h compute/month  
**Vercel Blob**: 1GB storage, 100GB bandwidth/month  
**Clerk**: 10K monthly active users  

## 🚀 Scaling

When you outgrow free tier:
- **Vercel Pro** ($20/month): 100GB storage, 1TB bandwidth
- **Clerk Pro** ($25/month): Advanced features & analytics
- **Custom Enterprise**: Contact for volume pricing

## 🐛 Troubleshooting

### Common Issues
1. **Database not initialized**: Visit `/api/setup`
2. **Upload fails**: Check blob storage token
3. **Auth issues**: Verify Clerk configuration

### Support
- Create an issue in this repository
- Check [Vercel Docs](https://vercel.com/docs)
- Review [Clerk Documentation](https://clerk.com/docs)

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

---

🎉 **Ready to create viral content?** Deploy your Mikael AI app today!
