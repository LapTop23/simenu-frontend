# SiMenu — Digital Menu Frontend

A mobile-first, table-side digital menu built for the SiMenu multi-tenant SaaS platform.
Pairs with the `si-menu-backend` API delivered earlier in this conversation.

## Owner Dashboard preview (menu CRUD + QR codes)

Open **`preview-dashboard.html`** for a live, interactive demo of both features below —
toggle an item's availability, add/edit/delete items, generate a batch of table QR codes,
and try "Print QR Codes" (browser print preview shows the print-only 2-column grid layout).

## Restaurant Admin Management (Menu CRUD)

- **`hooks/useAdminMenu.js`** loads the full catalog (including sold-out items) and exposes
  `addItem` / `editItem` / `toggleAvailability` / `removeItem`, each calling the matching
  backend endpoint (`POST` / `PUT` / `PATCH .../availability` / `DELETE` on `/api/menu`).
  It also joins the same live `menu` room the customer app listens on, so an edit made on
  one admin device appears on another instantly.
- **`components/admin/ToggleSwitch.jsx`** is the instant availability flip: clicking it
  calls `toggleAvailability` immediately (optimistic update, rolled back only if the
  request fails) — no "Save" step, and the backend broadcasts the change over Socket.IO so
  an already-open **customer** tab flips that item to "Sold Out" (see the updated
  `MenuItemCard.jsx`) without a page refresh.
- **`components/admin/MenuItemForm.jsx`** is a fully controlled create/edit form: every
  field is React state, including a dynamic modifiers builder (add/remove groups and
  options) and an image uploader that calls `POST /api/uploads/image` the moment a file is
  chosen, storing the returned URL rather than the raw file.

## Dynamic Table QR Code Generator

- **`components/admin/QRCodeGeneratorPanel.jsx`**: a controlled number input for table
  count; "Generate" builds `{ res, table }` URLs for `1..N` and renders one `QRTableCard`
  per table using `qrcode.react`'s `<QRCodeSVG>` (vector output — stays crisp at any print
  size, unlike a canvas-rendered code).
- **`components/admin/QRTableCard.jsx`** matches the requested card layout exactly: `WELCOME
  TO` / restaurant name / QR code / `TABLE # 05` / "(Scan to Order & Pay)" / divider /
  "Powered by SiMenu · By Sayyam Ijaz".
- **Print flow**: "Print QR Codes" simply calls `window.print()` — no separate print
  template. `.qr-print-page` / `.qr-print-card` in `app/globals.css` only apply extra rules
  inside `@media print` (2-column grid, `break-inside: avoid` so a card never splits across
  a page, hairline borders instead of shadows), so the exact same markup renders the
  on-screen preview and the printed sheet.

## Quick preview (live, two-tab demo)

Open **`preview.html`** in a browser, then click **"Open Live Admin Dashboard (demo)"** —
it opens `preview-admin.html` in a second window. Add items and place an order in the
customer tab; it appears **instantly** in the admin tab with a notification chime. Change
its status there (dropdown or "Mark … →" button) and watch the customer tab's confirmation
screen update its live status pill in real time.

> These two files use `window.postMessage` between the tabs as a **dependency-free stand-in
> for Socket.IO** (a static file can't host a real server). The event names and payload
> shapes (`new-order`, `order-status-updated`, `update-order-status`) are identical to the
> real backend/frontend integration below — only the transport differs.

## Running the real Next.js + Socket.IO integration

1. Drop `app/`, `components/`, `context/`, `hooks/`, and `lib/` into an existing Next.js
   (App Router) project, and merge `tailwind.config.js` / `app/globals.css` / `postcss.config.js`
   into your own. Install `socket.io-client` and `qrcode.react` (already in `package.json`).
2. Set the backend URL (and, optionally, the public site URL used inside generated QR codes):
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
   NEXT_PUBLIC_SITE_URL=https://simenu.com
   ```
3. Run the `si-menu-backend` server (with `socket.io` and `multer` installed) alongside
   this frontend.
4. Customer flow: visit `/menu?res=savory-foods&table=5`.
5. Admin flow: visit `/admin?res=savory-foods` — in production this route should sit behind
   manager authentication, with the tenant slug derived from the logged-in session rather
   than a public query parameter (see the note at the top of `app/admin/page.jsx`).
6. Owner dashboard: visit `/dashboard?res=savory-foods` for menu management + QR codes —
   same production auth note applies (see `app/dashboard/page.jsx`).

## Real-time architecture

- **Transport**: `lib/socket.js` exports a single shared Socket.IO client (`getSocket()`).
  Every component adds/removes its own listeners on that one connection — nobody calls
  `.disconnect()` except the browser tab closing, and every `useEffect` that adds a listener
  returns a cleanup function that calls the matching `socket.off(...)`, so listeners never
  accumulate across re-renders or route changes.
- **Checkout** (`app/menu/page.jsx`): emits `place-order` with an ack callback instead of a
  REST call. The server's ack response IS the created order — no extra round trip needed to
  learn the order number. The same socket is then automatically part of that order's private
  room (joined server-side), so `order-status-updated` events for THIS order arrive with zero
  extra subscription code.
- **Admin dashboard** (`hooks/useAdminOrders.js`): loads existing orders once over REST,
  then emits `join-admin-room` to receive everything that happens afterward live. `new-order`
  prepends a card and plays `useNotificationChime()`; `order-status-updated` patches the
  matching order in place — including updates made from a *different* manager's device, since
  the server rebroadcasts to the whole admin room, not just the socket that triggered it.
- **Status changes flow the other way** through the same channel: the dashboard's `OrderCard`
  dropdown/button calls `updateStatus(orderId, newStatus)`, which emits `update-order-status`;
  the backend re-validates and persists it, then pushes `order-status-updated` to both the
  customer's order room and the tenant's admin room.
- **Live menu updates** (`hooks/useTenantMenu.js` + `hooks/useAdminMenu.js`): both join the
  same `menu` room. `menu-item-created` / `menu-item-updated` / `menu-item-deleted` — emitted
  by the backend after every menu CRUD write — keep the customer menu, and every open admin
  dashboard, in sync with zero polling.

## Design rationale

| Token | Value | Role |
|---|---|---|
| Charcoal Basil (`ink`) | `#1B1F1C` | Primary text |
| Paper | `#F6F5F1` | Page background (cool neutral, not cream) |
| Chili | `#D62828` | CTA / price accent |
| Saffron | `#E7A94C` | Active states, secondary accent |
| Basil | `#1F4D3D` | Header & floating cart surface |
| Sand | `#E7E2D8` | Hairlines, borders |

Type: **Fraunces** (dish/restaurant names, restrained), **Inter** (body/UI), **IBM Plex
Mono** (prices, table number, order totals — tabular figures reinforce the "ticket" motif).

**Signature element:** the floating cart bar is shaped like a torn kitchen order ticket —
a scalloped top edge produced with a pure-CSS `mask` (see `.ticket-edge` in
`app/globals.css`), no image assets. It slides up only once the first item is added and
stays pinned above the thumb, so checkout is always one tap away without scrolling back up.

## Architecture notes

- **URL → tenant context**: `hooks/useTenantMenu.js` is the single place that reads `res`
  and `table` from the URL. Every component below it receives that context as props —
  nothing else touches `window.location` or `useSearchParams` directly.
- **Cart correctness**: `context/CartContext.jsx` keys each cart line by item id **plus**
  a sorted signature of its selected modifiers, so "Burger + extra cheese" and "Burger,
  no modifiers" stack independently instead of merging into one incorrect line.
- **Server-priced checkout**: the frontend never invents a total — the socket `place-order`
  payload carries only `{ menuItemId, quantity, selectedModifiers }` per line, and the
  backend re-prices everything against its own live menu (see `order.service.js` in the
  backend deliverable) before persisting the order.
- **Socket listener hygiene**: every `useEffect` that calls `socket.on(...)` (in
  `app/menu/page.jsx`, `hooks/useAdminOrders.js`, `hooks/useAdminMenu.js`, and
  `hooks/useTenantMenu.js`) returns a cleanup function calling `socket.off(...)` with the
  *same* function reference — not an inline arrow recreated on each render, which would
  silently fail to remove the original listener.
- **Footer branding**: `components/CheckoutFooter.jsx` renders "Powered by SiMenu ·
  Developed by Sayyamm Ijaz" beneath the menu, with a `target="_blank" rel="noopener
  noreferrer nofollow"` anchor — `noopener` stops the linked page from accessing
  `window.opener`, `noreferrer` drops the referrer header, both standard hardening for any
  outbound link on a checkout flow.
- **Mass-assignment protection**: the backend's menu CRUD handlers whitelist exactly which
  fields a request body may set (`WRITABLE_FIELDS` in `menu.controller.js`) — a client can
  never sneak a `restaurantId` reassignment or spoofed timestamp into a create/update call.
