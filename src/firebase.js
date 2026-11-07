import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '';
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || '';
const appId = import.meta.env.VITE_FIREBASE_APP_ID || '';

export const isFirebaseConfigured = Boolean(
  apiKey && authDomain && projectId && appId
);

const firebaseConfig = {
  apiKey: apiKey || 'placeholder-api-key',
  authDomain: authDomain || 'chopwise-placeholder.firebaseapp.com',
  projectId: projectId || 'chopwise-placeholder',
  appId: appId || '1:000000000000:web:placeholder',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

