// Carta — workspace logo upload (Supabase Storage: workspace-logos).

const BUCKET = 'workspace-logos';
const MAX_BYTES = 512 * 1024;
const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp']);

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} workspaceId
 * @param {File} file
 */
export async function uploadWorkspaceLogo(supabase, workspaceId, file) {
  if (!file || !ALLOWED.has(file.type)) {
    return { ok: false, error: 'invalid_type' };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: 'too_large' };
  }
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${workspaceId}/logo.${ext}`;
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
    cacheControl: '3600',
  });
  if (upErr) return { ok: false, error: upErr.message };

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const logoUrl = pub?.publicUrl ? `${pub.publicUrl}?v=${Date.now()}` : null;
  if (!logoUrl) return { ok: false, error: 'url_failed' };

  const { error: dbErr } = await supabase
    .from('workspaces')
    .update({ logo_url: logoUrl })
    .eq('id', workspaceId);
  if (dbErr) return { ok: false, error: dbErr.message };

  return { ok: true, logoUrl };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} workspaceId
 */
export async function clearWorkspaceLogo(supabase, workspaceId) {
  const { error } = await supabase
    .from('workspaces')
    .update({ logo_url: null })
    .eq('id', workspaceId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
