# Magic link redirects to localhost instead of cart-a.live

## Symptom

Clicking the sign-in / magic link in email opens:

`http://localhost:3000/?code=...`

instead of `https://cart-a.live/...`.

## Cause

Supabase Auth uses two layers:

1. **`emailRedirectTo`** from the app (`signInWithOtp`) — must be on the allow list.
2. **Site URL** in Supabase Dashboard — used as fallback when the requested redirect is not allowed.

If **Site URL** is `http://localhost:3000`, users land on localhost even when the app requests `https://cart-a.live/app/`.

## Fix (Supabase Dashboard)

Project: `hfjgthwaucrfhwkrehxw` → **Authentication** → **URL Configuration**

| Setting | Value |
|---------|--------|
| **Site URL** | `https://cart-a.live` |
| **Redirect URLs** (add all) | `https://cart-a.live/**` |
| | `https://cart-a.live/app/**` |
| | `https://cart-a.live/app/login.html` |
| | `https://cart-a.live/app/signup.html` |

Optional for local dev only:

- `http://localhost:3000/**`
- `http://127.0.0.1:8765/**`

Save, then send a **new** magic link (old e-mails keep the old redirect).

## App-side (already in repo)

`src/auth.js` and `src/workspaces.js` use `PUBLIC_APP_ORIGIN` (`https://cart-a.live`) for all auth e-mail redirects, not `window.location.origin`.
