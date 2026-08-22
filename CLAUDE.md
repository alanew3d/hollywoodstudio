# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 AI-powered image generation application that uses OpenRouter API (with Google Gemini 2.5 Flash Image Preview model) to generate and transform images. The app provides both text-to-image and image-to-image generation capabilities with Supabase authentication.

## Commands

### Development
```bash
pnpm dev          # Start development server on localhost:3000
pnpm build        # Build production application
pnpm start        # Start production server
pnpm lint         # Run Next.js linting
```

### Package Manager
This project uses **pnpm** as the package manager. Do not use npm or yarn.

## Environment Variables

Required in `.env.local`:
- `OPENROUTER_API_KEY` - OpenRouter API key from https://openrouter.ai/keys
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_APP_URL` - Application URL (optional, defaults to localhost:3000)
- `MAX_IMAGE_SIZE` - Max upload size in bytes (optional, defaults to 5242880 = 5MB)

## Architecture

### Core Image Generation Flow

1. **Client Request** (`/app/generator/page.tsx`)
   - User submits prompt via `ImageEditor` component
   - Supports two modes: text-to-image and image-to-image

2. **API Routes**
   - `/app/api/generate/route.ts` - Text-to-image generation
   - `/app/api/transform/route.ts` - Image-to-image transformation
   - Both routes require Supabase authentication (checked via `getUser()`)

3. **Image Service Layer** (`/lib/api/image-service.ts`)
   - `generateFromText()` - Handles text-to-image generation
   - `generateFromImage()` - Handles image transformations
   - Validates parameters, builds prompts, handles errors
   - Falls back to placeholder images if generation fails

4. **OpenRouter Client** (`/lib/api/openrouter-client.ts`)
   - Wraps OpenAI SDK configured for OpenRouter endpoint
   - Uses `google/gemini-2.5-flash-image-preview` model by default
   - Implements retry logic with exponential backoff for rate limits
   - Comprehensive logging with request IDs for debugging

5. **Image URL Extraction**
   - Handles multiple response formats (Google native API, OpenRouter, traditional OpenAI)
   - Supports base64 data URLs and direct image URLs
   - See `extractImageUrl()` in `image-service.ts:261` for format details

### Authentication Flow

1. **Middleware** (`/middleware.ts`)
   - Protects `/generator` route - requires authentication
   - Redirects unauthenticated users to `/?login=true`
   - Uses Supabase SSR for session management

2. **Auth Components** (`/components/auth/`)
   - `AuthModalTrigger.tsx` - Triggers login modal
   - `LoginModal.tsx` - Email-based authentication UI
   - `UserMenu.tsx` - User session management

3. **Supabase Integration** (`/lib/supabase/`)
   - `client.ts` - Browser client for client components
   - `server.ts` - Server client with `getUser()` helper
   - `middleware.ts` - Session update for route protection

### UI Architecture

- **Component Library**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS v4.1.9 with CSS variables for theming
- **Theme**: `next-themes` for dark/light mode support
- **Icons**: Lucide React
- **Path Aliases**: `@/*` maps to root directory (configured in `tsconfig.json:22`)

### Key Components

- `ImageEditor` (`/components/image-editor.tsx`) - Main editor with split-panel UI (controls left, gallery right)
- `landing-page.tsx` - Marketing page with features, examples, pricing
- `header.tsx` / `footer.tsx` - Shared layout components

### Type Definitions

Located in `/lib/types/image.ts`:
- `GenerationParams` - Text-to-image parameters
- `TransformImageParams` - Image-to-image parameters
- `GeneratedImage` - Result image metadata
- `APIResponse<T>` - Standardized API response format
- `APIError` - Custom error class with error codes

## Important Notes

### Build Configuration
- TypeScript and ESLint errors are ignored during builds (`next.config.mjs:4-7`)
- Images are unoptimized (`next.config.mjs:10`)
- This is intentional for v0.app deployment workflow

### Image Generation Debugging
- All image generation requests have unique IDs logged with 🚀 emoji
- Check server logs for detailed request/response payloads
- Response parsing handles 4 different format types (see `extractImageUrl()`)

### Error Handling
- API routes return standardized `APIResponse` format
- Client shows user-friendly error messages (Chinese + English)
- Rate limit errors suggest 1-2 minute wait time
- 401 errors redirect to login modal

### File Upload Constraints
- Max file size: 5MB (configurable via `MAX_IMAGE_SIZE`)
- Allowed types: JPEG, PNG, WebP
- Validation in `/app/api/transform/route.ts:64-91`

## Development Tips

When adding new image generation features:
1. Update type definitions in `/lib/types/image.ts`
2. Add service methods in `ImageService` class
3. Create/update API routes with auth checks
4. Handle errors using `APIError` class with appropriate error codes
5. Test both authenticated and unauthenticated states
