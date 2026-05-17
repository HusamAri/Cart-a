// Carta — Studio layout (shared sidebar nav + top bar)
import { getSession } from './supabase-client.js';
import { signOut } from './auth.js';
import { getActiveWorkspace } from './workspaces.js';
import { getMyRole, can } from './permissions.js';
import { applyTranslations, t, setLang, getLang } from './i18n.js';

const MODULES = [
  { key: 'dashboard', href: '/app/studio/dashboard.html', icon: 'query_stats',       i18n: 'studio.m_dashboard', fallback: 'Dashboard' },
  { key: 'recipes',   href: '/app/studio/recipes.html',   icon: 'temp_preferences_eco', i18n: 'studio.m_builder',  fallback: 'Recipes' },
  { key: 'ingredients', href: '/app/studio/ingredients.html', icon: 'nutrition', i18n: 'studio.m_ing_db', fallback: 'Ingredient DB' },
  { key: 'cost',      href: '/app/studio/cost.html',      icon: 'account_balance_wallet', i18n: 'studio.m_ledger',   fallback: 'Cost' },
  { key: 'pricing',   href: '/app/studio/pricing.html',   icon: 'sell',                 i18n: 'studio.m_pricing',  fallback: 'Pricing' },
  { key: 'matrix',    href: '/app/studio/matrix.html',    icon: 'grid_view',            i18n: 'studio.m_matrix',   fallback: 'Engineering' },
  { key: 'variance',  href: '/app/studio/variance.html',  icon: 'analytics',            i18n: 'studio.m_audit',    fallback: 'Variance' },
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
        <img src="/assets/carta-logo.png" alt="Carta">
      </a>
      <span class="role" id="sidebarWsName">${escapeHTML(ws.name)}</span>
    </div>
    <nav class="sidebar__nav" aria-label="Modules">
      <a class="sidebar__link ${active==='overview'?'active':''}" href="/app/studio.html" ${active==='overview'?'aria-current="page"':''}>
        <span class="sidebar__icon material-symbols-outlined">dashboard</span>
        <span data-i18n="studio.overview">Overview</span>
      </a>
      ${MODULES.map(m => `
        <a class="sidebar__link ${active===m.key?'active':''}" href="${m.href}" ${active===m.key?'aria-current="page"':''}>
          <span class="sidebar__icon material-symbols-outlined">${m.icon}</span>
          <span data-i18n="${m.i18n}">${m.fallback}</span>
        </a>
      `).join('')}
    </nav>
    <div class="sidebar__foot">
      <div style="display:flex;gap:8px;align-items:center;padding:8px 14px;background:rgba(7,22,13,0.04);border-radius:var(--r-pill)">
        <span class="material-symbols-outlined" style="font-size:18px;color:var(--on-surface-variant)">account_circle</span>
        <span class="caption" style="font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" id="sidebarUserEmail">${escapeHTML(session.user.email)}</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;justify-content:space-between">
        ${canSwitchProperty
          ? `<button type="button" class="btn btn-sm btn-ghost" onclick="window.location.href='/app/'" data-i18n="studio.switch_ws" style="flex:1;padding:8px 12px;font-size:11px">Switch workspace</button>`
          : `<button type="button" class="btn btn-sm btn-ghost" disabled aria-disabled="true" title="${escapeHTML(t('ws.property_switch_denied') || 'Property switch is restricted')}" style="flex:1;padding:8px 12px;font-size:11px">${escapeHTML(t('studio.switch_ws'))}</button>`}
        <button type="button" class="btn btn-sm btn-ghost" id="sidebarLangBtn" aria-label="Toggle language" style="padding:8px 12px;min-width:48px">EN</button>
      </div>
      <button type="button" class="btn btn-sm btn-ghost btn-block" id="sidebarSignOut" data-i18n="app.sign_out" style="padding:10px 14px">Sign out</button>
    </div>
  `;

  // Mobile top bar — hamburger opens sidebar as a drawer
  const mobileTop = document.createElement('header');
  mobileTop.className = 'studio-mobile-top';
  mobileTop.setAttribute('aria-label', 'Studio top bar');
  mobileTop.innerHTML = `
    <button type="button" id="mobileMenuBtn"
      class="btn btn-sm btn-ghost"
      aria-label="Open navigation"
      aria-controls="studioSidebar"
      aria-expanded="false"
      style="padding:8px 12px;min-height:44px;min-width:44px">
      <span class="material-symbols-outlined" style="font-size:22px" aria-hidden="true">menu</span>
    </button>
    <a href="/app/studio.html" class="site-logo" aria-label="Carta studio home" style="flex:1;justify-content:center;display:flex">
      <img src="/assets/carta-logo.png" alt="Carta" style="height:22px">
    </a>
    ${canSwitchProperty
      ? `<a href="/app/" class="btn btn-sm btn-ghost" aria-label="Switch workspace" style="padding:8px 12px;min-height:44px;min-width:44px">
        <span class="material-symbols-outlined" style="font-size:20px" aria-hidden="true">swap_horiz</span>
      </a>`
      : `<button type="button" class="btn btn-sm btn-ghost" disabled aria-disabled="true" title="${escapeHTML(t('ws.property_switch_denied') || 'Property switch is restricted')}" style="padding:8px 12px;min-height:44px;min-width:44px">
        <span class="material-symbols-outlined" style="font-size:20px" aria-hidden="true">lock</span>
      </button>`}
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
  }
  document.body.appendChild(mainWrap);

  // Wire up controls
  document.getElementById('sidebarSignOut').addEventListener('click', signOut);

  const langBtn = document.getElementById('sidebarLangBtn');
  function syncLang(){ langBtn.textContent = getLang()==='en' ? 'TR' : 'EN'; }
  syncLang();
  langBtn.addEventListener('click', () => { setLang(getLang()==='en' ? 'tr' : 'en'); syncLang(); applyTranslations(); });

  applyTranslations();

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

  // Close when resizing past desktop breakpoint
  const mqDesktop = window.matchMedia('(min-width: 901px)');
  const onResize = () => { if (mqDesktop.matches && isDrawerOpen()) closeDrawer(); };
  mqDesktop.addEventListener?.('change', onResize);

  return { session, workspace: ws };
}

function escapeHTML(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
