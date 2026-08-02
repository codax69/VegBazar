# VegBazar — Design System v2 (Premium Minimal)

Full system overhaul, starting with core components. This document supersedes the color, type, and component sections of the v1 design.md. Layout breakpoints and technical structure from v1 are preserved unless noted.

---

## 1. Why this direction

v1 used a warm-cream-and-shadow look — soft blur, heavy glassmorphism, rounded-2xl everywhere. It's a competent look, but it's also the same look most grocery and marketplace apps reach for, and it doesn't hold up next to a premium farm-to-table brand.

Three changes carry the whole redesign:

1. **One accent, not two.** Green and orange competing for attention on every screen reads busy. Green becomes the only color that does work (primary actions, active states); amber is demoted to a single job — stock alerts and the cart badge — so it stays meaningful instead of becoming wallpaper.
2. **Hairlines instead of shadows.** Elevation communicated through a 1px border and generous spacing, not blur and drop-shadow. This is what makes "minimal" actually read as precise rather than just empty.
3. **A signature grounded in the subject.** Prices and weights render in a monospaced "ledger tag" — a nod to a market weighing scale. It's the one memorable, on-brand device; everything else stays quiet around it.

---

## 2. Color tokens

### Light theme (`:root`)

| Token | Hex | Purpose |
|---|---|---|
| `--color-bg-app` | `#F6F7F3` | App background — sage-tinted stone, not cream |
| `--color-bg-surface` | `#FFFFFF` | Cards, modals, inputs |
| `--color-border` | `#E4E3DC` | Default hairline |
| `--color-border-strong` | `#C9C7BC` | Hover / emphasized divider |
| `--color-text-primary` | `#16241A` | Headings, primary body text |
| `--color-text-secondary` | `#56604F` | Subtitles, nav labels |
| `--color-text-muted` | `#8B9184` | Placeholders, captions, timestamps |
| `--color-brand-green` | `#1B4D2B` | Primary actions, active states, links |
| `--color-brand-green-hover` | `#143A20` | Hover / pressed state |
| `--color-tint-green` | `rgba(27,77,43,0.08)` | Product image placeholders, subtle fills |
| `--color-amber` | `#E2A33B` | Cart badge, stock alerts — nothing else |
| `--color-amber-ink` | `#6B4813` | Text on amber fills |
| `--color-amber-tint` | `rgba(226,163,59,0.15)` | Stock-warning chip background |

### Dark theme (`[data-theme="dark"]`)

| Token | Hex | Purpose |
|---|---|---|
| `--color-bg-app` | `#0F1712` | Deep green-black, not navy |
| `--color-bg-surface` | `#17211B` | Card surfaces |
| `--color-border` | `#263429` | Default hairline |
| `--color-border-strong` | `#33473A` | Hover / emphasized divider |
| `--color-text-primary` | `#F3F6F1` | Primary text |
| `--color-text-secondary` | `#B9C2B3` | Secondary labels |
| `--color-text-muted` | `#7C8778` | Muted labels |
| `--color-brand-green` | `#3FA85C` | Brand accent for dark mode |
| `--color-brand-green-hover` | `#4FBF6E` | Hover / pressed state |
| `--color-tint-green` | `rgba(63,168,92,0.16)` | Product image placeholders |
| `--color-amber` | `#F0B94D` | Cart badge, stock alerts |
| `--color-amber-ink` | `#2A1D06` | Text on amber fills |
| `--color-amber-tint` | `rgba(240,185,77,0.18)` | Stock-warning chip background |

**Rule: amber never appears as a large fill or a decorative accent.** If a design needs a second color for anything other than a stock warning or a badge, use a tint or shade of green first — introducing a third hue is a sign the layout needs simplifying, not more color.

---

## 3. Typography

| Role | Family | Weight | Used for |
|---|---|---|---|
| Wordmark / display | `Fraunces` | 500 / 600 | Logo, page titles, promo headlines |
| UI & body | `Inter` | 400 / 500 | Nav, buttons, body copy, labels |
| Price & weight ledger | `IBM Plex Mono` | 500 | Every price, weight, and stock quantity |

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600&family=Inter:wght@400;500&family=IBM+Plex+Mono:wght@500&display=swap');
```

Down from three overlapping sans/serif roles in v1 to three fonts with non-overlapping jobs. Never use `Fraunces` for UI controls, and never use `Inter` for a price — the mono treatment is what makes the ledger tag recognizable, so it needs to stay exclusive to that role.

**Type scale**

| Token | Size | Weight | Use |
|---|---|---|---|
| `--text-h1` | 28px | 600 | Page titles |
| `--text-h2` | 20px | 600 | Section headers |
| `--text-h3` | 16px | 500 | Card titles, subsection headers |
| `--text-body` | 14px | 400 | Body copy |
| `--text-label` | 13px | 500 | Buttons, nav items |
| `--text-caption` | 11–12px | 400 | Captions, muted metadata |
| `--text-mono` | 12–13px | 500 | Ledger tags (price / weight) |

Line height 1.5 for body, 1.25 for headings. Never go below 11px anywhere, including captions.

---

## 4. Graphical rules

### Spacing
4px base grid: `4, 8, 12, 16, 24, 32, 48, 64`. Card internal padding is 14–16px; section gaps are 24–32px. Don't invent in-between values.

### Corner radius
| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 6px | Chips, inputs, ledger tags |
| `--radius-md` | 10px | Buttons |
| `--radius-lg` | 12px | Cards, modals |
| `--radius-pill` | 20px | Weight-selector pills, badges only |

Nothing else gets `rounded-2xl` or larger. Full-round pills are reserved for genuine toggle/selector controls and status badges — using them on cards or panels is what made v1 read soft rather than precise.

### Elevation
No blur, no glassmorphism. Three levels only:
- **Level 0 (resting):** 1px `--color-border`, no shadow. Used for cards, inputs, the navbar.
- **Level 1 (hover/pressed):** border shifts to `--color-border-strong`. No shadow added.
- **Level 2 (overlay):** modals and dropdowns only — `0 4px 16px rgba(0,0,0,0.10)` in light, `rgba(0,0,0,0.35)` in dark. This is the only place a shadow is allowed.

### Iconography
Outline-style icons only (Lucide or Tabler outline), 1.5px stroke, 18–20px inline / 24px max decorative. No filled icons except a small dot for "active" states. Icons inherit `--color-text-secondary` by default; only recolor to green when the icon itself is the interactive/active element.

### Imagery
Product photography on white or `--color-tint-green` backgrounds only — no colored gradients behind product shots. Where a real photo isn't available, use a flat tint square with a single centered outline icon rather than a gray placeholder box.

---

## 5. Core components

### A. Navbar (`Navbar.jsx`)

**Desktop**
- Fixed top bar, `--color-bg-surface`, 1px bottom border in `--color-border`. No blur.
- Logo: `Fraunces` 600, 19–20px, `--color-text-primary`.
- Nav items: `Inter` 500, 13px, `--color-text-secondary`. Active item: `--color-brand-green` text + 2px bottom border in the same color — no background pill, no rounded highlight box.
- Cart icon: outline icon, badge is a small solid amber circle/pill (`--color-amber` bg, `--color-amber-ink` text), positioned top-right of the icon.
- Theme toggle: 30–32px square icon button, 1px border, sun/moon outline icon, swaps on click.

**Mobile**
- Bottom nav retained from v1 (Home, Basket, Vegetables, Cart, Orders, Support) but flattened: `--color-bg-surface` with a top 1px border instead of a floating shadowed bar. Active tab: icon + label in `--color-brand-green`, others in `--color-text-muted`. No pill background behind the active icon.
- Minimum 44px touch target maintained.

### B. Product card

- Container: `--color-bg-surface`, 1px `--color-border`, `--radius-lg` (12px), 13–16px padding.
- Image area: flat tint square (`--color-tint-green`), 76–80px tall, single centered outline icon as placeholder when no photo.
- Title: `Inter` 500, 13–14px, `--color-text-primary`.
- Subtitle (origin/farm): `Inter` 400, 11px, `--color-text-muted`.
- **Weight selector**: pill buttons (`--radius-pill`), 1px border, `--color-text-secondary`. Active pill: border + text in `--color-brand-green`. No filled/solid active state — border-only keeps it quiet.
- **Price ledger tag** (signature element): `IBM Plex Mono` 500, 12–13px, 1px *dashed* border in `--color-border`, `--radius-sm`, `4–7px` horizontal padding. Format: `₹42 / 500g`. This exact treatment — mono font, dashed border — is reserved for prices and weights only; don't reuse it decoratively elsewhere.
- **Stock warning**: small pill chip, `--color-amber-tint` background, `--color-amber-ink` text, 10–11px, with a small alert-triangle icon. Only appears when stock is genuinely low — never used as a generic label.
- **Add button**: full-width, `--color-brand-green` fill, white text, `--radius-md`, 12px `Inter` 500, small plus icon.

### C. Buttons

| Variant | Fill | Border | Text | Use |
|---|---|---|---|---|
| Primary | `--color-brand-green` | none | white | One per view — the main action (Add to cart, Pay) |
| Secondary | transparent | 1px `--color-brand-green` | `--color-brand-green` | Alternate action alongside a primary (View basket) |
| Ghost | transparent | none | `--color-text-secondary` | Low-emphasis / dismissive action (Skip for now) |
| Disabled | `--color-border` | none | `--color-text-muted` | Out of stock, unavailable action |

Rules:
- **One primary button per screen.** If two actions compete, the second is always secondary or ghost — this was inconsistent in v1's CTA usage.
- Radius `--radius-md` (10px) on all rectangular buttons; padding 9–10px vertical, 18–20px horizontal.
- Hover: darken fill (primary) or shift border/text one step darker (secondary) — no shadow, no scale transform.
- Pressed: `scale(0.98)`, 100ms.
- Disabled buttons stay visually present (not hidden) and never lose their label — avoid disabling silently.

### D. Progress indicator, wallet, AI chatbot

Carried forward structurally from v1 (step tracker position, wallet layout, chatbot placement) but restyled to the same rules: hairline borders instead of shadow, `--color-brand-green` as the only active/accent color, amber reserved for cashback/alert badges only, `Inter` for all UI text, mono for any balance or price figure.

---

## 6. UI/UX rules

### Interaction states
Every interactive element needs five defined states: default, hover, active/pressed, focus, disabled. None of these should introduce a new color — only border weight, fill darkness, or opacity shifts within the existing token set.

### Focus & accessibility
- Visible focus ring on every interactive element: `2px solid --color-brand-green`, `2px` offset. Never remove `:focus-visible` outlines.
- Text contrast: body text against `--color-bg-app` and `--color-bg-surface` must meet WCAG AA (4.5:1). `--color-text-muted` is for captions only, never for anything a user must read to complete a task.
- Touch targets minimum 44×44px on mobile, including the weight-selector pills — pad the hit area even if the visible pill is smaller.
- Icon-only buttons (theme toggle, cart) always carry an `aria-label`.

### Motion
150–200ms ease-out for hover/press transitions. No bounce, no spring easing, no scroll-triggered reveals on commerce screens — motion here should feel efficient, not performative. Respect `prefers-reduced-motion`: disable transform-based transitions, keep color/opacity changes only.

### Responsive behavior
Breakpoints unchanged from v1 (mobile `<640px`, tablet `640–1024px`, desktop `>1024px`). At every breakpoint, card grid gap stays 12–16px and card minimum width stays ≥160px — don't let cards compress below the point where the weight pills wrap awkwardly.

### Content & microcopy
- Sentence case everywhere — buttons, nav labels, card titles. No Title Case, no all-caps except single-letter badges.
- Buttons name the action, verb-first: "Add to cart," not "Submit." "View basket," not "OK."
- Stock and error messages state the fact plainly: "Only 2.5kg left," not "Hurry, almost gone!" Urgency comes from the amber tint, not from copy tone.
- Empty states (empty cart, no orders) get one line naming the space and a single primary action — no filler apology text.

---

## 7. Migration notes from v1

| v1 | v2 | Reason |
|---|---|---|
| Cream bg (`#f3efe6`/`#f7f4ed`) + navy dark mode | Sage-stone light / green-black dark | Cream+navy is the current default look across AI-generated and template apps; a tinted-neutral + single deep green reads distinct and on-brand |
| Green + orange used broadly | Green primary, amber restricted to alerts/badges | Two competing accents read busy; one accent used consistently reads premium |
| `backdrop-blur-lg`, glassmorphism, heavy shadows | 1px hairline borders, shadow reserved for overlays only | Blur and shadow are expensive visually and don't scale to a dense product grid |
| `rounded-xl` / `rounded-2xl` on most surfaces | `--radius-lg` (12px) cards, pill only for selectors/badges | Oversized radius reads soft/generic; restrained radius reads considered |
| 3 fonts (Trirong, Poppins, Funnel Sans) with overlapping roles | 3 fonts (Fraunces, Inter, IBM Plex Mono) with exclusive roles | Non-overlapping roles make the type system legible and give the mono price tag room to become a signature |
| No consistent price treatment | Monospaced dashed-border ledger tag on every price/weight | Gives the product a memorable, subject-grounded visual signature |

---

## 8. Next components to bring into v2

Core components (navbar, product card, buttons) are specced above. Recommended order for the rest of the overhaul: checkout / progress indicator → wallet & payment → AI chatbot widget → empty/error states. Each should reuse the tokens in Sections 2–4 rather than introducing new colors or radii.