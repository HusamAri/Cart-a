/* Carta — run in <head> before CSS paint. Keeps data-color-scheme in sync with localStorage + system. */
(function () {
  var K = 'carta-theme';
  try {
    var pref = localStorage.getItem(K) || 'system';
    function effective() {
      if (pref === 'dark') return 'dark';
      if (pref === 'light') return 'light';
      return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    var e = effective();
    document.documentElement.setAttribute('data-color-scheme', e);
    document.documentElement.dataset.themePref = pref;
  } catch (_) {
    document.documentElement.setAttribute('data-color-scheme', 'light');
    document.documentElement.dataset.themePref = 'system';
  }
})();
