import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiClient } from '../../lib/apiClient';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem('chopwise_token');
    if (!token) {
      setUser(null);
      setUserDoc(null);
      setLoading(false);
      return;
    }

    try {
      const res = await apiClient('/api/auth', { action: 'me' });
      if (res?.user) {
        const enrichedUser = {
          ...res.user,
          isAdmin: Boolean(res.isAdmin),
          profileComplete: Boolean(res.user.profileComplete),
        };
        setUser(enrichedUser);
        setUserDoc(enrichedUser);
      } else {
        localStorage.removeItem('chopwise_token');
        setUser(null);
        setUserDoc(null);
      }
    } catch {
      localStorage.removeItem('chopwise_token');
      setUser(null);
      setUserDoc(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function register(email, password, consent, name = '') {
    if (!consent) {
      throw new Error('You must agree to your health information being stored to personalise your meals.');
    }

    const res = await apiClient('/api/auth', {
      action: 'register',
      name: typeof name === 'string' ? name.trim() : '',
      email: email.trim(),
      password,
      consent,
    });

    if (res?.token) {
      localStorage.setItem('chopwise_token', res.token);
      setUser(res.user);
      setUserDoc({
        ...res.user,
        profileComplete: Boolean(res.user.profileComplete),
      });
    }

    return { user: res.user };
  }

  async function login(email, password) {
    const res = await apiClient('/api/auth', {
      action: 'login',
      email: email.trim(),
      password,
    });

    if (res?.token) {
      localStorage.setItem('chopwise_token', res.token);
      let isAdmin = false;
      try {
        const meRes = await apiClient('/api/auth', { action: 'me' });
        isAdmin = Boolean(meRes?.isAdmin);
      } catch {}
      const enrichedUser = {
        ...res.user,
        isAdmin,
        profileComplete: Boolean(res.user?.profileComplete),
      };
      setUser(enrichedUser);
      setUserDoc(enrichedUser);
      return enrichedUser;
    }
  }

  async function logout() {
    localStorage.removeItem('chopwise_token');
    setUser(null);
    setUserDoc(null);
  }

  async function updateAvatar(avatar) {
    const res = await apiClient('/api/auth', { action: 'update-avatar', avatar });
    if (res?.ok) {
      setUser((prev) => (prev ? { ...prev, avatar, profile: { ...prev.profile, avatar } } : prev));
      setUserDoc((prev) => (prev ? { ...prev, avatar, profile: { ...prev.profile, avatar } } : prev));
      await loadProfile();
    }
    return res;
  }

  const value = {
    user,
    userDoc,
    profileComplete: Boolean(userDoc?.profileComplete),
    loading,
    register,
    login,
    logout,
    updateAvatar,
    refreshProfile: loadProfile,
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
