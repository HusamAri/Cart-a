// Carta — Authentication (magic link + password)
import { supabase } from './supabase-client.js';

const REDIRECT_TO = window.location.origin + '/app/';

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
  const { error } = await supabase.auth.signInWithOtp({
    email: cleanEmail,
    options: {
      emailRedirectTo: REDIRECT_TO,
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
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    window.location.href = '/app/login.html';
    return null;
  }
  return data.session;
}
