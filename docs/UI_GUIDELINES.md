# UI_GUIDELINES.md

## Brand
- Product name: **ChopWise**. Tagline: "Nigerian meals that fit your health and your wallet."
- `APP_NAME` and `APP_TAGLINE` live in `src/lib/constants.js`; use them for page titles, footer, emails, aria labels.
- Wordmark/icon: `src/components/Logo.jsx` ("Chop" in text colour, "Wise" in brand green). Favicon: `public/favicon.svg`.
- Source files for brand and theme are in `starter/` (see `starter/README.md`); P1 copies them into place.

## Theme system: colours live in code, in ONE file
Single source: `src/styles/theme.css` (Tailwind v4 `@theme static` for light values, `.dark { ... }` for dark values). Light, dark and system modes are built in from day one.

### Tokens (use these utilities, nothing else)
| Token | Utilities | Light | Dark | Use |
|---|---|---|---|---|
| page | `bg-page` | #F6F9F7 | #0B1410 | App background (crisp separation from white cards) |
| surface | `bg-surface` | #FFFFFF | #12201A | Cards, inputs, popovers |
| surface-muted | `bg-surface-muted` | #EAF5EF | #182B22 | Hover, stripes, neutral badges |
| line | `border-line` | #C6DDD0 | #2D4C3C | Card borders, dividers |
| field-line | `border-field-line` | #4D755F | #5E8571 | Input and button borders (>= 3.5:1 contrast) |
| fg | `text-fg` | #0A2117 | #FFFFFF | Main text |
| muted | `text-muted` | #2A4838 | #B8D9C8 | Secondary text, placeholders (>= 9:1 AAA contrast) |
| primary | `bg-primary` `text-primary` | #047857 | #059669 | Brand: buttons, links, active |
| primary-hover | `bg-primary-hover` | #065F46 | #10B981 | Hover on primary |
| on-primary | `text-on-primary` | #FFFFFF | #FFFFFF | Text on primary |
| primary-soft / on-primary-soft | `bg-primary-soft` `text-on-primary-soft` | #D1FAE5 / #065F46 | #0F3D2B / #A7F3D0 | Success, configured, selected |
| warn-bg / warn-fg / warn-line | `bg-warn-bg` `text-warn-fg` `border-warn-line` | #FEF3C7 / #78350F / #B45309 | #3B2A0B / #FCD34D / #D97706 | Over budget, safety flags, untested |
| danger-bg / danger-fg / danger-line | `bg-danger-bg` `text-danger-fg` `border-danger-line` | #FEE2E2 / #7F1D1D / #B91C1C | #3F1414 / #FCA5A5 / #EF4444 | Errors, failing tests |
| ring | `ring-ring` (focus outline set globally) | #047857 | #6EE7B7 | Keyboard focus |
| chip | `bg-chip` | #FFFFFF | #FFFFFF | Theme-constant white chip (e.g. USDA badge) |
| cat-planning-fg/bg/line/dot | `text-cat-planning-fg` `bg-cat-planning-bg` `border-cat-planning-line` `bg-cat-planning-dot` | #0369A1 / #E0F2FE / #BAE6FD / #0284C7 | #38BDF8 / #0C2B42 / #15476B / #38BDF8 | Sidebar: Planning & Insights / Overview & Monitoring |
| cat-meals-fg/bg/line/dot | `text-cat-meals-fg` `bg-cat-meals-bg` `border-cat-meals-line` `bg-cat-meals-dot` | #92400E / #FEF3C7 / #FDE68A / #D97706 | #FBBF24 / #36200A / #58350F / #F59E0B | Sidebar: Meals & Recipes / Food & User Operations |
| cat-health-fg/bg/line/dot | `text-cat-health-fg` `bg-cat-health-bg` `border-cat-health-line` `bg-cat-health-dot` | #065F46 / #D1FAE5 / #A7F3D0 / #059669 | #34D399 / #0B281E / #134E39 / #10B981 | Sidebar: Account & Health |
| cat-engine-fg/bg/line/dot | `text-cat-engine-fg` `bg-cat-engine-bg` `border-cat-engine-line` `bg-cat-engine-dot` | #6D28D9 / #F3E8FF / #DDD6FE / #7C3AED | #C084FC / #261445 / #432174 / #A855F7 | Sidebar: AI & Clinical Engine |
| cat-governance-fg/bg/line/dot | `text-cat-governance-fg` `bg-cat-governance-bg` `border-cat-governance-line` `bg-cat-governance-dot` | #9F1239 / #FFE4E6 / #FECDD3 / #E11D48 | #FB7185 / #3E101D / #661A30 / #F43F5E | Sidebar: Governance & Tools |

Contrast (WCAG, computed): all text pairs >= 9.0:1 light (AAA) and >= 11.0:1 dark (AAA); on-primary on primary 5.4:1 light / 7.7:1 dark; input borders (field-line) >= 3.5:1 on their backgrounds in both themes; warn/danger lines >= 4.2:1 on their backgrounds. Re-check if you change a value.

### Rules (enforced by `npm run check:colors`, part of `npm run verify`)
1. Components use semantic utilities from the table only. No raw palette classes (`bg-emerald-600`, `text-gray-500`), no `bg-white`/`text-black`, no hex/rgb/hsl, no inline colour styles.
2. No `dark:` variants. Tokens switch automatically with the `.dark` class on `<html>`.
3. Colour values exist only in `src/styles/theme.css` (plus `public/favicon.svg` and the `theme-color` meta tags). A justified exception needs the comment `check-colors-ignore` on that line.
4. To change a colour or the whole look: edit `theme.css` only. Nothing else should need to change.
5. Every screen must be checked in BOTH light and dark mode (375 px and desktop) before a task is marked done.

### Dark mode behaviour
- Three states: **System** (default), **Light**, **Dark**. Stored under `chopwise-theme` in localStorage.
- An inline script in `index.html` `<head>` applies the theme before first paint (no flash). `color-scheme` is set so native controls match.
- `ThemeToggle` (cycles System -> Light -> Dark) appears in the navbar of every layout: landing, auth, app and admin.

### Status and component mapping
| Element | Classes |
|---|---|
| Page | `bg-page text-fg` |
| Card | `bg-surface border border-line rounded-xl` |
| Primary button | `bg-primary text-on-primary hover:bg-primary-hover` |
| Secondary button | `bg-surface text-fg border border-field-line hover:bg-surface-muted` |
| Input / select | `bg-surface text-fg border border-field-line` (placeholder uses muted automatically) |
| Link | `text-primary underline hover:text-primary-hover` |
| OK / configured / saved / selected chip | `bg-primary-soft text-on-primary-soft` + check icon + text |
| Warning (over budget, safety flag, untested) | `bg-warn-bg text-warn-fg border border-warn-line` + warning icon + text |
| Error / failing | `bg-danger-bg text-danger-fg border border-danger-line` + icon + text |
| Neutral (AI estimate, not configured, info) | `bg-surface-muted text-muted border border-line` + text |
Never rely on colour alone: every status has an icon and/or text.
Green means "good/brand" only. Flagged or over-budget meals are never shown in green.

## Layout and components
- Mobile-first; works at 375 px; no horizontal page scroll (tables scroll inside their container).
- Tailwind only; no extra UI library. Font: system sans (token `--font-sans`).
- Components in `src/components`: Button, Card, Input, Select, Badge, Spinner, ErrorState, EmptyState, Disclaimer, Toast, Logo, ThemeToggle. Reuse them; do not restyle per page.
- Naira format everywhere: `₦1,200` (use `format.js`).
- Every form field has a visible label, inline validation message and correct input type; buttons and tap targets >= 44 px (`min-h-11`).
- Meal card: name, estimated ingredient cost in ₦, short description, meal-type chip, badges (Over budget, safety flags, AI estimate where relevant).
- Recipe catalogue: show full recipes; label the ₦ amount as estimated ingredient cost, not a selling price.
- Meal detail: cost breakdown, ingredients, numbered steps, nutrition panel, Save button, disclaimer, USDA attribution when USDA data is shown.
- States: skeleton/spinner while loading, friendly error with Retry, helpful empty states (e.g. no meals match filters -> Regenerate).
- Disclaimer (dashboard + detail): "General guidance only, not medical advice. Consult a doctor or dietitian for medical conditions."
- Footer: privacy note about storing health information.
- Copy tone: plain, short, friendly; no jargon ("weekly food budget", not "budget cap").
- Navigation: any action reachable within 3 clicks from the dashboard.
- Active dashboard sidebar destinations use a compact, mildly rounded (`rounded-md`) surface-muted row, a narrow primary marker at the left edge, emphasized foreground text/icon, and a trailing chevron. Apply the same active treatment in customer, admin, and mobile navigation; identify the current route with `aria-current="page"`.
- The admin sidebar shows administrator destinations only. Customer-app navigation belongs on the main welcome page, and the health-check action belongs on `/admin/dashboard`, not in the sidebar.
- Route namespaces are strict: every customer page route uses `/customer/<page-name>` and every admin page route uses `/admin/<page-name>`. `/` is public landing only; old unprefixed page URLs may only redirect to their canonical namespaced route.
- Motion: minimal; reduced-motion respected (set in theme.css).
- Scrollbars: modern thin 6px pill scrollbars across the application with transparent tracks, no bulky buttons, and themed line/field-line tokens in light and dark modes.
