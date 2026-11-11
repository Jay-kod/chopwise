# ChopWise Deployment Guide (Vercel + Firebase)

Follow these exact steps to link, configure, and deploy ChopWise to Vercel with Cloud Firestore and Firebase Auth.

## Temporary Docker testing link

The project also supports a temporary Docker-based public link for testing. Docker runs the existing Vite middleware (including `/api` handlers) and a local MySQL database; Cloudflare Quick Tunnels provides a temporary `trycloudflare.com` URL without requiring a Cloudflare account or domain.

From the project root in PowerShell:

```powershell
.\scripts\Initialize-DockerShare.ps1
docker compose --env-file docker.test.env up --build -d
docker compose logs -f tunnel
```

Share the URL printed by the `tunnel` service. Anyone with that URL can reach the app, and the URL changes after the tunnel stops. Stop the app with `docker compose down`; the named MySQL volume is preserved. Use disposable test data only, and do not seed the public test-admin account or enter real health information. The generated `docker.test.env` is local-only and Git-ignored. Gemini is not configured unless its key is added to that file.

Cloudflare Quick Tunnels are for testing and development, have no uptime guarantee, and stop working when the tunnel stops. See [Cloudflare Quick Tunnels](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/).

---

## 1. Prerequisites
- **GitHub Repository**: [https://github.com/Jay-kod/chopwise.git](https://github.com/Jay-kod/chopwise.git)
- **Firebase Console**: A Firebase project with **Authentication** (Email/Password provider enabled) and **Cloud Firestore** initialized.
- **Vercel Account**: Installed Vercel CLI (`npm i -g vercel`) or Vercel Web Dashboard.

---

## 2. Publish Firestore Security Rules
Before deploying, Firestore security rules must be published to protect user health data and deny client access to server config:

### Option A: Firebase CLI (recommended)
From your local project root:
```bash
firebase login
firebase use <your-firebase-project-id>
firebase deploy --only firestore:rules
```

### Option B: Firebase Console
1. Open the **Firebase Console** -> your project -> **Firestore Database** -> **Rules** tab.
2. Replace all contents with the code from [`firestore.rules`](../firestore.rules).
3. Click **Publish**.

---

## 3. Generate Required Bootstrap Keys

### A. 32-Byte Encryption Key (`CONFIG_ENCRYPTION_KEY`)
Run this in PowerShell or terminal to generate a fresh AES-256-GCM encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Keep this key secure. It encrypts your Gemini and USDA API keys in the server-side MySQL configuration.

### B. Firebase Service Account (`FIREBASE_SERVICE_ACCOUNT_B64`)
1. In Firebase Console: Project Settings -> **Service accounts** tab.
2. Click **Generate new private key** (downloads a `.json` file).
3. Convert that file to base64:
   - **PowerShell (Windows)**:
     ```powershell
     [Convert]::ToBase64String([IO.File]::ReadAllBytes("path\to\service-account.json"))
     ```
   - **macOS / Linux**:
     ```bash
     base64 -w 0 path/to/service-account.json
     ```
4. Copy the single-line base64 output. (Delete the downloaded `.json` file from your computer afterwards).

---

## 4. Link Project in Vercel
In your project directory:
```bash
vercel link
```
Follow the interactive prompts to link this repository to your Vercel team/account.

---

## 5. Configure Environment Variables in Vercel
Set the following environment variables in Vercel (**Project Settings -> Environment Variables**, or via `vercel env add <NAME>`):

### Client Variables (Applied to Production, Preview, Development):
| Name | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Web API key from Firebase project settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | `<project-id>.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase Project ID |
| `VITE_FIREBASE_APP_ID` | Web App ID from Firebase settings |

### Server-Only Variables (Production, Preview, Development):
| Name | Description |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT_B64` | Base64-encoded Firebase Service Account JSON string |
| `ADMIN_UIDS` | Comma-separated Firebase Auth UIDs granted admin access |
| `CONFIG_ENCRYPTION_KEY` | 32-byte base64 string generated in step 3A |

*(Note: the USDA API key does NOT belong in a Vercel environment variable; paste it into the encrypted Admin page at `/admin/usda`. Gemini can be configured through its Admin integration card.)*

---

## 6. Pre-Deploy Verification
Before running production deploy, verify that the project passes all checks:
```bash
npm run verify
```
This runs:
1. `npm run check:colors` (verifies zero raw colors outside `theme.css`).
2. `vitest run` (runs all unit tests).
3. `npm run build` (verifies Vite production bundle).

---

## 7. Deploy to Production
When instructed, deploy to production with:
```bash
vercel --prod
```

### Note on `maxDuration`:
The project `vercel.json` defines `"maxDuration": 30` for `api/*.js` to permit Gemini AI generation within serverless limits. On modern Vercel Hobby accounts, this is supported up to 60s. If your specific Vercel account flags an error during deploy, remove the `maxDuration` block in `vercel.json` and deploy again.

---

## 8. Post-Deploy Smoke Test (Day 2)
1. Open the deployed URL.
2. Sign up with a new email and check the medical consent checkbox.
3. Complete the 4-step onboarding flow.
4. Open `/admin/dashboard` as an authorized Admin UID:
   - Check the **Bootstrap Checklist** (all green).
   - Enter your **Google Gemini API Key** and model name.
   - Open `/admin/usda` and enter the USDA data.gov API key, then enable and test the integration.
   - Click **Test all** in Section A (Functions Table) and verify all rows turn green.
5. Return to `/customer/dashboard` and click **⚡ Regenerate Plan** to generate personalized Nigerian meal recommendations!

### Login test-account shortcuts
The login page shortcuts for `chop1@test.com` (Test User) and `adminchop@test.com` (Test Admin) fill both fields using the shared test password `password1`. Create both accounts through the app's registration flow and set each password to `password1` in Firebase Auth; the shortcuts do not create accounts or bypass password authentication. Add the Test Admin's Firebase UID to `ADMIN_UIDS` to grant admin access. These credentials are public in the deployed client; use disposable test accounts without sensitive health data.
