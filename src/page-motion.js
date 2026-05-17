// Carta — global motion: cross-document view transitions, UI ready state, a11y.
// Loaded on marketing/auth pages and pulled in by studio-layout for studio routes.

function initReducedMotion() {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('motion-reduce');
    }
  } catch { /* ignore */ }
}

function markUiReady() {
  document.documentElement.classList.add('carta-ui-ready');
}

/**
 * Same-origin navigations: use View Transitions when supported (e.g. Chrome 126+).
 */
function wireViewTransitionNav() {
  if (typeof document.startViewTransition !== 'function') return;

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const a = e.target.closest('a[href]');
    if (!a) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;

    const raw = a.getAttribute('href');
    if (!raw || raw.startsWith('#')) return;
    if (raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('javascript:')) return;

    let url;
    try {
      url = new URL(a.href, window.location.href);
    } catch {
      return;
    }
    if (url.origin !== window.location.origin) return;
    if (url.pathname === window.location.pathname && url.search === window.location.search) return;

    e.preventDefault();
    document.startViewTransition(() => {
      window.location.assign(url.href);
    });
  }, true);
}

function boot() {
  initReducedMotion();
  markUiReady();
  wireViewTransitionNav();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
