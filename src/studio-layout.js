// Carta — Studio layout (shared sidebar nav + top bar)
import './page-motion.js';
import { initSkipLink } from './skip-link.js';
import { getSessionAfterUrlAuth, onAuthChange } from './supabase-client.js';
import { signOut } from './auth.js';
import { getActiveWorkspace } from './workspaces.js';
import { getMyRole, can, invalidateRoleCache } from './permissions.js';
import { applyTranslations, t, getLang, wireLangSwitchers } from './i18n.js';
import { cartaIcon } from './carta-icon.js';
import { mountFloatingBackToTop, mountShortcutsHelp } from './app-chrome.js';
import { initTheme, cycleThemePref, getThemePref, themePrefGlyph } from './theme.js';

const RAIL_SESSION_KEY = 'carta_sidebar_rail';

/** Left rail: `assets/left-side-icon-set.png` — 5 cols × 4 rows; [col, row] is 0-based. */
function sidebarNavSprite(col, row) {
  return `<span class="sidebar__icon sidebar__icon--sheet" style="--s-col:${col};--s-row:${row}" aria-hidden="true"></span>`;
}

/** Primary destinations on the mobile bottom bar (full list stays in the drawer). */
const MOBILE_TABS = [
  { key: 'overview', href: '/app/studio.html', sprite: [0, 0], i18n: 'studio.overview', fallback: 'Overview' },
  { key: 'dashboard', href: '/app/studio/dashboard.html', sprite: [3, 2], i18n: 'studio.m_dashboard', fallback: 'Dashboard' },
  { key: 'recipes', href: '/app/studio/recipes.html', sprite: [1, 2], i18n: 'studio.m_builder', fallback: 'Recipes' },
  { key: 'menus', href: '/app/studio/menus.html', sprite: [0, 2], i18n: 'studio.m_menus', fallback: 'Menus' },
];

const MODULES = [
  { key: 'dashboard', href: '/app/studio/dashboard.html', sprite: [3, 2], i18n: 'studio.m_dashboard', fallback: 'Dashboard' },
  { key: 'recipes',   href: '/app/studio/recipes.html',   sprite: [1, 2], i18n: 'studio.m_builder',  fallback: 'Recipes' },
  { key: 'menus',     href: '/app/studio/menus.html',     sprite: [0, 2], i18n: 'studio.m_menus',    fallback: 'My menus' },
  { key: 'ingredients', href: '/app/studio/ingredients.html', sprite: [2, 2], i18n: 'studio.m_ing_db', fallback: 'Ingredient DB' },
  { key: 'presets',   href: '/app/studio/presets.html',   sprite: [2, 0], i18n: 'studio.m_presets', fallback: 'Presets' },
  { key: 'cost',      href: '/app/studio/cost.html',      sprite: [3, 0], i18n: 'studio.m_ledger',   fallback: 'Cost' },
  { key: 'pricing',   href: '/app/studio/pricing.html',   sprite: [0, 1], i18n: 'studio.m_pricing',  fallback: 'Pricing' },
  { key: 'matrix',    href: '/app/studio/matrix.html',    sprite: [1, 1], i18n: 'studio.m_matrix',   fallback: 'Engineering' },
  { key: 'variance',  href: '/app/studio/variance.html',  sprite: [4, 2], i18n: 'studio.m_audit',    fallback: 'Variance' },
  { key: 'audit',     href: '/app/studio/audit.html',      sprite: [2, 1], i18n: 'studio.m_activity',  fallback: 'Activity log' },
  { key: 'capabilities', href: '/app/studio/capabilities.html', sprite: [3, 3], i18n: 'studio.m_capabilities', fallback: 'Capability map' },
  { key: 'surface',   href: '/app/studio/surface.html',   sprite: [4, 0], i18n: 'studio.m_surface',  fallback: 'Surface' },
];

function moduleMetaForActive(active) {
  if (active === 'overview') return MOBILE_TABS[0];
  return MODULES.find((m) => m.key === active) || MOBILE_TABS[0];
}

export async function mountStudioShell({ active = 'overview', main } = {}) {
  // Auth + workspace guard
  const session = await getSessionAfterUrlAuth();
  if (!session) { window.location.href = '/app/login.html'; return null; }
  const ws = await getActiveWorkspace();
  if (!ws) { window.location.href = '/app/'; return null; }
  const role = await getMyRole(ws.id);
  const canSwitchProperty = can(role, 'property_switch');

  onAuthChange((event) => {
    if (event === 'SIGNED_OUT') invalidateRoleCache();
    else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') invalidateRoleCache(ws.id);
  });

  // Build sidebar HTML
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.id = 'studioSidebar';
  const pageMeta = moduleMetaForActive(active);
  sidebar.setAttribute('aria-label', 'Studio navigation');
  sidebar.innerHTML = `
    <div class="sidebar__drawer-head">
      <p class="sidebar__drawer-title" data-i18n="ui.nav_menu">Menu</p>
      <button type="button" class="sidebar__drawer-close" id="sidebarDrawerClose" data-i18n-aria-label="ui.nav_close" aria-label="Close menu">
        ${cartaIcon('close', { size: 22 })}
      </button>
    </div>
    <div class="sidebar__head">
      <a href="/app/studio.html" class="logo" aria-label="Carta studio home">
        <img src="/assets/carta-brand-vertical.png?v=7" alt="Carta · F&amp;B Operations Studio" width="1536" height="1024" decoding="async">
      </a>
      <div class="sidebar__context" id="sidebarContextStrip" role="group" title="${escapeHTML([ws.organization_name, ws.name].filter(Boolean).join(' · '))}">
        ${ws.organization_name ? `<span class="sidebar__org" id="sidebarOrgName">${escapeHTML(ws.organization_name)}</span>` : ''}
        <span class="sidebar__facility role" id="sidebarWsName">${escapeHTML(ws.name)}</span>
      </div>
      <button type="button" id="sidebarRailToggle" class="sidebar-rail-toggle" aria-pressed="false" aria-label="">
        <span class="sidebar-rail-toggle__glyph" aria-hidden="true">‹</span>
      </button>
    </div>
    <nav class="sidebar__nav" aria-label="Modules">
      <a class="sidebar__link ${active==='overview'?'active':''}" href="/app/studio.html" ${active==='overview'?'aria-current="page"':''}>
        ${sidebarNavSprite(0, 0)}
        <span class="sidebar__label" data-i18n="studio.overview">Overview</span>
      </a>
      ${MODULES.map(m => `
        <a class="sidebar__link ${active===m.key?'active':''}" href="${m.href}" ${active===m.key?'aria-current="page"':''}>
          ${sidebarNavSprite(m.sprite[0], m.sprite[1])}
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
          ? `<button type="button" id="sidebarSwitchWsBtn" class="btn btn-sm btn-ghost" data-i18n="studio.switch_ws" style="flex:1;padding:8px 12px;font-size:11px">Switch workspace</button>`
          : `<button type="button" class="btn btn-sm btn-ghost" disabled aria-disabled="true" title="${escapeHTML(t('ws.property_switch_denied') || 'Property switch is restricted')}" style="flex:1;padding:8px 12px;font-size:11px">${escapeHTML(t('studio.switch_ws'))}</button>`}
        <div class="lang-toggle lang-toggle--compact" role="group" data-i18n-aria-label="ui.lang.group_aria" aria-label="Language">
          <button type="button" data-lang-btn="en">EN</button>
          <button type="button" data-lang-btn="tr">TR</button>
          <button type="button" data-lang-btn="es">ES</button>
        </div>
        </div>
      </div>
      <button type="button" class="btn btn-sm btn-ghost btn-block" id="sidebarSignOut" data-i18n="app.sign_out" style="padding:10px 14px">Sign out</button>
    </div>
  `;

  // Mobile top bar — hamburger opens sidebar as a drawer
  const mobileTop = document.createElement('header');
  mobileTop.className = 'studio-mobile-top';
  mobileTop.setAttribute('aria-label', 'Studio top bar');
  const facilitySubtitle = [ws.organization_name, ws.name].filter(Boolean).join(' · ');
  mobileTop.innerHTML = `
    <a href="/app/studio.html" class="site-logo studio-mobile-top__brand" aria-label="Carta studio home">
      <img src="/assets/carta-brand-lockup-horizontal.png?v=7" alt="Carta · F&amp;B Operations Studio" width="1024" height="1024">
    </a>
    <div class="studio-mobile-top__context" id="mobileContextStrip" role="group" title="${escapeHTML(facilitySubtitle)}">
      ${ws.organization_name ? `<span class="studio-mobile-top__crumb studio-mobile-top__crumb--org">${escapeHTML(ws.organization_name)}</span><span class="studio-mobile-top__sep" aria-hidden="true">·</span>` : ''}
      <span class="studio-mobile-top__crumb">${escapeHTML(ws.name)}</span>
    </div>
    <span class="studio-mobile-top__spacer" aria-hidden="true"></span>
    <span class="studio-mobile-top__rule" aria-hidden="true"></span>
    <button type="button" id="mobileMenuBtn"
      class="btn btn-sm btn-ghost studio-mobile-top__menu"
      data-i18n-aria-label="ui.open_nav"
      aria-label="Open navigation"
      aria-controls="studioSidebar"
      aria-expanded="false"
      style="padding:8px 12px;min-height:44px;min-width:44px">
      ${cartaIcon('menu', { size: 22 })}
    </button>
    <div class="studio-mobile-top__lead">
      <p class="studio-mobile-top__title" id="mobilePageTitle" data-i18n="${pageMeta.i18n}">${escapeHTML(pageMeta.fallback)}</p>
      <p class="studio-mobile-top__subtitle" id="mobileFacilitySubtitle">${escapeHTML(facilitySubtitle)}</p>
    </div>
    <div class="studio-mobile-top__actions">
      ${canSwitchProperty
        ? `<a href="/app/" class="btn btn-sm btn-ghost studio-mobile-top__ws" data-i18n-aria-label="studio.switch_ws" aria-label="Switch workspace" style="padding:8px 12px;min-height:44px;min-width:44px">
          ${cartaIcon('swap_horiz', { size: 20 })}
        </a>`
        : `<button type="button" class="btn btn-sm btn-ghost studio-mobile-top__ws" disabled aria-disabled="true" title="${escapeHTML(t('ws.property_switch_denied') || 'Property switch is restricted')}" style="padding:8px 12px;min-height:44px;min-width:44px">
          ${cartaIcon('lock', { size: 20 })}
        </button>`}
    </div>
  `;

  const mobileBottom = document.createElement('nav');
  mobileBottom.className = 'studio-mobile-bottom';
  mobileBottom.id = 'studioMobileBottom';
  mobileBottom.setAttribute('aria-label', t('ui.mobile_nav_aria'));
  mobileBottom.innerHTML = MOBILE_TABS.map((tab) => `
    <a class="studio-mobile-tab ${active === tab.key ? 'is-active' : ''}" href="${tab.href}" ${active === tab.key ? 'aria-current="page"' : ''}>
      <span class="sidebar__icon sidebar__icon--sheet" style="--s-col:${tab.sprite[0]};--s-row:${tab.sprite[1]}" aria-hidden="true"></span>
      <span class="studio-mobile-tab__label" data-i18n="${tab.i18n}">${escapeHTML(tab.fallback)}</span>
    </a>
  `).join('') + `
    <button type="button" class="studio-mobile-tab" id="mobileMoreBtn" data-i18n-aria-label="ui.nav_more" aria-label="More">
      ${cartaIcon('grid_view', { size: 22 })}
      <span class="studio-mobile-tab__label" data-i18n="ui.nav_more">More</span>
    </button>
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
  document.body.appendChild(mobileBottom);
  document.body.appendChild(mainWrap);

  // Wire up controls
  document.getElementById('sidebarSignOut').addEventListener('click', signOut);
  document.getElementById('sidebarSwitchWsBtn')?.addEventListener('click', () => {
    window.location.href = '/app/';
  });

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

  wireLangSwitchers(sidebar);
  window.addEventListener('carta-lang-change', () => {
    syncWorkspaceContextAria(ws);
    syncSidebarRailUi();
    syncSidebarThemeBtn();
  });

  applyTranslations();

  function workspaceContextAria(activeWs) {
    const facility = String(activeWs?.name || '').trim();
    const org = (activeWs?.organization_name && String(activeWs.organization_name).trim()) || '';
    if (org && facility) {
      return t('studio.context_aria_both').replaceAll('{org}', org).replaceAll('{facility}', facility);
    }
    if (facility) {
      return t('studio.context_aria_facility').replaceAll('{facility}', facility);
    }
    return t('studio.context_aria_unknown');
  }
  function syncWorkspaceContextAria(activeWs) {
    const label = workspaceContextAria(activeWs);
    document.getElementById('sidebarContextStrip')?.setAttribute('aria-label', label);
    document.getElementById('mobileContextStrip')?.setAttribute('aria-label', label);
  }
  syncWorkspaceContextAria(ws);

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
  const drawerCloseBtn = document.getElementById('sidebarDrawerClose');
  const mobileMoreBtn = document.getElementById('mobileMoreBtn');

  if (!MOBILE_TABS.some((tab) => tab.key === active)) {
    mobileMoreBtn?.classList.add('is-active');
  }

  function syncMenuBtnAria() {
    const open = isDrawerOpen();
    menuBtn?.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn?.setAttribute('aria-label', t(open ? 'ui.close_nav' : 'ui.open_nav'));
  }

  function openDrawer() {
    sidebar.classList.add('is-open');
    drawerBackdrop?.classList.add('is-open');
    document.body.classList.add('drawer-open');
    syncMenuBtnAria();
    drawerCloseBtn?.focus({ preventScroll: true });
  }
  function closeDrawer() {
    sidebar.classList.remove('is-open');
    drawerBackdrop?.classList.remove('is-open');
    document.body.classList.remove('drawer-open');
    syncMenuBtnAria();
  }
  function isDrawerOpen() {
    return sidebar.classList.contains('is-open');
  }

  menuBtn?.addEventListener('click', () => {
    isDrawerOpen() ? closeDrawer() : openDrawer();
  });
  drawerCloseBtn?.addEventListener('click', closeDrawer);
  mobileMoreBtn?.addEventListener('click', openDrawer);
  drawerBackdrop?.addEventListener('click', closeDrawer);
  syncMenuBtnAria();

  // Close on Escape; basic focus trap while open
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isDrawerOpen()) { closeDrawer(); menuBtn?.focus({ preventScroll: true }); return; }
    if (e.key === 'Tab' && isDrawerOpen()) {
      const focusables = sidebar.querySelectorAll('a, button, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const list = [...focusables].filter(el => !el.disabled && el.offsetParent !== null);
      if (!list.length) return;
      const first = list[0];
      const last  = list[list.length - 1];
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

  initSkipLink();

  return { session, workspace: ws, role };
}

function escapeHTML(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
