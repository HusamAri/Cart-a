// Carta — public configuration. Safe to expose.
export const SUPABASE_URL = 'https://hfjgthwaucrfhwkrehxw.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_9SZRw1o6_gAfZq2v7gl33A_SWpdtBKr';
export const APP_NAME = 'Carta';
export const APP_TAGLINE = 'F&B Operations Studio';
export const APP_VERSION = '0.1.0';

/** Canonical HTTPS origin (no trailing slash). Used in auth e-mails and invite links. */
export const PUBLIC_APP_ORIGIN = 'https://cart-a.live';

/**
 * Origin for Supabase auth redirect_to and workspace invite_base_url.
 * When you open the app from localhost, e-mail links still point here so recipients are not sent to loopback.
 * Deployed apps use the current origin (preview URL on Vercel, or this domain in production).
 */
export function getPublicAppOrigin() {
  if (typeof window === 'undefined') return PUBLIC_APP_ORIGIN;
  const h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1') {
    return PUBLIC_APP_ORIGIN;
  }
  return window.location.origin.replace(/\/$/, '');
}
