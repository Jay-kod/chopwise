import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { AppError } from './http.js';

let appInstance = null;
let adminAuth = null;
let adminDb = null;

function initFirebaseAdmin() {
  if (appInstance) {
    return { adminAuth, adminDb };
  }

  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
  if (!b64) {
    throw AppError.notConfigured(
      ['FIREBASE_SERVICE_ACCOUNT_B64'],
      'Firebase Admin SDK is not configured. Missing FIREBASE_SERVICE_ACCOUNT_B64 in environment.'
    );
  }

  let serviceAccount;
  try {
    const jsonStr = Buffer.from(b64, 'base64').toString('utf8');
    serviceAccount = JSON.parse(jsonStr);
  } catch (err) {
    throw new AppError(
      'INTERNAL',
      'FIREBASE_SERVICE_ACCOUNT_B64 is not valid base64-encoded JSON.',
      500
    );
  }

  try {
    appInstance =
      getApps().length === 0
        ? initializeApp({
            credential: cert(serviceAccount),
          })
        : getApps()[0];

    adminAuth = getAuth(appInstance);
    adminDb = getFirestore(appInstance);
  } catch (err) {
    throw new AppError(
      'INTERNAL',
      `Failed to initialize Firebase Admin: ${err.message}`,
      500
    );
  }

  return { adminAuth, adminDb };
}

export function getAdminAuth() {
  const { adminAuth } = initFirebaseAdmin();
  return adminAuth;
}

export function getAdminDb() {
  const { adminDb } = initFirebaseAdmin();
  return adminDb;
}

export function isFirebaseAdminConfigured() {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_B64);
}

