// Carta — global motion (Emil Kowalski design-engineering principles)
// View transitions, scroll reveal, hero depth, reduced-motion, a11y skip link.

import { initSkipLink } from './skip-link.js';

const REVEAL_SELECTOR = '.carta-reveal, [data-carta-reveal]';
const REVEAL_ROOT_MARGIN = '0px 0px -8% 0px';
const REVEAL_THRESHOLD = 0.12;

function prefersReducedMotion() {
  try {
    return (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || document.documentElement.classList.contains('motion-reduce')
    );
  } catch {
    return false;
  }
}

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

function revealElement(el) {
  if (!el || el.classList.contains('is-visible')) return;
  el.classList.add('is-visible');
  el.removeAttribute('data-carta-reveal-pending');
}

function primeRevealElements(root = document) {
  root.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
    if (prefersReducedMotion()) {
      revealElement(el);
      return;
    }
    if (!el.classList.contains('is-visible')) {
      el.setAttribute('data-carta-reveal-pending', '');
    }
  });
}

function initScrollReveal() {
  if (prefersReducedMotion()) {
    primeRevealElements();
    return null;
  }

  primeRevealElements();

  if (typeof IntersectionObserver !== 'function') {
    document.querySelectorAll(REVEAL_SELECTOR).forEach(revealElement);
    return null;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        revealElement(entry.target);
        io.unobserve(entry.target);
      }
    },
    { rootMargin: REVEAL_ROOT_MARGIN, threshold: REVEAL_THRESHOLD },
  );

  const observe = (root = document) => {
    root.querySelectorAll(`${REVEAL_SELECTOR}[data-carta-reveal-pending]`).forEach((el) => {
      io.observe(el);
    });
  };

  observe();

  return { io, observe };
}

function watchRevealContainers(revealApi) {
  if (!revealApi?.observe) return;

  const targets = ['#orgList', '#screen-list', 'main'];
  const mo = new MutationObserver((mutations) => {
    let touched = false;
    for (const m of mutations) {
      if (m.addedNodes?.length) {
        touched = true;
        break;
      }
    }
    if (!touched) return;
    primeRevealElements(document);
    revealApi.observe(document);
  });

  for (const sel of targets) {
    const node = document.querySelector(sel);
    if (node) mo.observe(node, { childList: true, subtree: true });
  }
}

function initSiteHeaderDepth() {
  const header = document.getElementById('siteHeader');
  if (!header || header.dataset.cartaScrollBound === '1') return;
  header.dataset.cartaScrollBound = '1';
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initHeroDepth() {
  if (prefersReducedMotion()) return;
  const hero = document.querySelector('.hero');
  const img = document.querySelector('.hero__photo-wrap img');
  const figure = document.querySelector('.hero__figure');
  if (!hero || !img) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    const rect = hero.getBoundingClientRect();
    const viewH = window.innerHeight || 1;
    const visible = rect.bottom > 0 && rect.top < viewH;
    if (!visible) return;
    const center = rect.top + rect.height * 0.42;
    const t = Math.min(1, Math.max(0, 1 - center / (viewH * 0.92)));
    const y = (t - 0.5) * 18;
    const scale = 1.02 + t * 0.025;
    img.style.transform = `scale(${scale.toFixed(4)}) translate3d(0, ${y.toFixed(2)}px, 0)`;
    if (figure) {
      figure.style.setProperty('--hero-depth', String((t * 0.35).toFixed(3)));
    }
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

/**
 * Same-origin navigations: View Transitions when supported (Chrome 126+).
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
  initSkipLink();
  initSiteHeaderDepth();
  const revealApi = initScrollReveal();
  watchRevealContainers(revealApi);
  document.addEventListener('carta-reveal-refresh', () => {
    primeRevealElements(document);
    revealApi?.observe?.(document);
  });
  initHeroDepth();
  wireViewTransitionNav();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
