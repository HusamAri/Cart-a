// Carta — Studio layout (shared sidebar nav + top bar)
import './page-motion.js';
import { getSession } from './supabase-client.js';
import { signOut } from './auth.js';
import { getActiveWorkspace } from './workspaces.js';
import { getMyRole, can } from './permissions.js';
import { applyTranslations, t, setLang, getLang } from './i18n.js';
import { cartaIcon } from './carta-icon.js';
import { mountFloatingBackToTop, mountShortcutsHelp } from './app-chrome.js';
import { initTheme, cycleThemePref, getThemePref, themePrefGlyph } from './theme.js';

const RAIL_SESSION_KEY = 'carta_sidebar_rail';

const MODULES = [
  { key: 'dashboard', href: '/app/studio/dashboard.html', icon: 'query_stats',       i18n: 'studio.m_dashboard', fallback: 'Dashboard' },
  { key: 'recipes',   href: '/app/studio/recipes.html',   icon: 'temp_preferences_eco', i18n: 'studio.m_builder',  fallback: 'Recipes' },
  { key: 'menus',     href: '/app/studio/menus.html',     icon: 'restaurant_menu',       i18n: 'studio.m_menus',    fallback: 'My menus' },
  { key: 'ingredients', href: '/app/studio/ingredients.html', icon: 'nutrition', i18n: 'studio.m_ing_db', fallback: 'Ingredient DB' },
  { key: 'presets',   href: '/app/studio/presets.html',   icon: 'collections_bookmark', i18n: 'studio.m_presets', fallback: 'Presets' },
  { key: 'cost',      href: '/app/studio/cost.html',      icon: 'account_balance_wallet', i18n: 'studio.m_ledger',   fallback: 'Cost' },
  { key: 'pricing',   href: '/app/studio/pricing.html',   icon: 'sell',                 i18n: 'studio.m_pricing',  fallback: 'Pricing' },
  { key: 'matrix',    href: '/app/studio/matrix.html',    icon: 'grid_view',            i18n: 'studio.m_matrix',   fallback: 'Engineering' },
  { key: 'variance',  href: '/app/studio/variance.html',  icon: 'analytics',            i18n: 'studio.m_audit',    fallback: 'Variance' },
  { key: 'audit',     href: '/app/studio/audit.html',      icon: 'history',              i18n: 'studio.m_activity',  fallback: 'Activity log' },
  { key: 'capabilities', href: '/app/studio/capabilities.html', icon: 'table_chart', i18n: 'studio.m_capabilities', fallback: 'Capability map' },
  { key: 'surface',   href: '/app/studio/surface.html',   icon: 'ios_share',            i18n: 'studio.m_surface',  fallback: 'Surface' },
];

export async function mountStudioShell({ active = 'overview', main } = {}) {
  // Auth + workspace guard
  const session = await getSession();
  if (!session) { window.location.href = '/app/login.html'; return null; }
  const ws = await getActiveWorkspace();
  if (!ws) { window.location.href = '/app/'; return null; }
  const role = await getMyRole(ws.id);
  const canSwitchProperty = can(role, 'property_switch');

  // Build sidebar HTML
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.id = 'studioSidebar';
  sidebar.setAttribute('aria-label', 'Studio navigation');
  sidebar.innerHTML = `
    <div class="sidebar__head">
      <a href="/app/studio.html" class="logo" aria-label="Carta studio home">
        <img src="/assets/carta-brand-vertical.png?v=7" alt="Carta · F&amp;B Operations Studio" width="1536" height="1024" decoding="async">
      </a>
      <span class="role" id="sidebarWsName">${escapeHTML(ws.name)}</span>
      <button type="button" id="sidebarRailToggle" class="sidebar-rail-toggle" aria-pressed="false" aria-label="">
        <span class="sidebar-rail-toggle__glyph" aria-hidden="true">‹</span>
      </button>
    </div>
    <nav class="sidebar__nav" aria-label="Modules">
      <a class="sidebar__link ${active==='overview'?'active':''}" href="/app/studio.html" ${active==='overview'?'aria-current="page"':''}>
        <span class="sidebar__icon">${cartaIcon('dashboard', { size: 22 })}</span>
        <span class="sidebar__label" data-i18n="studio.overview">Overview</span>
      </a>
      ${MODULES.map(m => `
        <a class="sidebar__link ${active===m.key?'active':''}" href="${m.href}" ${active===m.key?'aria-current="page"':''}>
          <span class="sidebar__icon">${cartaIcon(m.icon, { size: 22 })}</span>
          <span class="sidebar__label" data-i18n="${m.i18n}">${m.fallback}</span>
        </a>
      `).join('')}
    </nav>
    <div class="sidebar__foot">
      <div id="sidebarUserChip" style="display:flex;gap:8px;align-items:center;padding:8px 14px;background:rgb(var(--ink-rgb) / 0.04);border-radius:var(--r-pill)">
        ${cartaIcon('account_circle', { size: 18, style: 'color:var(--on-surface-variant)' })}
        <span class="caption" style="font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" id="sidebarUserEmail">${escapeHTML(session.user.email)}</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap">
        <button type="button" class="carta-theme-btn" id="sidebarThemeBtn" aria-label="">◐</button>
        <div style="display:flex;gap:8px;align-items:center;flex:1;justify-content:flex-end;flex-wrap:wrap;min-width:0">
        ${canSwitchProperty
          ? `<button type="button" class="btn btn-sm btn-ghost" onclick="window.location.href='/app/'" data-i18n="studio.switch_ws" style="flex:1;padding:8px 12px;font-size:11px">Switch workspace</button>`
          : `<button type="button" class="btn btn-sm btn-ghost" disabled aria-disabled="true" title="${escapeHTML(t('ws.property_switch_denied') || 'Property switch is restricted')}" style="flex:1;padding:8px 12px;font-size:11px">${escapeHTML(t('studio.switch_ws'))}</button>`}
        <button type="button" class="btn btn-sm btn-ghost" id="sidebarLangBtn" aria-label="Toggle language" style="padding:8px 12px;min-width:48px">EN</button>
        </div>
      </div>
      <button type="button" class="btn btn-sm btn-ghost btn-block" id="sidebarSignOut" data-i18n="app.sign_out" style="padding:10px 14px">Sign out</button>
    </div>
  `;

  // Mobile top bar — hamburger opens sidebar as a drawer
  const mobileTop = document.createElement('header');
  mobileTop.className = 'studio-mobile-top';
  mobileTop.setAttribute('aria-label', 'Studio top bar');
  mobileTop.innerHTML = `
    <a href="/app/studio.html" class="site-logo studio-mobile-top__brand" aria-label="Carta studio home">
      <img src="/assets/carta-brand-lockup-horizontal.png?v=7" alt="Carta · F&amp;B Operations Studio" width="1024" height="1024">
    </a>
    <span class="studio-mobile-top__spacer" aria-hidden="true"></span>
    <span class="studio-mobile-top__rule" aria-hidden="true"></span>
    <div class="studio-mobile-top__actions">
      <button type="button" id="mobileMenuBtn"
        class="btn btn-sm btn-ghost studio-mobile-top__menu"
        aria-label="Open navigation"
        aria-controls="studioSidebar"
        aria-expanded="false"
        style="padding:8px 12px;min-height:44px;min-width:44px">
        ${cartaIcon('menu', { size: 22 })}
      </button>
      ${canSwitchProperty
        ? `<a href="/app/" class="btn btn-sm btn-ghost studio-mobile-top__ws" aria-label="Switch workspace" style="padding:8px 12px;min-height:44px;min-width:44px">
          ${cartaIcon('swap_horiz', { size: 20 })}
        </a>`
        : `<button type="button" class="btn btn-sm btn-ghost studio-mobile-top__ws" disabled aria-disabled="true" title="${escapeHTML(t('ws.property_switch_denied') || 'Property switch is restricted')}" style="padding:8px 12px;min-height:44px;min-width:44px">
          ${cartaIcon('lock', { size: 20 })}
        </button>`}
    </div>
  `;

  // Backdrop for drawer
  const backdrop = document.createElement('div');
  backdrop.className = 'sidebar-backdrop';
  backdrop.id = 'sidebarBackdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.appendChild(backdrop);

  // Mount into body — sidebar first, then mobile top, then main wrapped
  document.body.classList.add('studio-body');
  document.body.style.cssText += ';display:flex;align-items:stretch;min-height:100vh';

  document.body.prepend(sidebar);

  const mainWrap = document.createElement('section');
  mainWrap.className = 'studio-main';
  mainWrap.style.cssText = 'flex:1;min-width:0;display:flex;flex-direction:column';
  mainWrap.appendChild(mobileTop);

  if (main) {
    // Move provided main element into wrap
    mainWrap.appendChild(main);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => main.classList.add('content-reveal'));
    });
  }
  document.body.appendChild(mainWrap);

  // Wire up controls
  document.getElementById('sidebarSignOut').addEventListener('click', signOut);

  // Colour theme (system / light / dark)
  initTheme();
  function syncSidebarThemeBtn() {
    const b = document.getElementById('sidebarThemeBtn');
    if (!b) return;
    const pref = getThemePref();
    b.textContent = themePrefGlyph(pref);
    const label = pref === 'system' ? t('ui.theme.aria_system') : pref === 'light' ? t('ui.theme.aria_light') : t('ui.theme.aria_dark');
    b.setAttribute('aria-label', label);
    b.title = label;
  }
  syncSidebarThemeBtn();
  document.getElementById('sidebarThemeBtn')?.addEventListener('click', () => {
    cycleThemePref();
    syncSidebarThemeBtn();
  });
  window.addEventListener('carta-theme-change', syncSidebarThemeBtn);

  const langBtn = document.getElementById('sidebarLangBtn');
  function syncLang(){ langBtn.textContent = getLang()==='en' ? 'TR' : 'EN'; }
  syncLang();
  langBtn.addEventListener('click', () => {
    setLang(getLang()==='en' ? 'tr' : 'en');
    syncLang();
    applyTranslations();
    syncSidebarRailUi();
    syncSidebarThemeBtn();
  });

  applyTranslations();

  const mqDesktop = window.matchMedia('(min-width: 901px)');

  function readRailCollapsed() {
    try { return sessionStorage.getItem(RAIL_SESSION_KEY) === '1'; } catch (_) { return false; }
  }
  function persistRailCollapsed(on) {
    try { sessionStorage.setItem(RAIL_SESSION_KEY, on ? '1' : '0'); } catch (_) {}
  }

  const railBtn = document.getElementById('sidebarRailToggle');
  let railCollapsed = readRailCollapsed();

  function refreshSidebarLinkAriaLabels() {
    document.querySelectorAll('#studioSidebar a.sidebar__link').forEach(a => {
      const lab = a.querySelector('.sidebar__label');
      if (!lab) return;
      if (sidebar.classList.contains('sidebar--rail')) {
        a.setAttribute('aria-label', lab.textContent.trim());
      } else {
        a.removeAttribute('aria-label');
      }
    });
  }

  function syncSidebarRailUi() {
    const desktopWide = mqDesktop.matches;
    if (!desktopWide) {
      sidebar.classList.remove('sidebar--rail');
    } else {
      sidebar.classList.toggle('sidebar--rail', railCollapsed);
    }
    if (railBtn) {
      const collapsed = desktopWide && railCollapsed;
      railBtn.setAttribute('aria-pressed', collapsed ? 'true' : 'false');
      railBtn.setAttribute('aria-label', collapsed ? t('ui.sidebar_expand') : t('ui.sidebar_collapse'));
      railBtn.querySelector('.sidebar-rail-toggle__glyph').textContent = collapsed ? '›' : '‹';
    }
    refreshSidebarLinkAriaLabels();
  }

  syncSidebarRailUi();
  railBtn?.addEventListener('click', () => {
    if (!mqDesktop.matches) return;
    railCollapsed = !railCollapsed;
    persistRailCollapsed(railCollapsed);
    syncSidebarRailUi();
  });

  // ============================================================
  // Mobile drawer behavior (hamburger toggle + backdrop + focus trap)
  // ============================================================
  const menuBtn = document.getElementById('mobileMenuBtn');
  const drawerBackdrop = document.getElementById('sidebarBackdrop');

  function openDrawer() {
    sidebar.classList.add('is-open');
    drawerBackdrop.classList.add('is-open');
    document.body.classList.add('drawer-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    // Focus first link in sidebar for keyboard users
    const firstLink = sidebar.querySelector('.sidebar__link');
    if (firstLink) setTimeout(() => firstLink.focus(), 50);
  }
  function closeDrawer() {
    sidebar.classList.remove('is-open');
    drawerBackdrop.classList.remove('is-open');
    document.body.classList.remove('drawer-open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
  function isDrawerOpen() {
    return sidebar.classList.contains('is-open');
  }

  menuBtn.addEventListener('click', () => {
    isDrawerOpen() ? closeDrawer() : openDrawer();
  });
  drawerBackdrop.addEventListener('click', closeDrawer);

  // Close on Escape; basic focus trap while open
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isDrawerOpen()) { closeDrawer(); menuBtn.focus(); return; }
    if (e.key === 'Tab' && isDrawerOpen()) {
      const focusables = sidebar.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last  = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Close when navigating away (link click)
  sidebar.querySelectorAll('.sidebar__link').forEach(a => {
    a.addEventListener('click', () => { if (isDrawerOpen()) closeDrawer(); });
  });

  mqDesktop.addEventListener?.('change', () => {
    if (mqDesktop.matches && isDrawerOpen()) closeDrawer();
    syncSidebarRailUi();
  });

  if (main) {
    mountFloatingBackToTop({ scrollRoot: main });
  } else {
    mountFloatingBackToTop();
  }
  mountShortcutsHelp([
    { keyHtml: '?', labelKey: 'ui.shortcuts.help_open' },
    { keyHtml: 'Esc', labelKey: 'ui.shortcuts.esc_overlay' },
    { keyHtml: String.fromCharCode(8226), labelKey: 'ui.shortcuts.rail_toggle' },
    { keyHtml: 'Tab', labelKey: 'ui.shortcuts.skip_tip' },
  ]);

  return { session, workspace: ws };
}

function escapeHTML(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
