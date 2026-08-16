# AGENTS.md — VegBazar

Guidance for AI coding agents working in this repository. Read this before making changes.

## Project Overview

VegBazar is a **production, single-page vegetable e-commerce web app** (online marketplace for fresh vegetables & bundles) built with React 19 + Vite 7 + Tailwind CSS 4. It is deployed to a VPS as a PWA at https://vegbazar.store.

The frontend talks to a **separate backend API** (Node.js, not in this repo) through a `/api` proxy. All `/api/*` requests are proxied:
- Dev: `vite.config.js` proxies to `http://localhost:4000/`.
- Prod: Nginx proxies `/api/*` to the backend Node.js process.

There is no test suite. Verification = `npm run lint` + `npm run build`.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server (http://localhost:5173) |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | ESLint on the project |
| `npm run preview` | Preview the production build |

Always run `npm run lint` and `npm run build` after code changes.

## Tech Stack

- **React 19**, react-dom, JSX (`.jsx` files), JS (ESM, `"type": "module"`)
- **Vite 7** with `@vitejs/plugin-react-swc` and `@tailwindcss/vite`
- **Tailwind CSS 4** (utility-first; defined in `src/index.css`)
- **react-router-dom v7** (`BrowserRouter`, `Routes`, `Route`)
- **framer-motion**, **lucide-react**, **react-icons** (icons/animations)
- **react-hook-form** (forms), **i18next** (optional i18n), **axios** (HTTP)
- **@auth0/auth0-react** + custom JWT auth context
- **Razorpay** (payments, loaded dynamically), **react-i18next**
- ESLint 9 flat config (`eslint.config.js`)

## Project Structure

```
src/
├── main.jsx                 # Entry: Auth0Provider > AuthProvider > App
├── App.jsx                  # Router, global context providers, all routes, lazy loading
├── index.css                # Tailwind + global styles/theme
├── Context/                 # Global state providers
│   ├── AuthContext.jsx      # JWT auth, token refresh, ProtectedRoute/PublicRoute
│   ├── OrderContext.jsx     # Order flow state (formData, offers, vegetables, cart items)
│   ├── CartContext.jsx      # Shopping cart state
│   ├── BillContext.jsx      # Billing/order bill state
│   ├── WalletContext.jsx    # Wallet balance & transactions
│   └── ThemeContext.jsx     # Light/dark theme
├── components/              # One file per page/screen (all route views live here)
├── services/
│   └── walletService.js     # axios wrappers for /api/wallet*
└── utils/
    └── analytics.jsx

public/
├── service-worker.js        # PWA: caching, push, background sync, versioned caches
├── offline.html             # Shown when offline
├── site.webmanifest, sitemap.xml, robots.txt, icons, _redirects

index.html                   # HTML entry, SEO meta, PWA manifest link
netlify.toml                 # Build config + /api rewrite + security headers
vite.config.js               # Dev proxy to backend (GITIGNORED — see Gotchas)
```

## Architecture & Routing

- `main.jsx` wraps the app in `<Auth0Provider>` then `<AuthProvider>`.
- `App.jsx` (exported as `VegetableSellingApp`) sets up the provider tree:
  `Router > ThemeProvider > WalletProvider > OrderContext.Provider > CartProvider > BillProvider > (Navbar, PWAInstallBanner, BackButtonHandler, ProgressIndicator, Footer, Routes)`.
- **Lazy loading**: nearly every route component is loaded via `React.lazy` + `<Suspense fallback={<LoadingSpinner/>}>`. Keep this pattern for any new route — never import page components eagerly.
- `OrderContext` (defined inside `App.jsx`) holds order-flow state: `formData`, `selectedOffer`, `offers`, `allVegetables`, `selectedVegetables`, `isOrderPlaced`, `paymentMethod`, `vegetableOrder`, plus `navigate` and `resetOrder`.
- `axios` interceptors are registered in `App.jsx` to attach `Authorization: Bearer <accessToken>` from `localStorage`.
- Routes are public (`/`, `/offers`, `/vegetables`, `/select-vegetables`, `/support`, `/login`, `/register`, `/forgot-password`, `/reset-password/:token`, `/video`) or protected via `<AuthProtectedRoute redirectTo="/login">` (billing, confirmation, order-success, orders, cart, order-failed, wallet, profile, challenge). `/address` is currently unwrapped.

## Key Gotchas & Conventions

- **`vite.config.js` is in `.gitignore`** — it is not tracked. Do not rely on it being modified/committed. The dev `/api` proxy target lives there.
- **Service worker versioning**: every release bumps `APP_VERSION` at the top of `public/service-worker.js` (currently `v1.4.2`). Caches are namespaced `vegbazar-<version>`. When you change app code that must invalidate client caches, bump `APP_VERSION` — this is the established release ritual (see git history: "update app version to vX.Y.Z").
- **Data caching**: baskets and vegetables are cached in `sessionStorage` (`"baskets"`, `"vegetables"`) in `App.jsx` to reduce API calls. Be aware cached data may be stale within a session.
- **Offline handling**: `App.jsx` listens for the `offline` event and redirects to `/offline.html`.
- **Currency**: amounts are formatted as INR (₹) with a shared currency-formatting approach used across cart/billing/order components; handle `undefined` values defensively.
- **Delivery charge**: display logic depends on a subtotal threshold — keep threshold logic consistent between cart and billing.
- **Demo orders**: `BillingSuccess` and `OrderSuccess` show a "demo order" notice — preserve it.
- **Auth**: access token in `localStorage` (`accessToken`, `user`); refresh token is an httpOnly cookie refreshed via `POST /api/auth/refresh-token`. `AuthContext` auto-refreshes ~5 min before expiry and on page-visibility change. Don't break this flow.
- **Payments**: Razorpay scripts/keys are loaded at runtime; wallet top-ups use `initiateAddMoney` / `verifyAddMoney` in `walletService.js`.
- **Environment**: secrets come from `import.meta.env.VITE_*` (e.g. `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`). `.env` files are gitignored; never commit secrets.
- **Components are the pages**: every route view is a component under `src/components/` (e.g. `HomePage.jsx`, `BillingPage.jsx`). Follow the existing naming/structure when adding screens.

## Code Style

- `.jsx` / `.js`, ESM imports, named exports for context providers (`export const AuthProvider`), default exports for components.
- Tailwind utility classes for styling; inline styles only for a few dynamic spinners.
- Existing code is mixed double/single quotes — match the surrounding file (most components use double quotes; `AuthContext.jsx` uses single).
- Do not add code comments unless the surrounding code/pattern requires them; follow existing comment style (`//`, `/* */`).
- Lint config: `no-unused-vars` is an error (with `^[A-Z_]` ignored). React hooks + react-refresh rules are enforced. Keep hooks deps correct.
- Keep the provider hierarchy and lazy-loading pattern intact when adding features.
