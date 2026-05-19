// Carta — workspace logo upload (Supabase Storage + logo_url fallback).

import { supabase } from './supabase-client.js';

const BUCKET = 'workspace-logos';
const MAX_BYTES = 512 * 1024;
const DATA_URL_MAX = 280 * 1024;
const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp']);

function inferMime(file) {
  const t = String(file?.type || '').toLowerCase().split(';')[0].trim();
  if (ALLOWED.has(t)) return t;
  const n = String(file?.name || '').toLowerCase();
  if (n.endsWith('.png')) return 'image/png';
  if (n.endsWith('.webp')) return 'image/webp';
  if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'image/jpeg';
  return '';
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(typeof r.result === 'string' ? r.result : '');
    r.onerror = () => reject(new Error('read_failed'));
    r.readAsDataURL(file);
  });
}

async function saveLogoUrl(supabaseClient, workspaceId, logoUrl) {
  const { error } = await supabaseClient
    .from('workspaces')
    .update({ logo_url: logoUrl })
    .eq('id', workspaceId);
  if (error) {
    if (/logo_url|column/i.test(error.message)) {
      return { ok: false, error: 'schema_missing', detail: error.message };
    }
    return { ok: false, error: 'db_update', detail: error.message };
  }
  return { ok: true, logoUrl };
}

async function removeOtherLogoObjects(supabaseClient, workspaceId, keepPath) {
  const paths = ['png', 'jpg', 'webp'].map((ext) => `${workspaceId}/logo.${ext}`).filter((p) => p !== keepPath);
  await supabaseClient.storage.from(BUCKET).remove(paths);
}

async function uploadToStorage(supabaseClient, workspaceId, file, mime) {
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
  const path = `${workspaceId}/logo.${ext}`;
  await removeOtherLogoObjects(supabaseClient, workspaceId, path);

  const { error: upErr } = await supabaseClient.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: mime,
    cacheControl: '3600',
  });
  if (upErr) return { ok: false, error: upErr.message };

  const { data: pub } = supabaseClient.storage.from(BUCKET).getPublicUrl(path);
  const logoUrl = pub?.publicUrl ? `${pub.publicUrl}?v=${Date.now()}` : null;
  if (!logoUrl) return { ok: false, error: 'url_failed' };
  return { ok: true, logoUrl };
}

function storageFallbackAllowed(message) {
  const m = String(message || '').toLowerCase();
  return (
    m.includes('bucket not found')
    || m.includes('not found')
    || m.includes('row-level security')
    || m.includes('permission')
    || m.includes('policy')
    || m.includes('invalid')
  );
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} [client]
 * @param {string} workspaceId
 * @param {File} file
 */
export async function uploadWorkspaceLogo(client, workspaceId, file) {
  const supabaseClient = client || supabase;
  const mime = inferMime(file);
  if (!mime) return { ok: false, error: 'invalid_type' };
  if (file.size > MAX_BYTES) return { ok: false, error: 'too_large' };

  const storage = await uploadToStorage(supabaseClient, workspaceId, file, mime);
  if (storage.ok) {
    return saveLogoUrl(supabaseClient, workspaceId, storage.logoUrl);
  }

  if (file.size <= DATA_URL_MAX && storageFallbackAllowed(storage.error)) {
    try {
      const dataUrl = await fileToDataUrl(file);
      if (dataUrl.startsWith('data:image/')) {
        return saveLogoUrl(supabaseClient, workspaceId, dataUrl);
      }
    } catch {
      /* fall through */
    }
  }

  return { ok: false, error: 'storage_failed', detail: storage.error };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} [client]
 * @param {string} workspaceId
 */
export async function clearWorkspaceLogo(client, workspaceId) {
  const supabaseClient = client || supabase;
  const paths = ['png', 'jpg', 'webp'].map((ext) => `${workspaceId}/logo.${ext}`);
  await supabaseClient.storage.from(BUCKET).remove(paths);
  const { error } = await supabaseClient
    .from('workspaces')
    .update({ logo_url: null })
    .eq('id', workspaceId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * @param {string} workspaceId
 */
export async function fetchWorkspaceLogoUrl(workspaceId) {
  const { data, error } = await supabase
    .from('workspaces')
    .select('logo_url')
    .eq('id', workspaceId)
    .maybeSingle();
  if (error) return { ok: false, error: error.message, logoUrl: null };
  return { ok: true, logoUrl: data?.logo_url || null };
}
