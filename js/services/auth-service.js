/**
 * HOLLYWOOD STUDIO AI — services/auth-service.js
 * Authentication: Google OAuth, email/password, admin login.
 *
 * Functions: signInWithGoogle(), signInWithEmail(), signOut(), finishAuth()
 * Uses Supabase Auth. Admin check: pass === CFG.ADMIN_PASS && email === CFG.ADMIN_EMAIL
 *
 * IMPORTANT: Do NOT change auth behavior during migration. Copy carefully.
 * Currently: auth functions in index.html.
 */
