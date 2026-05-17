// Carta — agent action-parity capability map (human-readable + machine export).
// Source of truth for UI actions vs planned agent primitives. Update when screens change.

export const CAPABILITY_MAP_VERSION = '1';

/** @typedef {'missing' | 'partial' | 'na'} CapabilityStatus */

export const CAPABILITY_STATUSES = /** @type {const} */ (['missing', 'partial', 'na']);

export const CAPABILITY_MODULES = [
  { id: 'shell', path: 'app/index.html · sidebar' },
  { id: 'pricing_settings', path: 'app/studio/pricing.html' },
  { id: 'recipes', path: 'app/studio/recipes.html' },
  { id: 'cost', path: 'app/studio/cost.html' },
  { id: 'pricing', path: 'app/studio/pricing.html' },
  { id: 'matrix', path: 'app/studio/matrix.html' },
  { id: 'variance', path: 'app/studio/variance.html' },
  { id: 'menus', path: 'app/studio/menus.html' },
  { id: 'presets', path: 'app/studio/presets.html' },
  { id: 'ingredients', path: 'app/studio/ingredients.html' },
  { id: 'surface', path: 'app/studio/surface.html' },
  { id: 'dashboard', path: 'app/studio/dashboard.html' },
  { id: 'audit', path: 'app/studio/audit.html' },
  { id: 'platform', path: 'Supabase / product' },
];

/**
 * @type {Array<{
 *   id: string,
 *   moduleId: string,
 *   uiAction: string,
 *   location: string,
 *   permission: string | null,
 *   tool: string,
 *   promptHint: string,
 *   status: CapabilityStatus,
 *   notes?: string
 * }>}
 */
export const CAPABILITY_ROWS = [
  { id: 'ws_select', moduleId: 'shell', uiAction: 'Select or switch workspace', location: 'app/index.html · sidebar', permission: 'property_switch', tool: 'list_workspaces, set_active_workspace', promptHint: 'Open this facility / kitchen workspace', status: 'missing' },
  { id: 'ws_create', moduleId: 'shell', uiAction: 'Create workspace', location: 'app/index.html', permission: null, tool: 'create_workspace', promptHint: 'Add a new property workspace', status: 'missing' },
  { id: 'ws_delete', moduleId: 'shell', uiAction: 'Delete workspace (confirmed)', location: 'app/index.html · Manage', permission: 'workspace_delete', tool: 'delete_workspace', promptHint: 'Permanently remove this workspace', status: 'missing' },
  { id: 'member_invite', moduleId: 'shell', uiAction: 'Invite member, copy link', location: 'app/index.html · Manage', permission: 'member_manage', tool: 'invite_workspace_member, list_workspace_members', promptHint: 'Invite this email to the team', status: 'missing' },
  { id: 'member_role', moduleId: 'shell', uiAction: 'Change role / remove member', location: 'app/index.html · Manage', permission: 'member_manage', tool: 'set_member_role, remove_workspace_member', promptHint: 'Make them cost_controller / remove access', status: 'missing' },
  { id: 'ws_settings', moduleId: 'pricing_settings', uiAction: 'Edit VAT, target GP, Q-factor', location: 'app/studio/pricing.html · settings strip', permission: 'workspace_update', tool: 'update_workspace_settings', promptHint: 'Set target gross profit or VAT for this workspace', status: 'missing' },
  { id: 'recipe_list', moduleId: 'recipes', uiAction: 'List and open recipes', location: 'app/studio/recipes.html', permission: null, tool: 'list_recipes, get_recipe', promptHint: 'Show dishes in this menu', status: 'missing' },
  { id: 'recipe_cud', moduleId: 'recipes', uiAction: 'Create, update, delete recipe', location: 'app/studio/recipes.html', permission: 'recipe_create / recipe_update / recipe_delete', tool: 'create_recipe, update_recipe, delete_recipe', promptHint: 'Add a recipe, change ingredients, remove dish', status: 'missing' },
  { id: 'recipe_paste', moduleId: 'recipes', uiAction: 'Parse / apply ingredient paste', location: 'app/studio/recipes.html', permission: 'recipe_update', tool: 'parse_ingredient_paste, apply_recipe_patch', promptHint: 'Import lines from clipboard / Excel', status: 'missing' },
  { id: 'cost_crud', moduleId: 'cost', uiAction: 'Cost ledger CRUD', location: 'app/studio/cost.html', permission: 'cost_create / cost_update / cost_delete', tool: 'list_cost_rows, upsert_cost_row, delete_cost_row', promptHint: 'Update MAP price for an ingredient', status: 'missing' },
  { id: 'cost_bulk', moduleId: 'cost', uiAction: 'Bulk SAP / workbook import', location: 'app/studio/cost.html', permission: 'cost_create', tool: 'import_cost_workbook', promptHint: 'Upload SAP extract for this workspace', status: 'partial', notes: 'UI bulk path still evolving' },
  { id: 'price_edit', moduleId: 'pricing', uiAction: 'Edit menu prices, apply suggested', location: 'app/studio/pricing.html', permission: 'pricing_edit', tool: 'list_dish_prices, set_dish_price, apply_suggested_price', promptHint: 'Set menu price to suggested', status: 'missing' },
  { id: 'sales_edit', moduleId: 'matrix', uiAction: 'Edit sold counts, save', location: 'app/studio/matrix.html', permission: 'sales_edit', tool: 'list_sales, set_sales_counts', promptHint: 'Update sales quantities for engineering matrix', status: 'missing' },
  { id: 'sales_paste', moduleId: 'matrix', uiAction: 'Bulk paste sales (TSV)', location: 'app/studio/matrix.html', permission: 'sales_edit', tool: 'bulk_apply_sales_from_tsv', promptHint: 'Paste two-column sales from Excel', status: 'missing' },
  { id: 'snapshot', moduleId: 'variance', uiAction: 'Capture / delete cost snapshot', location: 'app/studio/variance.html', permission: 'snapshot_capture / snapshot_delete', tool: 'capture_cost_snapshot, delete_snapshot', promptHint: 'Take variance snapshot', status: 'missing' },
  { id: 'menu_crud', moduleId: 'menus', uiAction: 'Menu cluster CRUD', location: 'app/studio/menus.html', permission: 'menu_cluster_edit / menu_cluster_delete', tool: 'list_menu_clusters, upsert_menu_cluster, delete_menu_cluster', promptHint: 'Create breakfast cluster, attach recipes', status: 'missing' },
  { id: 'menu_csv', moduleId: 'menus', uiAction: 'Import / export dish CSV', location: 'app/studio/menus.html', permission: 'menu_cluster_edit', tool: 'import_menu_dish_csv, export_menu_dish_csv', promptHint: 'Import dish list from CSV', status: 'missing' },
  { id: 'menu_compare', moduleId: 'menus', uiAction: 'Compare two menus, print', location: 'app/studio/menus.html', permission: null, tool: 'compare_menus, export_menu_compare', promptHint: 'Compare breakfast vs dinner menus', status: 'missing' },
  { id: 'presets', moduleId: 'presets', uiAction: 'Apply starter pack', location: 'app/studio/presets.html', permission: 'recipe_create', tool: 'apply_preset_pack', promptHint: 'Load Turkish breakfast starter pack', status: 'missing' },
  { id: 'ing_filter', moduleId: 'ingredients', uiAction: 'Filter nutrient grid', location: 'app/studio/ingredients.html', permission: null, tool: 'list_reference_ingredients', promptHint: 'Filter ingredient DB by category', status: 'missing' },
  { id: 'ing_export', moduleId: 'ingredients', uiAction: 'Export audit Excel', location: 'app/studio/ingredients.html', permission: 'export', tool: 'export_ingredient_audit_xlsx', promptHint: 'Download audit workbook', status: 'partial', notes: 'Align UI gate with permissions.export' },
  { id: 'ing_custom', moduleId: 'ingredients', uiAction: 'Add / remove custom rows', location: 'app/studio/ingredients.html · localStorage', permission: null, tool: 'sync_custom_ingredient_rows', promptHint: 'Save custom reference rows for workspace', status: 'partial', notes: 'Client-only today; server primitive needed for parity' },
  { id: 'surface_export', moduleId: 'surface', uiAction: 'Export recipes / cost / pricing / matrix workbooks', location: 'app/studio/surface.html', permission: 'export', tool: 'export_surface_bundle', promptHint: 'Export Excel pack for reporting', status: 'missing' },
  { id: 'dash_export', moduleId: 'dashboard', uiAction: 'Export KPI CSV, print', location: 'app/studio/dashboard.html', permission: 'export', tool: 'export_dashboard_csv', promptHint: 'Download dashboard CSV', status: 'missing' },
  { id: 'audit_read', moduleId: 'audit', uiAction: 'Read activity log', location: 'app/studio/audit.html', permission: null, tool: 'list_audit_log', promptHint: 'Show recent audit events', status: 'missing' },
  { id: 'audit_write', moduleId: 'platform', uiAction: 'Append audit event', location: 'Various (not wired in UI)', permission: null, tool: 'append_audit_event', promptHint: 'Log this action for compliance', status: 'partial', notes: 'Table exists; writers not consolidated' },
];

export function getModuleById(moduleId) {
  return CAPABILITY_MODULES.find(m => m.id === moduleId) || { id: moduleId, path: '—' };
}

/** JSON blob for MCP / external agents (same-origin import or download). */
export function buildCapabilityMapExport() {
  return {
    app: 'carta-studio',
    version: CAPABILITY_MAP_VERSION,
    generatedAt: new Date().toISOString(),
    modules: CAPABILITY_MODULES,
    rows: CAPABILITY_ROWS,
  };
}
