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

function validateEmailPassword(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }
  if (!password || password.length < 6) {
    return { ok: false, error: 'Password is required (min. 6 characters).' };
  }
  return { ok: true, email: cleanEmail };
}

export async function signInWithPassword(email, password) {
  const v = validateEmailPassword(email, password);
  if (!v.ok) return v;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: v.email,
    password,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, session: data.session, email: v.email };
}

/** Email + password signup. Returns a session when email confirmation is disabled. */
export async function signUpWithPassword(email, password) {
  const v = validateEmailPassword(email, password);
  if (!v.ok) return v;
  const { data, error } = await supabase.auth.signUp({
    email: v.email,
    password,
    options: { emailRedirectTo: APP_HOME },
  });
  if (error) return { ok: false, error: error.message };
  if (data.session) return { ok: true, session: data.session, email: v.email };
  if (data.user) return { ok: true, email: v.email, needsConfirmation: true };
  return { ok: false, error: 'Sign up failed. Please try again.' };
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
