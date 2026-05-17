// Carta — Supabase client singleton
// Loaded via ESM from supabase-js v2 CDN.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

function urlLooksLikeAuthCallback() {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has('code')) return true;
    const h = url.hash || '';
    return /access_token|refresh_token|provider_token/i.test(h);
  } catch {
    return false;
  }
}

function urlHasAuthError() {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get('error') || url.searchParams.get('error_description')) return true;
    const qs = new URLSearchParams((url.hash || '').replace(/^#/, ''));
    if (qs.get('error') || qs.get('error_code')) return true;
  } catch {
    // ignore
  }
  return false;
}

/**
 * Magic link / OAuth redirects to redirect_to with ?code= or #access_token=...
 * Supabase restores the session asynchronously; an immediate getSession() often
 * returns null and the app wrongly sends people back to the login screen.
 */
export async function getSessionAfterUrlAuth(options = {}) {
  const maxWaitMs = options.maxWaitMs ?? 15000;
  const pollMs = options.pollMs ?? 100;
  const shouldPoll = urlLooksLikeAuthCallback() && !urlHasAuthError();

  if (shouldPoll) {
    const deadline = Date.now() + maxWaitMs;
    while (Date.now() < deadline) {
      const session = await getSession();
      if (session) return session;
      await new Promise((r) => setTimeout(r, pollMs));
    }
  }
  return getSession();
}

// Helper: get current user + workspace context
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) console.warn('getSession error:', error);
  return data.session;
}

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// Listen for auth state changes
export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => callback(event, session));
}
