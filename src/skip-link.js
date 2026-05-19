// Carta — "Skip to main content" (WCAG bypass block)
// Studio routes scroll inside <main class="studio-page">, so native #main hash often does nothing visible.

export function initSkipLink() {
  const skip = document.querySelector('a.skip-link[href="#main"]');
  const main = document.getElementById('main');
  if (!skip || !main) return;
  if (skip.dataset.skipWired === '1') return;
  skip.dataset.skipWired = '1';

  if (!main.hasAttribute('tabindex')) {
    main.setAttribute('tabindex', '-1');
  }

  skip.addEventListener('click', (e) => {
    e.preventDefault();
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const behavior = reduce ? 'auto' : 'smooth';

    const scrollableMain = main.classList.contains('studio-page')
      || (main.scrollHeight > main.clientHeight && getComputedStyle(main).overflowY !== 'visible');

    if (scrollableMain) {
      try {
        main.scrollTo({ top: 0, behavior });
      } catch {
        main.scrollTop = 0;
      }
    } else {
      try {
        main.scrollIntoView({ block: 'start', behavior });
      } catch {
        main.scrollIntoView(true);
      }
    }

    main.focus({ preventScroll: true });
  });
}
