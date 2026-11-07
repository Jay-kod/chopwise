import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setUserDoc(null);
        setLoading(false);
        return;
      }

      // Listen to real-time changes to the user document
      const userRef = doc(db, 'users', currentUser.uid);
      const unsubscribeDoc = onSnapshot(
        userRef,
        (snap) => {
          if (snap.exists()) {
            setUserDoc(snap.data());
          } else {
            setUserDoc(null);
          }
          setLoading(false);
        },
        () => {
          // In case rules deny read or document does not exist yet
          setUserDoc(null);
          setLoading(false);
        }
      );

      return () => unsubscribeDoc();
    });

    return () => unsubscribeAuth();
  }, []);

  /**
   * Register a new user and create their Firestore user profile doc.
   * @param {string} email
   * @param {string} password
   * @param {boolean} consent - Medical data storage consent
   */
  async function register(email, password, consent) {
    if (!consent) {
      throw new Error(
        'You must agree to your health information being stored to personalise your meals.'
      );
    }

    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const now = new Date().toISOString();

    // Create users/{uid} document exactly as defined in docs/DATABASE.md
    await setDoc(doc(db, 'users', cred.user.uid), {
      email: cred.user.email,
      createdAt: now,
      consentAt: now,
      profileComplete: false,
    });

    return cred.user;
  }

  /**
   * Sign in an existing user.
   * @param {string} email
   * @param {string} password
   */
  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    return cred.user;
  }

  /**
   * Sign out the active user.
   */
  async function logout() {
    await signOut(auth);
  }

  const value = {
    user,
    userDoc,
    profileComplete: Boolean(userDoc?.profileComplete),
    loading,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
