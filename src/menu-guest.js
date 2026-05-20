// Carta — guest-facing menu URLs and Supabase RPC loader.

import { getPublicAppOrigin } from './config.js';

/**
 * @param {string} token
 * @param {{ lang?: string }} [opts] — optional guest UI language (en, tr, es)
 */
export function guestMenuUrl(token, opts = {}) {
  const t = String(token || '').trim();
  const base = getPublicAppOrigin();
  const url = new URL(`${base}/app/m/index.html`);
  url.searchParams.set('t', t);
  const lang = String(opts.lang || '').toLowerCase();
  if (['en', 'tr', 'es'].includes(lang)) url.searchParams.set('lang', lang);
  return url.toString();
}

/** 48-char hex token for menu_clusters.guest_token */
export function newGuestToken() {
  const buf = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} token
 */
export async function fetchGuestMenu(supabase, token) {
  const cleanToken = String(token || '').trim();
  if (!cleanToken) throw new Error('Guest menu token is required');
  const { data, error } = await supabase.rpc('get_guest_menu', { p_token: cleanToken });
  if (error) throw error;
  return data;
}
