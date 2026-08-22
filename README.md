# 🎨 NanoArt - AI-Powered Creative Tools Platform

A comprehensive SaaS platform offering 7+ AI-powered tools for image and video generation, editing, and analysis. Built with Next.js 15, Supabase, Stripe, and multiple AI providers.

🌐 **Live at [nanoart.app](https://www.nanoart.app)**

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/sunpy1106s-projects/v0-image-edit-tool)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/4KoFBz0X4A3)
![Next.js](https://img.shields.io/badge/Next.js-15.2-black)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

## ✨ Features

### 🎯 AI Generation Tools (7 Tools)

1. **[Text-to-Image](https://nanoart.app/text-to-image)** - Generate images from text descriptions using AI
2. **[Remove Background](https://nanoart.app/remove-background)** - Automatically remove backgrounds from images
3. **[Text-to-Video](https://nanoart.app/text-to-video)** - Create videos from text prompts (FAL.AI)
4. **[Sora2 Text-to-Video](https://nanoart.app/sora2-text-to-video)** - Advanced video generation with OpenAI Sora-2
5. **[Image-to-Video by Veo](https://nanoart.app/image-to-video-by-veo)** - Transform images into videos using Google Veo 3.1
6. **[Image-to-Prompt](https://nanoart.app/image-to-prompt)** ⭐ - Analyze images and generate detailed prompts (OpenRouter + Gemini 2.5 Flash)
7. **[Video-to-Prompt](https://nanoart.app/video-to-prompt)** ⭐ - Extract structured prompts from videos (Google AI Gemini)

### 💎 Platform Features

- **Credit-Based Billing** - Flexible consumption model with monthly allowances
- **Subscription Tiers** - Free, Pro Monthly, Pro Yearly plans
- **Usage Analytics** - Detailed tracking of credit consumption and history
- **User Authentication** - Secure auth with Supabase
- **Payment Processing** - Stripe integration with webhook handling
- **Cloud Storage** - Cloudflare R2 for video uploads and storage
- **Responsive Dashboard** - Manage all tools from unified interface
- **SEO Optimized** - Landing pages for each tool with structured data
- **Mobile Friendly** - Works seamlessly on all devices

### 🏗️ Technical Features

- ⚡ **Next.js 15** - Latest App Router with React 19 and Server Components
- 🗄️ **PostgreSQL** - Robust database with Supabase hosting
- 🔄 **Prisma ORM** - Type-safe database access with migration system
- 💅 **Tailwind CSS v4** - Modern utility-first styling
- 🛡️ **TypeScript** - Full type safety across the stack
- 🤖 **Multiple AI Providers** - FAL.AI, Google AI, OpenRouter
- ☁️ **Cloudflare R2** - Cost-effective object storage
- 📊 **Vercel Analytics** - Built-in performance monitoring
- 🚀 **Vercel Ready** - Optimized for serverless deployment

## 🚀 Quick Start

Get up and running in 15 minutes:

```bash
# Clone repository
git clone https://github.com/nanoartApp/nanoart.git
cd nanoart

# Install dependencies
npm install

# Setup environment
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Initialize database
npm run db:generate
npm run db:push

# Start development
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

📚 **[Full Quick Start Guide →](./docs/QUICK_START.md)**

## 📋 Prerequisites

### Required Accounts and Services

- **Node.js 18+** and npm 8+
- **[Supabase](https://supabase.com)** - Database & Authentication
- **[Stripe](https://stripe.com)** - Payment processing
- **[FAL.AI](https://fal.ai)** - Image and video generation
- **[OpenRouter](https://openrouter.ai)** - Image-to-Prompt (Gemini access)
- **[Google AI Studio](https://aistudio.google.com)** - Video-to-Prompt (Gemini API)
- **[Cloudflare R2](https://cloudflare.com/r2)** - Video storage
- **[Vercel](https://vercel.com)** - Deployment (optional)

## 🛠️ Installation

### Detailed Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/nanoartApp/nanoart.git
   cd nanoart
   npm install
   ```

2. **Configure Services**

   **Supabase Setup:**
   - Create new Supabase project
   - Get project URL and anon key from Settings → API
   - Get database URLs from Settings → Database

   **Stripe Setup:**
   - Create Stripe account and get API keys
   - Create Pro Monthly and Pro Yearly products
   - Copy price IDs for both products
   - Setup webhook endpoint: `https://yourdomain.com/api/stripe/webhook`

   **AI Providers:**
   - **FAL.AI**: Get API key from [fal.ai/dashboard](https://fal.ai/dashboard)
   - **OpenRouter**: Get API key from [openrouter.ai/keys](https://openrouter.ai/keys)
   - **Google AI**: Get API key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

   **Cloudflare R2:**
   - Create R2 bucket in Cloudflare dashboard
   - Generate R2 API token (Account ID, Access Key, Secret Key)
   - Configure custom domain for public access

3. **Environment Variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Required variables in `.env.local`:
   ```env
   # OpenRouter (Image-to-Prompt)
   OPENROUTER_API_KEY=sk-or-v1-...

   # Google AI (Video-to-Prompt)
   GOOGLE_AI_API_KEY=AIzaSy...

   # FAL.AI (Image/Video Generation)
   FAL_KEY=your-fal-api-key

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@...pooler.supabase.com:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres.xxx:[PASSWORD]@...pooler.supabase.com:5432/postgres

   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRO_MONTHLY_PRICE_ID=price_...
   STRIPE_PRO_YEARLY_PRICE_ID=price_...

   # Cloudflare R2
   R2_ACCOUNT_ID=your-account-id
   R2_ACCESS_KEY_ID=your-access-key
   R2_SECRET_ACCESS_KEY=your-secret-key
   R2_BUCKET_NAME=your-bucket-name
   R2_PUBLIC_BASE_URL=https://storage.yourdomain.com

   # Application
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX (optional)
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma Client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # (Optional) Open Prisma Studio to view data
   npm run db:studio
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

📚 **[Complete Deployment Guide →](./docs/DEPLOYMENT.md)**

## 🏗️ Project Structure

```
nanoart/
├── app/                           # Next.js App Router
│   ├── api/                       # API routes
│   │   ├── tools/                 # Tool-specific endpoints
│   │   │   ├── image-to-prompt/   # Image analysis API
│   │   │   ├── video-to-prompt/   # Video analysis API
│   │   │   ├── text-to-video/     # Video generation API
│   │   │   ├── sora2/             # Sora-2 video API
│   │   │   ├── image-to-video/    # Image-to-video API
│   │   │   └── remove-background/ # Background removal API
│   │   ├── usage/                 # Usage tracking endpoints
│   │   └── stripe/                # Stripe webhook & subscription
│   ├── dashboard/                 # User dashboard
│   │   ├── generator/             # Tool pages
│   │   │   ├── text-to-image/
│   │   │   ├── remove-background/
│   │   │   ├── text-to-video/
│   │   │   ├── sora2-text-to-video/
│   │   │   ├── image-to-video-by-veo/
│   │   │   ├── image-to-prompt/   # ⭐ New
│   │   │   └── video-to-prompt/   # ⭐ New
│   │   ├── usage/                 # Usage history
│   │   └── settings/              # User settings
│   ├── pricing/                   # Pricing page
│   ├── (tool-pages)/              # Public tool landing pages
│   └── page.tsx                   # Homepage
├── components/                    # React components
│   ├── ui/                        # UI primitives (Radix UI)
│   ├── footer.tsx                 # Site footer
│   ├── navbar.tsx                 # Navigation
│   └── usage-display.tsx          # Usage stats component
├── lib/                           # Utilities
│   ├── openrouter.ts              # OpenRouter client (Image-to-Prompt)
│   ├── usage.ts                   # Usage tracking & credit system
│   ├── plans.ts                   # Subscription plan configuration
│   ├── prisma.ts                  # Prisma client singleton
│   └── supabase/                  # Supabase auth setup
├── prisma/                        # Database
│   ├── schema.prisma              # Data models & relations
│   └── migrations/                # Migration history
└── docs/                          # Documentation
    ├── QUICK_START.md             # Quick start guide
    ├── DEPLOYMENT.md              # Deployment instructions
    ├── PRISMA_MIGRATE.md          # Database migration guide
    └── (feature-specific docs)
```

## 💻 Development

### Available Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database (automatically loads .env.local)
npm run db:generate     # Generate Prisma Client
npm run db:push         # Push schema changes to database
npm run db:migrate      # Create and apply migrations (dev)
npm run db:studio       # Open Prisma Studio GUI

# Deployment Database
npm run db:migrate:deploy  # Apply migrations in production
```

### Database Management

**Important:** The project uses custom npm scripts that properly load `.env.local`:

```bash
# ✅ ALWAYS use npm scripts
npm run db:push
npm run db:generate
npm run db:studio

# ❌ NEVER use Prisma CLI directly
npx prisma db push    # Will fail: Environment variable not found
```

If you must use Prisma CLI directly:
```bash
set -a && source .env.local && set +a && npx prisma db push
```

📚 **[Prisma Migration Guide →](./PRISMA_MIGRATE.md)**

## 🚀 Deployment

### Deploy to Vercel

The project is configured for seamless Vercel deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Environment Variables on Vercel:**
1. Add all variables from `.env.local` to Vercel project settings
2. Ensure `DATABASE_URL` uses connection pooling (port 6543)
3. Set `DIRECT_URL` for migrations (port 5432)
4. Configure Stripe webhook URL: `https://yourdomain.com/api/stripe/webhook`

**Database Migrations:**
- Migrations are automatically applied during build via `prisma generate`
- Schema changes are tracked in `prisma/migrations/`
- See [PRISMA_MIGRATE.md](./PRISMA_MIGRATE.md) for production migration workflow

📚 **[Production Deployment Guide →](./docs/DEPLOYMENT.md)**

## 🔧 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Test connection
npm run db:studio

# Verify environment variables in .env.local
# Ensure DATABASE_URL uses port 6543 (pooler)
# Ensure DIRECT_URL uses port 5432 (direct)
```

**Build Error: P3005 (Database not empty)**
```bash
# This is expected for existing databases
# The build will succeed if migrations exist
# See PRISMA_MIGRATE.md for details
```

**Authentication Issues**
```bash
# Verify Supabase keys in .env.local
# Check redirect URLs in Supabase dashboard:
# - http://localhost:3000/auth/callback (development)
# - https://yourdomain.com/auth/callback (production)
```

**Stripe Webhook Failures**
```bash
# Verify webhook secret matches Stripe dashboard
# Check webhook URL is publicly accessible
# Test webhook with Stripe CLI:
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**R2 Storage Forbidden (403)**
```bash
# Ensure R2_PUBLIC_BASE_URL is configured
# Verify custom domain is set up in Cloudflare R2
# Check bucket CORS settings allow your domain
```

📚 **[Full Troubleshooting Guide →](./docs/DEPLOYMENT.md#troubleshooting)**

## 📚 Documentation

- [Quick Start Guide](./docs/QUICK_START.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Prisma Migration Guide](./PRISMA_MIGRATE.md)
- [Stripe Production Setup](./docs/STRIPE-PRODUCTION-DEPLOYMENT.md)
- [Analytics Setup](./docs/ANALYTICS_SETUP.md)
- [Feature Design Docs](./docs/)

## 🛠️ Tech Stack Details

### Frontend
- **Next.js 15** - App Router, Server Components, Server Actions
- **React 19** - Latest React with enhanced features
- **TypeScript 5** - Full type safety
- **Tailwind CSS v4** - Utility-first CSS with new CSS-first engine
- **Radix UI** - Unstyled, accessible component primitives
- **Geist Font** - Vercel's font family

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Relational database (Supabase)
- **Supabase Auth** - Authentication and user management

### AI Providers
- **FAL.AI** - Primary image and video generation
- **OpenRouter** - Gemini 2.5 Flash access for image analysis
- **Google AI** - Gemini for video analysis

### Infrastructure
- **Vercel** - Hosting and serverless functions
- **Cloudflare R2** - Object storage (S3-compatible)
- **Stripe** - Payment processing and subscriptions
- **Vercel Analytics** - Performance monitoring

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

- 🌐 **Website**: [nanoart.app](https://www.nanoart.app)
- 📧 **Email**: support@nanoart.app
- 🐦 **Twitter**: [@nanoartApp](https://x.com/nanoartApp)
- 📚 **Documentation**: [./docs/](./docs/)
- 💬 **Issues**: [GitHub Issues](https://github.com/nanoartApp/nanoart/issues)
- 🔨 **v0.app**: [Continue Building](https://v0.app/chat/projects/4KoFBz0X4A3)

---

Built with ❤️ by the NanoArt team | Powered by AI
