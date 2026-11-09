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
| page | `bg-page` | #FFFFFF | #0B1410 | App background |
| surface | `bg-surface` | #FFFFFF | #12201A | Cards, inputs, popovers |
| surface-muted | `bg-surface-muted` | #F0FAF4 | #182B22 | Hover, stripes, neutral badges |
| line | `border-line` | #BFD8C9 | #2E4B3C | Card borders, dividers |
| field-line | `border-field-line` | #6B8A78 | #5E8571 | Input and button borders |
| fg | `text-fg` | #0F2A1D | #E8F5EE | Main text |
| muted | `text-muted` | #41584B | #A3BBAE | Secondary text, placeholders |
| primary | `bg-primary` `text-primary` | #047857 | #059669 | Brand: buttons, links, active |
| primary-hover | `bg-primary-hover` | #065F46 | #10B981 | Hover on primary |
| on-primary | `text-on-primary` | #FFFFFF | #FFFFFF | Text on primary |
| primary-soft / on-primary-soft | `bg-primary-soft` `text-on-primary-soft` | #D1FAE5 / #065F46 | #0F3D2B / #A7F3D0 | Success, configured, selected |
| warn-bg / warn-fg / warn-line | `bg-warn-bg` `text-warn-fg` `border-warn-line` | #FEF3C7 / #78350F / #B45309 | #3B2A0B / #FCD34D / #D97706 | Over budget, safety flags, untested |
| danger-bg / danger-fg / danger-line | `bg-danger-bg` `text-danger-fg` `border-danger-line` | #FEE2E2 / #7F1D1D / #B91C1C | #3F1414 / #FCA5A5 / #EF4444 | Errors, failing tests |
| ring | `ring-ring` (focus outline set globally) | #047857 | #6EE7B7 | Keyboard focus |
| chip | `bg-chip` | #FFFFFF | #FFFFFF | Theme-constant white chip (e.g. Edamam badge) |

Contrast (WCAG, computed): all text pairs >= 5.4:1 light and >= 7.3:1 dark (AA needs 4.5); on-primary on primary 5.5:1 light / 7.7:1 dark; input borders (field-line) >= 3.5:1 on their backgrounds in both themes; warn/danger lines >= 4.2:1 on their backgrounds. Re-check if you change a value.

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
- Meal card: name, ₦ cost, short description, meal-type chip, badges (Over budget, safety flags, AI estimate where relevant).
- Meal detail: cost breakdown, ingredients, numbered steps, nutrition panel, Save button, disclaimer, Edamam attribution when Edamam data is shown (place it on `bg-chip` so the badge is legible in both themes).
- States: skeleton/spinner while loading, friendly error with Retry, helpful empty states (e.g. no meals match filters -> Regenerate).
- Disclaimer (dashboard + detail): "General guidance only, not medical advice. Consult a doctor or dietitian for medical conditions."
- Footer: privacy note about storing health information; Edamam attribution where applicable.
- Copy tone: plain, short, friendly; no jargon ("weekly food budget", not "budget cap").
- Navigation: any action reachable within 3 clicks from the dashboard.
- Route namespaces are strict: every customer page route uses `/customer/<page-name>` and every admin page route uses `/admin/<page-name>`. `/` is public landing only; old unprefixed page URLs may only redirect to their canonical namespaced route.
- Motion: minimal; reduced-motion respected (set in theme.css).
