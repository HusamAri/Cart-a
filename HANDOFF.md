# Carta — Engineering Handoff

**Last updated:** 2026-05-18  
**Maintainer:** Hüsam Arı  
**Status:** Studio MVP shipped (6/6 modules). Org + role architecture in place. Production-ready for first pilots after billing + legal pages land.

---

## TL;DR

Carta is a luxury F&B operations SaaS for hotel groups and restaurant chains.
Pure-static frontend (HTML + ESM JS, no build step) on Vercel + Supabase Postgres backend.

- **Live:** [https://cart-a.live](https://cart-a.live)  (and `carta-beta-eosin.vercel.app`)
- **Tenant:** `husamaris-projects` on Vercel · project id `prj_TQrD1WDAFgN59y6kPjvK4gGvBCg5`
- **DB:** Supabase project `hfjgthwaucrfhwkrehxw` (region `ap-northeast-2`)
- **Domain registrar:** Squarespace Domains (`cart-a.live`)
- **Anchor user:** `husam.ari@artifact-studio.com` (password `Carta-Lumina-2026!`)

---

## Tech stack


| Layer         | Stack                                                | Notes                                                                                                                          |
| ------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Frontend      | Static HTML + ESM JS + CSS tokens                    | No bundler. ESM via `<script type="module">`. CSS in `styles/tokens.css` + small per-page `<style>` blocks.                    |
| Auth          | Supabase Auth (`@supabase/supabase-js@2` via esm.sh) | Magic-link + email/password. PKCE flow.                                                                                        |
| DB            | Supabase Postgres 17                                 | RLS-first. Per-workspace tenancy.                                                                                              |
| Hosting       | Vercel (framework: null, no build step)              | `cleanUrls: true`, custom domain `cart-a.live`.                                                                                |
| i18n          | Custom (`src/i18n.js`)                               | EN + TR. `data-i18n` attribute pattern. `<html lang>` synced on toggle.                                                        |
| Design system | "Lumina v2 — Matte Glass & Deep Forest"              | Playfair Display + Hanken Grotesk. 32px rounded glass cards with backdrop-blur(30px). Forest green primary, faint-gold accent. |


---

## Repository layout

Repo root **is** the static site root. Vercel deploys the working tree as-is.

```
./                              Repo root = Vercel static root
├── index.html                  Landing page
├── vercel.json                 Vercel static-site config + security headers
├── HANDOFF.md                  ← you are here
├── LICENSE                     MIT
├── .gitignore
│
├── app/                        Authenticated app shell
│   ├── login.html              Magic link + password login
│   ├── signup.html             Magic link signup
│   ├── index.html              Org-grouped workspace selector + Manage modal
│   ├── studio.html             Studio overview (bento grid of 6 modules)
│   └── studio/                 Each module is a single-file ESM page
│       ├── recipes.html        01 — Recipe Builder
│       ├── cost.html           02 — Cost Ledger
│       ├── pricing.html        03 — Pricing Workspace (auto-save)
│       ├── matrix.html         04 — Engineering Matrix (Smith-Kasavana)
│       ├── variance.html       05 — Variance Audit (snapshot diff)
│       └── surface.html        06 — Surface / Export
│
├── src/                        Shared client modules (ESM)
│   ├── config.js               SUPABASE_URL + SUPABASE_PUBLISHABLE_KEY
│   ├── supabase-client.js      Supabase JS client singleton
│   ├── auth.js                 signInWithPassword, sendMagicLink, signOut
│   ├── i18n.js                 Bilingual EN/TR strings + setLang/getLang
│   ├── workspaces.js           Org + workspace + member CRUD helpers
│   ├── permissions.js          ACTIONS map + getMyRole + can + applyRoleGates
│   ├── studio-layout.js        Sidebar shell + mobile drawer + auth guard
│   ├── nutrient-db.js          ~200-item TGK Ek-10 nutrient subset + suggestNutrients
│   ├── recipe-compute.js       Atwater kcal + cost compute + suggested price
│   └── xlsx-export.js          SpreadsheetML 2003 XML export
│
├── styles/
│   └── tokens.css              Design tokens + shared components (modal, empty-state, data-table, etc.)
│
├── assets/
│   └── carta-logo.png
│
└── supabase/                   Migration history (for reference; live migrations applied via MCP)
    ├── config.toml
    ├── schema.sql
    └── migrations/
        └── 20260514182927_initial_schema.sql
```

---

## Data model

```
organizations (id, name, slug, created_by)
   ↓ 1:N (workspaces.organization_id)
workspaces (id, name, slug, owner_id, organization_id, currency, plan, vat_rate, target_gp, q_factor)
   ↓ 1:N (per-data tables filter by workspace_id)
saved_dishes / cost_db / sales_data / cost_history / menu_clusters / audit_log / custom_ingredients
```

**Membership tables** (control access):

- `org_members(organization_id, user_id, role)` — org-wide access (cross-facility for cost_controller / food_engineer)
- `workspace_members(workspace_id, user_id, role)` — facility-scoped access

**Role checks** (DB functions in `public` schema):

- `is_org_member(org_id)`
- `is_org_admin(org_id)`
- `is_workspace_member(ws_id)` — covers org-level inheritance
- `is_workspace_admin(ws_id)` — covers org-level inheritance
- `user_workspace_role(ws_id)` → returns effective role for current user (auth.uid)
- `has_role(ws_id, allowed text[])` → boolean

---

## Roles & permission matrix


| Role                | Scope            | Recipe | Menu  | Cost  | Pricing | Sales | Snapshot       | Members | WS Delete |
| ------------------- | ---------------- | ------ | ----- | ----- | ------- | ----- | -------------- | ------- | --------- |
| **owner**           | workspace or org | C/U/D  | C/U/D | C/U/D | edit    | C/U/D | capture/delete | manage  | ✓         |
| **admin**           | workspace or org | C/U/D  | C/U/D | C/U/D | edit    | C/U/D | capture/delete | manage  | –         |
| **manager**         | workspace        | C/U/D  | C/U/D | C/U   | –       | C/U/D | capture        | –       | –         |
| **chef**            | workspace        | C/U    | C/U   | –     | –       | C/U   | –              | –       | –         |
| **food_engineer**   | workspace or org | C/U/D  | C/U/D | C/U   | edit    | C/U/D | capture        | –       | –         |
| **cost_controller** | workspace or org | –      | –     | C/U   | edit    | C/U   | capture        | –       | –         |
| **viewer**          | workspace        | –      | –     | –     | –       | –     | –              | –       | –         |


Single source of truth: `src/permissions.js#ACTIONS` (mirrors `has_role()` RLS policies).

The frontend uses `data-require="<action>"` (hide) and `data-require-disable="<action>"` (disable) attributes — `applyRoleGates(role, root)` walks the DOM and toggles them.

---

## Critical gotchas

### 1. INSERT...RETURNING with RLS

When inserting into a table with strict SELECT RLS, the RETURNING clause re-applies the SELECT policy. If the new row isn't visible (e.g., because membership trigger hasn't fired or membership tables don't yet include the inserting user), the INSERT throws `42501: new row violates row-level security policy`.

**Pattern we use everywhere:**

- AFTER INSERT trigger adds the creator as owner (SECURITY DEFINER), so by RETURNING time visibility is satisfied
- SELECT policy also includes `created_by = auth.uid()` or `owner_id = auth.uid()` as a fallback

See: `trg_ws_owner_member` and `trg_org_creator_owner`.

### 2. Auto-fill foreign keys via DB defaults

`workspaces.owner_id DEFAULT auth.uid()` and `organizations.created_by DEFAULT auth.uid()` — client doesn't need to send these. Reduces RLS surface area.

### 3. Vercel project framework setting

The Vercel project has `framework: null` set via API (see history — was originally autodetected as Python which broke deploys). If anything weird happens on deploy, verify:

```
curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v9/projects/prj_TQrD1WDAFgN59y6kPjvK4gGvBCg5?teamId=team_x0cSQ3pxQ6mL15at76wVQ8H4" \
  | jq .framework
```

Should return `null`. If not, `PATCH` it back.

### 4. Strong-confirm delete uses normalized comparison

Workspace name has accented characters (`Barceló`). The delete confirm in `app/index.html` normalizes both the typed value and the workspace name (strip diacritics, lowercase, Turkish-aware). Don't break this; users will rage.

### 5. Mobile sidebar

`.sidebar` is fixed-positioned + translateX(-100%) on `≤900px`. The `.is-open` class slides it in. Hamburger button is in `.studio-mobile-top` (only visible on mobile). Focus trap + body scroll lock + ESC close are wired in `src/studio-layout.js`.

---

## How to deploy

From the repo root:

```
npx vercel@latest deploy --prod --yes \
  --token <VERCEL_TOKEN> \
  --scope husamaris-projects
```

Static-only — no build step. Pushes the working tree as-is. Vercel project's Root Directory is the repo root; framework is `null`.

---

## How to add a new module

1. Create `app/studio/<module>.html`
2. Import `mountStudioShell` from `/src/studio-layout.js` and call it with `{ active: '<key>', main }`
3. Use shared components from `styles/tokens.css`:
  - `.modal-backdrop`, `.modal`, `.modal__head/__body/__foot`, `.modal__close`
  - `.empty-state`
  - `.data-table` + `.col-name`, `.col-num`
  - `.icon-btn` + `.btn-error`
  - `.chip` / `.chip-mist` / `.chip-gold` / `.chip-ink`
4. Add to the sidebar nav: edit `MODULES` array in `src/studio-layout.js`
5. Add to studio overview bento: edit `app/studio.html`
6. Add i18n keys to both EN + TR blocks in `src/i18n.js`
7. Tag destructive/edit buttons with `data-require="<action>"` and call `applyRoleGates(role)` after `mountStudioShell`

---

## How to add a new role

1. **DB:** edit the `workspace_members_role_check` and/or `org_members_role_check` constraints (drop + recreate with new role in list)
2. **DB:** if the role should inherit cross-facility, update `user_workspace_role()` function
3. **DB:** update relevant RLS policies (`saved_dishes_`*, `cost_db_*`, etc.) to include the new role in `has_role()` arrays
4. **Frontend:** add the role to `ACTIONS` arrays in `src/permissions.js` for every action it should perform
5. **Frontend:** add `ws.role_<key>` i18n keys (EN + TR)
6. **Frontend:** add the role to invite-role + change-role `<select>` options in `app/index.html`

---

## Legacy parity: B-Kcal-v2 HTML (Teams export)

Reference (local OneDrive, not in repo):  
`/Users/marketingmanagerturkiye/Library/CloudStorage/OneDrive-BarceloHotelGroup/Microsoft Teams Sohbet Dosyaları/B-Kcal-v2 7.html`  
Single-page SPA (`showPage()`), embedded `DEFAULT_DB`, local `localStorage`, hero slider, EN/TR i18n objects.

**Gap summary (legacy has, Carta does not or only partial):**


| Area                | Legacy (B-Kcal v2)                                                                                                                                                                                                    | Carta                                                            |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **Dashboard**       | Menu Intelligence: cluster scope, gaps, health charts, inclusivity, allergen heatmap, carbon (Poore/Nemecek), ingredient + beverage insights, cost rollup, embedded ME matrix + sales mix editor, dashboard PDF/Excel | No aggregated dashboard page; matrix is separate                 |
| **Recipes**         | Food vs drinks pages; Auto-Name; paste text/Excel parse; serving pills; preset galleries (food + cocktails)                                                                                                           | Single `recipes.html`; no parse tab; no presets gallery          |
| **Pantry**          | Full food DB grid + category chips + audit XLSX + custom add; separate beverage ingredients DB                                                                                                                        | `nutrient-db.js` + autocomplete only                             |
| **My Menus**        | All-recipes hub, JSON backup/restore, bulk menu import, cluster UI, side-by-side compare + PNG, share-to-HQ                                                                                                           | Cluster UI missing; no compare; no guest-menu-style builder here |
| **Cost**            | Accountant toolbar: SAP upload, VAT incl/excl, GP/Q/VAT strip, sort/search, audit section                                                                                                                             | Lighter UI; bulk SAP import still TODO (#9)                      |
| **Guest / banquet** | Guest-facing menu generator (layouts, diet filter); banquet scaler + list output                                                                                                                                      | `surface.html` export-focused; no scaler                         |
| **Shell**           | Feedback + Quick Start modals                                                                                                                                                                                         | Not in studio                                                    |


**Product decision:** Either add `app/studio/dashboard.html` that composes widgets (and reuses APIs from recipes, matrix, cost) or keep modules separate and port **subset** of widgets (e.g. allergen heatmap only).

---

## Pending todos (prioritized)

### Sellable-to-first-customer

1. **Per-module UI role gates** — DB enforces; UI should mirror. Tag destructive buttons in `recipes/cost/pricing/matrix/variance.html` with `data-require="<action>"` and call `applyRoleGates(role)` after mount. Pattern is set in `permissions.js`.
2. **Studio top bar org · facility context** — currently sidebar shows only workspace name. Should show `Org → Facility` breadcrumb + facility switcher dropdown for users with multiple facilities.
3. **Plan tier enforcement** — `workspaces.plan` exists (`free|starter|pro|enterprise`) but nothing enforces limits. Free should cap at 20 recipes, 1 user, no team invites.
4. **Billing integration**
  - **iyzico** (TR primary): hosted checkout, webhook → updates `workspaces.plan`
  - **Stripe** (intl): same pattern, separate code path. Currency auto-detect via geo or workspace setting.
5. **Legal pages** — `/legal/privacy.html`, `/legal/terms.html`, `/legal/kvkk.html`, cookie consent banner. KVKK aydınlatma metni for TR market.
6. **Email transactional**
  - Magic link copy is Supabase default — customize via Supabase Auth → Email Templates
  - Welcome email after first workspace creation (Postmark / Resend)
  - Member-invited email (Edge Function trigger)

### Polish / nice-to-haves

1. **Facility switcher** in sidebar — dropdown listing accessible facilities (helpful for cost controllers).
2. **Sales bulk paste** in Matrix — paste from Excel/clipboard into table.
3. **Cost bulk import (.xlsx)** — was in Barceló v4.6 (native DecompressionStream + ZIP central dir walk). Port to `cost.html`.
4. **Allergen icons** — visual chips with icon + label (currently text-only).
5. **Recipe → menu cluster assignment** — currently `menu_clusters` table exists but no UI to group recipes into menus (Breakfast / Lunch / Dinner).
6. **Audit log UI** — `audit_log` table exists but no view; build a timeline page (`app/studio/audit.html`).
7. **Workspace settings page** — currently only Manage modal in selector; add a dedicated settings view inside the studio for currency/VAT/GP/Q-factor + rename + transfer ownership.

### Compliance / Ops

1. **KVKK VERBİS registration** — required before serving paid customers in TR
2. **Data export per workspace** — GDPR right to portability
3. **Data deletion request** — currently delete cascades but no "purge user data" cross-workspace flow
4. **Audit log retention policy** — define how long we keep `audit_log` rows

### B-Kcal / Barcelo HTML parity (from Teams export)

1. **Studio Dashboard** — new module or overview tab: menu scope (cluster), summary KPIs, gaps, macro/kcal/warning tiles, inclusivity + allergen heatmap (optional carbon + beverage blocks), cost rollup, link or embed ME matrix; export **dashboard** PDF + XLSX.
2. **Recipe builder** — paste-from-text/clipboard parse with preview; **Auto-Name** (EN/meta from ingredients); optional serving quick-pills.
3. **Ingredient DB page** — browse/filter `nutrient` data (category chips), custom row, **audit XLSX** export; optional split **beverage** DB.
4. **Presets gallery** — curate starter packs (property menus) loadable into recipe editor.
5. **My Menus hub** — cluster CRUD (fills todo #11), bulk menu file import (xlsx/csv), optional JSON workspace backup/restore; **side-by-side compare** + PNG.
6. **Misafir menu generator** — printable/filterable guest-facing menu (EN/TR) using workspace recipes; align with `surface` exports.
7. **Banquet scaler** — scale recipe to N portions + consolidated ingredient list.
8. **Cost accountant parity** — VAT inclusive/exclusive toggle, parameter strip UX, upload UX aligned with legacy (extends #9).
9. **In-app Help + Feedback** — lightweight quick-start modal + feedback capture (email or ticket hook).

---

## Credentials & secrets

**Where they live (not the values):**

- Supabase URL + publishable key: `src/config.js` (public, OK to commit)
- Supabase service role key: never stored client-side. Use Supabase Dashboard or MCP server-side only
- Vercel token: not committed. Stored in user's password manager
- Domain registrar: Squarespace Domains (manual login)

**Seeded test users** (Barceló org, May 2026):

- `mm.tr@barcelo.com` / `Barcelo-Admin-2026!` — org admin
- `istanbul.acc4@barcelo.com` / `Istanbul-Acc-2026!` — cost_controller @ Istanbul
- `istanbul.pm@barcelo.com` / `Istanbul-PM-2026!` — cost_controller @ Istanbul
- `istanbul.fb4@barcelo.com` / `Istanbul-FB-2026!` — manager @ Istanbul
- `cappadocia.fb2@barcelo.com` / `Cappadocia-FB-2026!` — manager @ Cappadocia
- `taksim.fb2@barcelo.com` / `Taksim-FB-2026!` — manager @ Occidental Taksim

---

## Open questions for product

1. **Org-level Food Engineer scope** — currently can edit recipes in every facility under the org. Is this too broad? Should they be opt-in per facility?
2. **Cost Controller cross-facility** — same question. Default behavior: see all facilities in the org. Confirm.
3. **Workspace ownership transfer** — currently no UI for this. Common SaaS pattern is a 2-step process (current owner picks new owner + confirms). Defer or build now?
4. **Multi-currency at org level** — each facility has its own currency. For consolidated org-level reports (future), we'd need an FX layer. Defer.

---

## Where I'd start if you're picking this up cold

1. Log in as `husam.ari@artifact-studio.com` and create a recipe in one of the seeded Barceló workspaces — confirm the full flow works
2. Read `src/permissions.js` end-to-end (it's the brain of the access model)
3. Skim a module page (`app/studio/recipes.html`) to see the conventions
4. Look at the most recent Supabase migrations via `mcp__08b93852-465e-49da-8d69-514f63f5703e__list_migrations`
5. Pick item #1 from the pending todos (per-module UI role gates) — small surface, big impact, sets the pattern for everything else

— end —