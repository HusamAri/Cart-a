// Carta — guest-facing menu URLs and Supabase RPC loader.

import { getPublicAppOrigin } from './config.js';

/** @param {string} token */
export function guestMenuUrl(token) {
  const t = String(token || '').trim();
  const base = getPublicAppOrigin();
  return `${base}/m?t=${encodeURIComponent(t)}`;
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
  const { data, error } = await supabase.rpc('get_guest_menu', { p_token: token });
  if (error) throw error;
  return data;
}
