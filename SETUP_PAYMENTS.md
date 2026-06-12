# SETUP_PAYMENTS.md — Hollywood Studio AI

Guide for configuring Supabase + Stripe payments in production.

## 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) → your project → **SQL Editor**
2. Paste the contents of `SUPABASE_SCHEMA.sql` and run it
3. Go to **Authentication → Providers** and enable:
   - Email/Password
   - Google (add your Google Client ID and Secret)
4. Go to **Project Settings → API** and copy:
   - Project URL → `SUPABASE_URL`
   - `anon` public key → `SUPABASE_ANON_KEY` (for frontend)
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY` (backend only — never expose)

## 2. Stripe Setup

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Create two products:
   - **Hollywood Studio PRO** → one-time price → copy Price ID → `STRIPE_PRICE_PRO`
   - **Hollywood Studio ULTRA** → one-time price → copy Price ID → `STRIPE_PRICE_ULTRA`
3. Go to **Developers → API Keys** → copy **Secret key** → `STRIPE_SECRET_KEY`
4. Go to **Developers → Webhooks** → **Add endpoint**:
   - URL: `https://hollywoodstudio.ai/api/stripe-webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
   - After saving, reveal **Signing secret** → `STRIPE_WEBHOOK_SECRET`

## 3. Vercel Environment Variables

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables** and add:

| Variable | Value | Where |
|---|---|---|
| `SUPABASE_URL` | `https://xxxx.supabase.co` | Backend + Frontend |
| `SUPABASE_ANON_KEY` | `eyJ...` (anon key) | Frontend (safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (service role) | **Backend only** |
| `STRIPE_SECRET_KEY` | `sk_live_...` | **Backend only** |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | **Backend only** |
| `STRIPE_PRICE_PRO` | `price_...` | Backend |
| `STRIPE_PRICE_ULTRA` | `price_...` | Backend |
| `SITE_URL` | `https://hollywoodstudio.ai` | Backend |

⚠️ **NEVER put `STRIPE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in `config.js`** — these are backend-only.

## 4. Testing Locally

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe listen --forward-to localhost:3000/api/stripe-webhook`
3. Copy the webhook secret it gives you → use as `STRIPE_WEBHOOK_SECRET` locally
4. Use Stripe test card: `4242 4242 4242 4242`, any future date, any CVC

## 5. Testing in Production

1. Visit `https://hollywoodstudio.ai/#plans`
2. Click a plan button → should redirect to Stripe Checkout
3. Complete payment with test card
4. Check Supabase `profiles` table — `credits` column should be updated
5. Check Supabase `credit_transactions` table — should have a new row

## 6. Credits Logic

| Plan | Credits Added |
|---|---|
| PRO | 500 |
| ULTRA | 2000 |
| Trial (new user) | 3 |

Credits are stored in `profiles.credits` and logged in `credit_transactions`.
