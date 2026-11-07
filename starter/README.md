# starter/ — ChopWise brand + theme source files (copied in during task P1)

Colours live in code, in ONE file. Do not edit these files after P1 except `src/styles/theme.css` when you want to change a colour.

| File here | Copy to | Notes |
|---|---|---|
| theme.css | src/styles/theme.css | Import once in `src/main.jsx` (`import './styles/theme.css'`). Replaces any default Tailwind CSS import. |
| theme.js | src/lib/theme.js | Pure helpers |
| useTheme.js | src/lib/useTheme.js | React hook |
| ThemeToggle.jsx | src/components/ThemeToggle.jsx | Put in the navbar of every layout (landing, auth, app, admin) |
| Logo.jsx | src/components/Logo.jsx | Navbar, landing hero, auth pages |
| favicon.svg | public/favicon.svg | Only place besides theme.css allowed to hold hex values |
| index.head.html | paste into `<head>` of index.html | The inline script must stay before the bundles (prevents theme flash) |
| constants.snippet.js | add exports to src/lib/constants.js | `APP_NAME`, `APP_TAGLINE` |
| check-colors.mjs | scripts/check-colors.mjs | Enforces the token-only rule |

package.json scripts to add:
`"check:colors": "node scripts/check-colors.mjs"` and `"verify": "npm run check:colors && vitest run && npm run build"`.

Tailwind: use Tailwind CSS v4 with the official Vite plugin (`@tailwindcss/vite`); follow the current official install guide. Dark mode is class-based (`.dark` on `<html>`) via `@custom-variant` in theme.css. If the colour utilities do not switch in dark mode, fix it inside theme.css only (do not add `dark:` classes to components).

Utilities available (all auto-switch for light/dark): `bg-page bg-surface bg-surface-muted bg-primary bg-primary-hover bg-primary-soft bg-warn-bg bg-danger-bg bg-chip`, `text-fg text-muted text-primary text-on-primary text-on-primary-soft text-warn-fg text-danger-fg`, `border-line border-field-line border-warn-line border-danger-line`, `ring-ring`, `fill-primary fill-on-primary stroke-primary`.
