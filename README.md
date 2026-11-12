# ChopWise

> Nigerian meals that fit your health and your wallet.

ChopWise is an AI-based Nigerian recipe recommendation web app. It generates personalised Nigerian meal recommendations based on health conditions, dietary preferences, and a weekly food budget in Naira.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS v4, React Router
- **Auth & DB:** Firebase Auth (Email/Password), Cloud Firestore
- **Server:** Vercel Serverless Functions (`/api`), Node.js, `firebase-admin`, `zod`
- **AI:** Google Gemini API (structured JSON mode via `@google/genai`)
- **Nutrition:** USDA FoodData Central food-composition lookup (with AI-estimate fallback)
- **Testing:** Vitest

## Getting Started

### Prerequisites

- Node.js LTS (v20+)
- npm or pnpm
- Vercel CLI: `npm i -g vercel`

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Jay-kod/chopwise.git
   cd chopwise
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env.local` and fill in the values:
   ```bash
   cp .env.example .env.local
   ```
   See `docs/ARCHITECTURE.md` for details on each variable.

4. Run locally:
   ```bash
   npm run dev
   ```
   > **Note:** Vite middleware serves the `/api` handlers locally. Use `vercel dev` when you need to test the Vercel runtime.

### Temporary Docker share link

For a temporary public testing URL, use the Docker Compose setup. It runs the Vite app and its `/api` handlers with a local MySQL container, then exposes the app through a Cloudflare Quick Tunnel. The link is temporary and changes when the tunnel restarts.

In PowerShell from the project root:

```powershell
.\scripts\Initialize-DockerShare.ps1
docker compose --env-file docker.test.env up --build -d
docker compose logs -f tunnel
```

Open the `trycloudflare.com` URL printed in the tunnel logs and share it with testers. Stop the logs with Ctrl+C; stop the app and tunnel with `docker compose down`. The MySQL data volume is preserved when stopped.

Anyone with the URL can reach the app. Use disposable test data only; do not seed the public test-admin account or enter real health information. The local Docker config is ignored by Git and contains generated local-only secrets. Gemini features remain unconfigured unless a key is added to that private config file.

The app publishes host port `5190` (container port `5173`), so Docker Desktop shows a clickable local address (`http://localhost:5190`). This port is reserved for ChopWise in this setup; check it is still free if you run another container later. The local address is only for this computer; share the Cloudflare `trycloudflare.com` URL with remote testers.

### Testing & Verification

- Run tests: `npm test`
- Color audit: `npm run check:colors`
- Full check (colors + tests + build): `npm run verify`
- Production build: `npm run build`
