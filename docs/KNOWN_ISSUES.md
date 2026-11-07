# KNOWN_ISSUES.md
Agents and I log problems here. Fixed items stay (status: fixed) for the Chapter 4 write-up.

| ID | Severity | Symptom | Reproduction | Root cause | Fix / status |
|----|----------|---------|--------------|------------|--------------|
| ISS-01 | S1 | Blank landing page on Vercel deployment | Accessing production URL returned unbundled index.html referencing /src/main.jsx | Missing `outputDirectory: "dist"` and `framework: "vite"` in `vercel.json` | Fixed (`vercel.json` updated with build and dist configuration) |
| ISS-02 | S1 | Unhandled exception on load if Firebase env is absent | Opening app in fresh environment without `.env.local` threw uncaught error | `initializeApp` threw immediately on `undefined` config values | Fixed (fallback placeholders & `isFirebaseConfigured` guard in `src/firebase.js`) |
| ISS-03 | S3 | Port collision and IPv6 loopback binding on Windows | Vite selected port 5174 and `[::1]` when 5173 was bound by a background task | Vite default dev command did not force IPv4 0.0.0.0 and port 5173 | Fixed (`--host 0.0.0.0 --port 5173` set in `package.json` dev script) |
