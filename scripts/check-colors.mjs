#!/usr/bin/env node
// Fails (exit 1) if any source file bypasses the theme tokens.
// Allowed colour values live ONLY in src/styles/theme.css (plus favicon.svg and the theme-color meta tags).
// Escape hatch for a justified exception: add the comment  check-colors-ignore  on the same line.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const ROOT = process.cwd();
const TARGETS = ['src', 'index.html'];
const EXTS = new Set(['.js', '.jsx', '.ts', '.tsx', '.css', '.html']);
const SKIP_FILES = new Set([
  join('src', 'styles', 'theme.css'),
  join('src', 'features', 'auth', 'preworkedAvatars.jsx'),
]);
const SKIP_DIRS = new Set([join('src', 'components', 'ui')]);

const PALETTE = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const PREFIX = 'bg|text|border|ring|outline|fill|stroke|from|via|to|divide|placeholder|caret|accent|decoration|shadow';
const RULES = [
  { name: 'raw palette class', re: new RegExp(`\\b(?:${PREFIX})-(?:${PALETTE})-\\d{2,3}\\b`) },
  { name: 'raw white/black class', re: /\b(?:bg|text|border|ring|fill|stroke|divide|outline)-(?:white|black)\b/ },
  { name: 'hex colour', re: /(?<![\w&/])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/ },
  { name: 'colour function', re: /\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/ },
  { name: 'dark: variant (tokens switch automatically)', re: /\bdark:[^\s'"]/ },
  { name: 'inline colour style', re: /style=\{\{[^}]*(?:color|background)/i },
];

function* walk(p) {
  const st = statSync(p, { throwIfNoEntry: false });
  if (!st) return;
  if (st.isDirectory()) {
    const rel = relative(ROOT, p);
    if (SKIP_DIRS.has(rel)) return;
    for (const f of readdirSync(p)) if (f !== 'node_modules') yield* walk(join(p, f));
  } else if (EXTS.has(extname(p))) {
    yield p;
  }
}

const problems = [];
for (const t of TARGETS) {
  for (const file of walk(join(ROOT, t))) {
    const rel = relative(ROOT, file);
    if (SKIP_FILES.has(rel)) continue;
    readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      if (line.includes('check-colors-ignore')) return;
      if (line.includes('name="theme-color"')) return; // browser UI colour meta tags are allowed
      for (const r of RULES) {
        if (r.re.test(line)) problems.push(`${rel}:${i + 1}  ${r.name}: ${line.trim().slice(0, 120)}`);
      }
    });
  }
}

if (problems.length) {
  console.error(`check-colors: ${problems.length} problem(s). Use semantic tokens from src/styles/theme.css.\n`);
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('check-colors: OK (no raw colours outside src/styles/theme.css)');
