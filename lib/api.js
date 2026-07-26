// lib/api.js
//
// Thin fetch wrapper around the SI-Menu backend described in the earlier
// backend deliverables. Kept framework-agnostic (no Next-specific imports)
// so it's reusable from hooks, server components, or tests alike.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

/**
 * requestJson — shared fetch wrapper used by every function below. Centralizes
 * the "network failure vs. non-2xx response vs. success" handling so each
 * endpoint function only needs to describe ITS request, not re-implement
 * error normalization.
 *
 * @param {string} path - path relative to API_BASE_URL, e.g. '/api/menu?res=savory-foods'
 * @param {RequestInit} options - standard fetch options
 * @param {string} networkErrorMessage - shown if the network itself fails (server unreachable)
 */
async function requestJson(path, options = {}, networkErrorMessage = 'Could not reach the SiMenu server.') {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      cache: 'no-store',
      // Required so the browser sends/receives the httpOnly login cookie
      // (see auth.controller.js) even though the frontend (localhost:3000)
      // and backend (localhost:5000) are different origins. Without this,
      // every logged-in request would silently look logged-out.
      credentials: 'include',
      ...options,
      headers: { Accept: 'application/json', ...options.headers },
    });
  } catch (networkError) {
    throw new Error(networkErrorMessage);
  }

  // 204 No Content (not currently used, but safe to handle) has no body to parse.
  const payload = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || `The request failed (status ${response.status}).`);
  }

  return payload?.data;
}

/**
 * Creates a new restaurant + owner account together.
 * Mirrors: POST /api/auth/register
 */
export async function registerOwner({ slug, restaurantName, email, password }) {
  return requestJson(
    '/api/auth/register',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, restaurantName, email, password }) },
    'Could not reach the SiMenu server to create your account.'
  );
}

/**
 * Logs an owner in. `rememberMe: true` gets a 30-day login; otherwise the
 * login naturally ends when the browser is fully closed.
 * Mirrors: POST /api/auth/login
 */
export async function loginOwner({ email, password, rememberMe }) {
  return requestJson(
    '/api/auth/login',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, rememberMe }) },
    'Could not reach the SiMenu server to log in.'
  );
}

/**
 * Sends Google's verified credential to the backend. Handles three outcomes
 * — see auth.controller.js#googleAuth for the full breakdown:
 *   1. Returning owner → logged in, `data.restaurant` present.
 *   2. Brand-new sign-in with no restaurant details yet → `data.needsRestaurantDetails`
 *      is true; the caller should prompt for a restaurant name/slug and call
 *      this again with those included.
 *   3. New signup completed (restaurantName + slug provided) → logged in.
 * Mirrors: POST /api/auth/google
 */
export async function continueWithGoogle({ credential, restaurantName, slug }) {
  return requestJson(
    '/api/auth/google',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, restaurantName, slug }),
    },
    'Could not reach the SiMenu server to sign in with Google.'
  );
}

/**
 * Confirms an emailed verification link.
 * Mirrors: GET /api/auth/verify-email?token=...
 */
export async function verifyEmail(token) {
  return requestJson(
    `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
    {},
    'Could not reach the SiMenu server to verify your email.'
  );
}

/**
 * Requests a fresh verification email for the currently logged-in owner.
 * Mirrors: POST /api/auth/resend-verification
 */
export async function resendVerificationEmail() {
  return requestJson(
    '/api/auth/resend-verification',
    { method: 'POST' },
    'Could not reach the SiMenu server to resend the verification email.'
  );
}

/**
 * Requests a password reset email. Always resolves successfully regardless
 * of whether the email actually has an account — see the backend for why.
 * Mirrors: POST /api/auth/forgot-password
 */
export async function requestPasswordReset(email) {
  return requestJson(
    '/api/auth/forgot-password',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) },
    'Could not reach the SiMenu server to request a password reset.'
  );
}

/**
 * Sets a new password using a valid reset token from the emailed link.
 * Mirrors: POST /api/auth/reset-password
 */
export async function resetPassword(token, newPassword) {
  return requestJson(
    '/api/auth/reset-password',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, newPassword }) },
    'Could not reach the SiMenu server to reset your password.'
  );
}

/**
 * Ends the current login session.
 * Mirrors: POST /api/auth/logout
 */
export async function logoutOwner() {
  return requestJson('/api/auth/logout', { method: 'POST' }, 'Could not reach the SiMenu server to log out.');
}

/**
 * Checks whether a login cookie is currently valid, and if so, who it
 * belongs to. Used on dashboard page load to decide "show dashboard" vs
 * "redirect to login" without asking for credentials again.
 * Mirrors: GET /api/auth/me
 */
export async function fetchCurrentSession() {
  return requestJson('/api/auth/me', {}, 'Could not reach the SiMenu server.');
}

/**
 * Fetches the tenant-scoped menu for a given restaurant slug.
 * Mirrors the backend contract: GET /api/menu?res=<slug>
 *
 * @param {string} restaurantSlug - the "res" identifier from the URL, e.g. "savory-foods"
 * @param {{ includeUnavailable?: boolean }} [options]
 * @returns {Promise<{restaurant: object, categories: string[], menu: Record<string, object[]>}>}
 */
export async function fetchTenantMenu(restaurantSlug, { includeUnavailable = false } = {}) {
  if (!restaurantSlug) {
    throw new Error('A restaurant identifier is required to load the menu.');
  }
  const params = new URLSearchParams({ res: restaurantSlug });
  if (includeUnavailable) params.set('includeUnavailable', 'true');

  return requestJson(`/api/menu?${params.toString()}`, {}, 'Could not reach the SiMenu server. Please check your connection and try again.');
}

/**
 * Creates a new menu item. Mirrors: POST /api/menu?res=<slug>
 */
export async function createMenuItem(restaurantSlug, itemPayload) {
  return requestJson(
    `/api/menu?res=${encodeURIComponent(restaurantSlug)}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(itemPayload) },
    'Could not reach the SiMenu server to create the menu item.'
  );
}

/**
 * Updates any subset of a menu item's fields. Mirrors: PUT /api/menu/:itemId?res=<slug>
 */
export async function updateMenuItem(restaurantSlug, itemId, itemPayload) {
  return requestJson(
    `/api/menu/${itemId}?res=${encodeURIComponent(restaurantSlug)}`,
    { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(itemPayload) },
    'Could not reach the SiMenu server to update the menu item.'
  );
}

/**
 * Flips a single item's availability — the dedicated, lightweight endpoint
 * behind the dashboard's instant toggle switch.
 * Mirrors: PATCH /api/menu/:itemId/availability?res=<slug>
 */
export async function updateItemAvailability(restaurantSlug, itemId, isAvailable) {
  return requestJson(
    `/api/menu/${itemId}/availability?res=${encodeURIComponent(restaurantSlug)}`,
    { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isAvailable }) },
    'Could not reach the SiMenu server to update availability.'
  );
}

/**
 * Permanently deletes a menu item. Mirrors: DELETE /api/menu/:itemId?res=<slug>
 */
export async function deleteMenuItem(restaurantSlug, itemId) {
  return requestJson(
    `/api/menu/${itemId}?res=${encodeURIComponent(restaurantSlug)}`,
    { method: 'DELETE' },
    'Could not reach the SiMenu server to delete the menu item.'
  );
}

/**
 * Uploads a single dish image and returns its public URL. Mirrors:
 * POST /api/uploads/image?res=<slug> (multipart/form-data, field "image")
 *
 * Deliberately NOT routed through requestJson: multipart requests must not
 * set a Content-Type header themselves (the browser needs to set the
 * multipart boundary), whereas every other function here explicitly sets
 * 'Content-Type: application/json'.
 */
export async function uploadMenuImage(restaurantSlug, file) {
  const formData = new FormData();
  formData.append('image', file);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/uploads/image?res=${encodeURIComponent(restaurantSlug)}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
  } catch (networkError) {
    throw new Error('Could not reach the SiMenu server to upload the image.');
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || `The image could not be uploaded (status ${response.status}).`);
  }

  // The backend returns a root-relative path (e.g. "/uploads/savory-foods/169...jpg");
  // resolve it against the API origin so <img> tags work regardless of which
  // origin the frontend itself is served from.
  return { ...payload.data, url: `${API_BASE_URL}${payload.data.url}` };
}

/**
 * Fetches this tenant's existing orders — used once, on the admin dashboard's
 * initial page load, to populate the board before the live socket connection
 * takes over for anything that happens afterward. Mirrors: GET /api/orders?res=<slug>
 */
export async function fetchTenantOrders(restaurantSlug, status) {
  const params = new URLSearchParams({ res: restaurantSlug });
  if (status) params.set('status', status);

  return requestJson(`/api/orders?${params.toString()}`, {}, 'Could not reach the SiMenu server to load orders.');
}

/**
 * Submits a new order for the resolved tenant.
 * Mirrors the backend contract: POST /api/orders?res=<slug>
 */
export async function submitOrder(restaurantSlug, orderPayload) {
  return requestJson(
    `/api/orders?res=${encodeURIComponent(restaurantSlug)}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderPayload) },
    'Could not reach the SiMenu server to place the order.'
  );
}

/**
 * Fetches a single order's current details — used to restore order tracking
 * after a customer reopens the menu page (a refresh, or clicking back).
 * Mirrors: GET /api/orders/:orderId?res=<slug>
 */
export async function fetchOrderById(restaurantSlug, orderId) {
  return requestJson(
    `/api/orders/${orderId}?res=${encodeURIComponent(restaurantSlug)}`,
    {},
    'Could not reach the SiMenu server to check your order.'
  );
}

/**
 * Confirms a real QR-code scan (table + secret key) and receives back a
 * temporary session that expires automatically after a few hours. Called
 * once per visit — the resulting sessionId is then reused for every order
 * placed during that visit (see hooks/useTenantMenu.js).
 * Mirrors: POST /api/restaurants/verify-table?res=<slug>
 */
export async function verifyTableScan(restaurantSlug, table, key) {
  return requestJson(
    `/api/restaurants/verify-table?res=${encodeURIComponent(restaurantSlug)}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table, key }) },
    'Could not verify this table. Please try scanning the QR code again.'
  );
}

/**
 * Owner-dashboard-only: fetches real per-table secret keys for QR code
 * generation. Requires a valid login for this restaurant (protected on the
 * backend by requireAuth + requireOwnerMatchesTenant).
 * Mirrors: GET /api/restaurants/table-keys?res=<slug>&count=<n>
 */
export async function fetchTableKeys(restaurantSlug, count) {
  return requestJson(
    `/api/restaurants/table-keys?res=${encodeURIComponent(restaurantSlug)}&count=${count}`,
    {},
    'Could not generate table QR keys.'
  );
}
