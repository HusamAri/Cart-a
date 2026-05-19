// Ingredient detail modal: default allergens + sub-brands (alt marka).

import { ALLERGEN_LABELS, ingredientLabel } from './nutrient-db.js';
import {
  saveAllergenOverride,
  clearAllergenOverride,
  saveIngredientBrand,
  deleteIngredientBrand,
  ALLERGEN_IDS,
} from './ingredient-registry.js';

function allergenChecksHtml(selected, cl, chkClass) {
  return ALLERGEN_IDS.map((id) => {
    const on = selected.includes(id);
    const lab = ALLERGEN_LABELS[id]?.[cl] || id;
    return `<label class="chk"><input type="checkbox" class="${chkClass}" value="${id.replace(/"/g, '&quot;')}" ${on ? 'checked' : ''}> ${lab}</label>`;
  }).join('');
}

/**
 * @param {object} ctx
 * @param {string} canonicalKey
 * @param {object} baseRow
 * @param {() => Promise<void>} onSaved
 */
export function openIngredientDetailModal(ctx, canonicalKey, baseRow, onSaved) {
  const {
    supabase, wsId, t, getLang, escapeHTML, cartaIcon, formatNumber, rowKcal,
    ingredientRegistry, applyTranslations,
  } = ctx;
  const cl = getLang();
  const defaultResolved = ingredientRegistry?.resolve(canonicalKey) || baseRow;
  const defaultAllergens = defaultResolved?.allergens?.length
    ? [...defaultResolved.allergens]
    : [...(baseRow.allergens || [])];
  const brands = ingredientRegistry?.listBrands?.(canonicalKey) || [];

  const wrap = document.createElement('div');
  wrap.className = 'modal-backdrop allergen-modal';
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');

  const brandRows = brands.length
    ? brands.map((b) => {
      const br = ingredientRegistry.resolve(canonicalKey, { brand: b.brand_name });
      const al = (br?.allergens || []).map((x) => ALLERGEN_LABELS[x]?.[cl] || x).join(', ') || '—';
      const kcal = rowKcal(br || baseRow);
      return `<tr>
        <td><strong>${escapeHTML(b.brand_name)}</strong></td>
        <td class="col-num">${formatNumber(kcal, 0)}</td>
        <td>${escapeHTML(al)}</td>
        <td class="btn-row-inline">
          <button type="button" class="btn btn-sm btn-ghost brand-edit" data-brand="${escapeHTML(b.brand_name)}">${escapeHTML(t('ingdb.brand_edit'))}</button>
          <button type="button" class="btn btn-sm btn-ghost brand-rm" data-brand="${escapeHTML(b.brand_name)}">×</button>
        </td>
      </tr>`;
    }).join('')
    : `<tr><td colspan="4" class="text-muted">${escapeHTML(t('ingdb.brand_empty'))}</td></tr>`;

  wrap.innerHTML = `
    <div class="modal" style="max-width:640px;max-height:90vh;overflow:auto">
      <header class="modal__head">
        <h2 class="h2">${escapeHTML(ingredientLabel(canonicalKey, cl))}</h2>
        <button type="button" class="modal__close" id="alClose">${cartaIcon('close', { size: 24 })}</button>
      </header>
      <p class="text-muted modal-intro">${escapeHTML(t('ingdb.brand_modal_intro'))}</p>
      <h3 class="modal-sub">${escapeHTML(t('ingdb.brand_default_allergens'))}</h3>
      <div class="check-grid">${allergenChecksHtml(defaultAllergens, cl, 'def-al-chk')}</div>
      <footer class="modal__foot split">
        <button type="button" class="btn btn-ghost" id="alReset">${escapeHTML(t('ingdb.allergen_reset'))}</button>
        <button type="button" class="btn btn-primary" id="alSave">${escapeHTML(t('ingdb.allergen_save'))}</button>
      </footer>
      <h3 class="modal-sub">${escapeHTML(t('ingdb.brand_section'))}</h3>
      <div class="mini-table-wrap modal-table">
        <table>
          <thead><tr>
            <th>${escapeHTML(t('ingdb.brand_name'))}</th>
            <th class="col-num">${escapeHTML(t('ingdb.col_kcal'))}</th>
            <th>${escapeHTML(t('ingdb.col_allergens'))}</th>
            <th></th>
          </tr></thead>
          <tbody>${brandRows}</tbody>
        </table>
      </div>
      <form id="brandAddForm" class="brand-add-form">
        <div class="form-cell"><label>${escapeHTML(t('ingdb.brand_name'))}</label><input class="input" id="newBrandName" required></div>
        <div class="form-cell"><label>P</label><input class="input" id="newBrandP" type="number" step="0.1" placeholder="—"></div>
        <div class="form-cell"><label>F</label><input class="input" id="newBrandF" type="number" step="0.1"></div>
        <div class="form-cell"><label>C</label><input class="input" id="newBrandC" type="number" step="0.1"></div>
        <div class="form-cell"><button type="submit" class="btn btn-primary">${escapeHTML(t('ingdb.brand_add'))}</button></div>
      </form>
      <p class="text-muted modal-hint">${escapeHTML(t('ingdb.brand_macros_hint'))}</p>
      <div id="brandEditPanel" hidden></div>
    </div>`;

  document.body.appendChild(wrap);
  applyTranslations?.();

  const close = () => wrap.remove();
  wrap.querySelector('#alClose').addEventListener('click', close);
  wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });

  wrap.querySelector('#alSave').addEventListener('click', async () => {
    const picked = [...wrap.querySelectorAll('.def-al-chk:checked')].map((el) => el.value);
    const { error } = await saveAllergenOverride(supabase, wsId, canonicalKey, picked);
    if (error) { alert(error.message); return; }
    await onSaved();
    close();
  });

  wrap.querySelector('#alReset').addEventListener('click', async () => {
    const { error } = await clearAllergenOverride(supabase, wsId, canonicalKey);
    if (error) { alert(error.message); return; }
    await onSaved();
    close();
  });

  function openBrandEditor(brandName) {
    const b = brands.find((x) => x.brand_name === brandName);
    const br = ingredientRegistry?.resolve(canonicalKey, { brand: brandName });
    const panel = wrap.querySelector('#brandEditPanel');
    const selected = br?.allergens?.length ? [...br.allergens] : [];
    const d = b?.data || {};
    panel.hidden = false;
    panel.innerHTML = `
      <h4 class="brand-edit-title">${escapeHTML(brandName)}</h4>
      <div class="brand-macro-form">
        <div class="form-cell"><label>P</label><input class="input" id="editBrandP" type="number" step="0.1" value="${d.P != null ? d.P : ''}"></div>
        <div class="form-cell"><label>F</label><input class="input" id="editBrandF" type="number" step="0.1" value="${d.F != null ? d.F : ''}"></div>
        <div class="form-cell"><label>C</label><input class="input" id="editBrandC" type="number" step="0.1" value="${d.C != null ? d.C : ''}"></div>
        <div class="form-cell"><label>Fi</label><input class="input" id="editBrandFi" type="number" step="0.1" value="${d.Fi != null ? d.Fi : ''}"></div>
      </div>
      <div class="check-grid">${allergenChecksHtml(selected, cl, 'brand-al-chk')}</div>
      <button type="button" class="btn btn-primary btn-sm" id="brandEditSave">${escapeHTML(t('ingdb.brand_save'))}</button>`;
    panel.querySelector('#brandEditSave').addEventListener('click', async () => {
      const parseOpt = (sel) => {
        const v = panel.querySelector(sel)?.value;
        return v === '' || v == null ? undefined : Number(v);
      };
      const picked = [...panel.querySelectorAll('.brand-al-chk:checked')].map((el) => el.value);
      const { error } = await saveIngredientBrand(supabase, wsId, canonicalKey, {
        brand_name: brandName,
        P: parseOpt('#editBrandP'),
        F: parseOpt('#editBrandF'),
        C: parseOpt('#editBrandC'),
        Fi: parseOpt('#editBrandFi'),
        allergens: picked,
      });
      if (error) { alert(error.message); return; }
      await onSaved();
      close();
    });
  }

  wrap.querySelectorAll('.brand-edit').forEach((btn) => {
    btn.addEventListener('click', () => openBrandEditor(btn.getAttribute('data-brand')));
  });
  wrap.querySelectorAll('.brand-rm').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm(t('ingdb.brand_remove_confirm'))) return;
      const { error } = await deleteIngredientBrand(supabase, wsId, canonicalKey, btn.getAttribute('data-brand'));
      if (error) { alert(error.message); return; }
      await onSaved();
      close();
    });
  });

  wrap.querySelector('#brandAddForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const brand_name = wrap.querySelector('#newBrandName').value.trim();
    if (!brand_name) return;
    const parseOpt = (sel) => {
      const v = wrap.querySelector(sel)?.value;
      return v === '' ? undefined : Number(v);
    };
    const { error } = await saveIngredientBrand(supabase, wsId, canonicalKey, {
      brand_name,
      P: parseOpt('#newBrandP'),
      F: parseOpt('#newBrandF'),
      C: parseOpt('#newBrandC'),
      allergens: [],
    });
    if (error) { alert(error.message); return; }
    await onSaved();
    close();
  });
}
