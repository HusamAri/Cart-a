// Carta — Workspace plan quotas (mirrors product marketing + DB triggers)

export const FREE_PLAN_MAX_RECIPES = 20;

/** @param {string | null | undefined} plan */
export function isFreePlan(plan) {
  return (plan || 'free').toLowerCase() === 'free';
}

/** Max recipes, or null when unlimited. */
export function recipeLimitForPlan(plan) {
  return isFreePlan(plan) ? FREE_PLAN_MAX_RECIPES : null;
}

/** Free tier: owner only; no additional workspace members. */
export function planAllowsAdditionalMembers(plan) {
  return !isFreePlan(plan);
}

/**
 * @param {string | null | undefined} plan
 * @param {number} currentCount recipes already in workspace
 * @param {number} adding conservative number of new rows (default 1)
 */
export function canAddRecipes(plan, currentCount, adding = 1) {
  const lim = recipeLimitForPlan(plan);
  if (lim == null) return { ok: true, limit: null, remaining: null };
  const remaining = Math.max(0, lim - currentCount);
  return {
    ok: adding <= remaining,
    limit: lim,
    remaining,
  };
}

/** Map Supabase / PostgREST errors to i18n keys (caller runs t()). */
export function planLimitMessageKey(err) {
  const msg = String(err?.message || err || '');
  if (msg.includes('CARTA_FREE_PLAN_RECIPE_LIMIT')) return 'plan.err_recipe_limit';
  if (msg.includes('CARTA_FREE_PLAN_MEMBER_LIMIT')) return 'plan.err_member_limit';
  return null;
}
