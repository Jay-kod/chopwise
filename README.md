# ChopWise

> Nigerian meals that fit your health and your wallet.

ChopWise is an AI-based Nigerian recipe recommendation web app. It generates personalised Nigerian meal recommendations based on health conditions, dietary preferences, and a weekly food budget in Naira.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS v4, React Router
- **Auth & DB:** Firebase Auth (Email/Password), Cloud Firestore
- **Server:** Vercel Serverless Functions (`/api`), Node.js, `firebase-admin`, `zod`
- **AI:** Google Gemini API (structured JSON mode via `@google/genai`)
- **Nutrition:** Edamam Nutrition Analysis API (with AI-estimate fallback)
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
   vercel dev
   ```
   > **Note:** Plain `npm run dev` serves only the Vite frontend. Use `vercel dev` to run the `/api` serverless functions alongside the frontend.

### Testing & Verification

- Run tests: `npm test`
- Color audit: `npm run check:colors`
- Full check (colors + tests + build): `npm run verify`
- Production build: `npm run build`

