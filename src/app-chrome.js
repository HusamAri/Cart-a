// Carta — shared floating chrome (marketing + studio): back-to-top + keyboard help
import { t, applyTranslations } from './i18n.js';

const REDUCE_MOTION = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** @returns {HTMLElement | null} */
export function mountFloatingBackToTop(opts = {}) {
  if (typeof document === 'undefined') return null;
  const scrollRoot = opts.scrollRoot;
  const useWindow = !scrollRoot;
  /** @returns {number} */
  const scrollTop = () => (useWindow ? window.scrollY : scrollRoot.scrollTop);

  let btn = document.getElementById('cartaBackToTop');
  if (btn) return btn;

  btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'cartaBackToTop';
  btn.className = 'carta-fab carta-fab--top';
  btn.setAttribute('data-i18n-aria-label', 'ui.back_to_top');
  btn.setAttribute('aria-label', t('ui.back_to_top'));
  btn.hidden = true;
  btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m5 14 7-7 7 7M12 21V7"/></svg>';
  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    if (useWindow) {
      try {
        window.scrollTo({ top: 0, behavior: REDUCE_MOTION ? 'auto' : 'smooth' });
      } catch (_) {
        window.scrollTo(0, 0);
      }
    } else {
      try {
        scrollRoot.scrollTo({ top: 0, behavior: REDUCE_MOTION ? 'auto' : 'smooth' });
      } catch (_) {
        scrollRoot.scrollTop = 0;
      }
    }
    document.querySelector('.skip-link')?.focus?.({ preventScroll: true });
  });

  const syncVisibility = () => {
    btn.hidden = scrollTop() < 360;
    if (!btn.hidden) btn.setAttribute('tabindex', '0');
    else btn.setAttribute('tabindex', '-1');
  };

  syncVisibility();
  const scrollListenTarget = useWindow ? window : scrollRoot;
  scrollListenTarget.addEventListener('scroll', syncVisibility, { passive: true });
  window.addEventListener('resize', syncVisibility, { passive: true });

  return btn;
}

function isTypingTarget(el) {
  if (!el || !el.tagName) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
  if (el.isContentEditable) return true;
  return !!el.closest?.('[contenteditable="true"]');
}

/** @type {HTMLElement | null} */
let shortcutsModalMounted = null;
/** @type {Array<{ keyHtml: string, labelKey: string }>} */
let shortcutsItems = [];

function closeShortcutsModal() {
  if (!shortcutsModalMounted) return;
  shortcutsModalMounted.remove();
  shortcutsModalMounted = null;
}

function openShortcutsModal() {
  if (shortcutsModalMounted || shortcutsItems.length === 0) return;
  const items = shortcutsItems;
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-labelledby', 'cartaShortcutsTitle');
  shortcutsModalMounted = backdrop;

  backdrop.innerHTML = `
      <div class="modal modal--narrow-help">
        <header class="modal__head">
          <h2 class="h3" style="margin:0" id="cartaShortcutsTitle" data-i18n="ui.shortcuts.title">Shortcuts</h2>
          <button type="button" class="modal__close cartaShortcutsClose" aria-label="">
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m6 6 12 12M18 6 6 18"/></svg>
          </button>
        </header>
        <div class="modal__body">
          <ul class="carta-shortcuts__list">
            ${items.map(it => `
              <li class="carta-shortcuts__row">
                <kbd class="carta-shortcuts__key">${it.keyHtml}</kbd>
                <span data-i18n="${escapeAttr(it.labelKey)}">${escapeHTML(t(it.labelKey))}</span>
              </li>`).join('')}
          </ul>
        </div>
        <footer class="modal__foot">
          <span class="caption" data-i18n="ui.shortcuts.footer">${escapeHTML(t('ui.shortcuts.footer'))}</span>
          <div class="modal__foot__right">
            <button type="button" class="btn btn-primary btn-sm cartaShortcutsOk" data-i18n="ui.shortcuts.done">${escapeHTML(t('ui.shortcuts.done'))}</button>
          </div>
        </footer>
      </div>`;
  document.body.appendChild(backdrop);
  const closeAria = t('ui.shortcuts.close_aria');
  backdrop.querySelector('.modal__close')?.setAttribute('aria-label', closeAria);
  applyTranslations();

  function done() {
    closeShortcutsModal();
  }
  backdrop.querySelector('.cartaShortcutsClose')?.addEventListener('click', done);
  backdrop.querySelector('.cartaShortcutsOk')?.addEventListener('click', done);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) done(); });
  backdrop.querySelector('.cartaShortcutsOk')?.focus?.();
}

let globalShortcutListenerInstalled = false;
function bindGlobalShortcutsOnce() {
  if (globalShortcutListenerInstalled || typeof document === 'undefined') return;
  globalShortcutListenerInstalled = true;
  document.addEventListener(
    'keydown',
    e => {
      if (shortcutsModalMounted && e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeShortcutsModal();
        return;
      }
      if (e.defaultPrevented) return;
      if (isTypingTarget(document.activeElement)) return;
      const helpPress = e.key === '?' || (e.shiftKey && (e.code === 'Slash' || e.key === '/'));
      if (!helpPress) return;
      if (shortcutsItems.length === 0) return;
      e.preventDefault();
      if (shortcutsModalMounted) closeShortcutsModal();
      else openShortcutsModal();
    },
    true
  );
}

/**
 * @param {Array<{ keyHtml: string, labelKey: string }>} items
 */
export function mountShortcutsHelp(items) {
  shortcutsItems = items || [];
  bindGlobalShortcutsOnce();
  return { open: openShortcutsModal, close: closeShortcutsModal };
}

function escapeHTML(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(s) {
  return escapeHTML(s).replace(/'/g, '&#39;');
}
