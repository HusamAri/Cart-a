// Carta — fixed-position ingredient autocomplete (modal-safe, mobile-friendly)
import { suggestIngredientNames } from './ingredient-suggest.js';

/**
 * @param {HTMLInputElement} inputEl
 * @param {{
 *   getSuggestions?: (query: string) => string[],
 *   emptyMessage?: string,
 *   limit?: number,
 *   pantryNames?: string[],
 *   onPick?: () => void,
 * }} [opts]
 */
export function mountIngredientAutocomplete(inputEl, opts = {}) {
  const limit = opts.limit ?? 10;
  const pantryNames = opts.pantryNames || [];
  const getSuggestions = opts.getSuggestions
    || ((q) => suggestIngredientNames(q, limit, pantryNames));

  let dropdown = null;
  let acOnScrollOrResize = null;
  let activeIndex = -1;
  let picking = false;

  function syncPosition() {
    if (!dropdown) return;
    const r = inputEl.getBoundingClientRect();
    const maxW = Math.min(Math.max(r.width, 200), window.innerWidth - 16);
    dropdown.style.left = `${Math.max(8, Math.min(r.left, window.innerWidth - maxW - 8))}px`;
    dropdown.style.top = `${r.bottom + 4}px`;
    dropdown.style.width = `${maxW}px`;
  }

  function closeAC() {
    if (acOnScrollOrResize) {
      window.removeEventListener('scroll', acOnScrollOrResize, true);
      window.removeEventListener('resize', acOnScrollOrResize);
      acOnScrollOrResize = null;
    }
    if (dropdown) {
      dropdown.remove();
      dropdown = null;
    }
    activeIndex = -1;
  }

  function highlightActive() {
    if (!dropdown) return;
    dropdown.querySelectorAll('.ac-item').forEach((el, i) => {
      el.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false');
    });
  }

  function pickItem(text) {
    inputEl.value = text;
    closeAC();
    opts.onPick?.();
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function showAC(items, emptyMsg) {
    closeAC();
    dropdown = document.createElement('div');
    dropdown.className = 'ac-dropdown';
    dropdown.setAttribute('role', 'listbox');
    if (!items.length) {
      dropdown.innerHTML = `<div class="ac-empty">${escapeHtml(emptyMsg || '')}</div>`;
    } else {
      dropdown.innerHTML = items.map((s, i) =>
        `<div class="ac-item" role="option" data-idx="${i}" tabindex="-1">${escapeHtml(s)}</div>`
      ).join('');
      dropdown.querySelectorAll('.ac-item').forEach((item) => {
        const pick = (e) => {
          e.preventDefault();
          picking = true;
          pickItem(item.textContent);
          picking = false;
        };
        item.addEventListener('mousedown', pick);
        item.addEventListener('touchstart', pick, { passive: false });
      });
    }
    document.body.appendChild(dropdown);
    syncPosition();
    acOnScrollOrResize = () => syncPosition();
    window.addEventListener('scroll', acOnScrollOrResize, true);
    window.addEventListener('resize', acOnScrollOrResize);
  }

  function refresh() {
    const q = inputEl.value.trim();
    if (q.length < 1) {
      closeAC();
      return;
    }
    const items = getSuggestions(q);
    if (!items.length) {
      showAC([], opts.emptyMessage || 'No match');
      return;
    }
    showAC(items);
    activeIndex = 0;
    highlightActive();
  }

  inputEl.addEventListener('input', refresh);
  inputEl.addEventListener('focus', refresh);
  inputEl.addEventListener('blur', () => {
    setTimeout(() => {
      if (!picking) closeAC();
    }, 220);
  });

  inputEl.addEventListener('keydown', (e) => {
    if (!dropdown) return;
    const options = dropdown.querySelectorAll('.ac-item');
    if (!options.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, options.length - 1);
      highlightActive();
      options[activeIndex]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      highlightActive();
      options[activeIndex]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      pickItem(options[activeIndex].textContent);
    } else if (e.key === 'Escape') {
      closeAC();
    }
  });

  return { close: closeAC, refresh };
}

function escapeHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
