// Carta — Authentication (magic link + password)
import { supabase, getSessionAfterUrlAuth } from './supabase-client.js';
import { PUBLIC_APP_ORIGIN } from './config.js';

/** Magic-link e-mails must always land on production, never localhost or preview URLs. */
const APP_HOME = `${PUBLIC_APP_ORIGIN}/app/`;

/**
 * Magic link landing URL. Include ?invite= when present so the token survives
 * email clients that open the link in a fresh context (no prior localStorage).
 * Add matching redirect URLs in Supabase Auth (e.g. https://cart-a.live/app/).
 */
export function buildMagicLinkRedirectUrl(inviteToken = '') {
  const t = (inviteToken || '').trim();
  if (!t) return APP_HOME;
  return `${APP_HOME}?invite=${encodeURIComponent(t)}`;
}

export async function signInWithPassword(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }
  if (!password || password.length < 6) {
    return { ok: false, error: 'Password is required (min. 6 characters).' };
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, session: data.session, email: cleanEmail };
}

export async function sendMagicLink(email, opts = {}) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }
  const emailRedirectTo = buildMagicLinkRedirectUrl(opts.inviteToken);
  const { error } = await supabase.auth.signInWithOtp({
    email: cleanEmail,
    options: {
      emailRedirectTo,
      shouldCreateUser: opts.allowSignup !== false,
      data: opts.metadata || {},
    },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, email: cleanEmail };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('signOut error:', error);
  // Clear any local workspace cache
  try { localStorage.removeItem('carta_active_workspace_id'); } catch(e) {}
  window.location.href = '/';
}

export async function requireAuth() {
  const session = await getSessionAfterUrlAuth();
  if (!session) {
    window.location.href = '/app/login.html';
    return null;
  }
  return session;
}
