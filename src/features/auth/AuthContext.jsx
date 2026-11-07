import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setUserDoc({
          ...data,
          profileComplete: data.profile_complete,
          createdAt: data.created_at,
          consentAt: data.consent_at,
        });
      } else {
        setUserDoc(null);
      }
    } catch {
      setUserDoc(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let channel = null;

    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ? { ...session.user, uid: session.user.id } : null;
      setUser(currentUser);

      if (currentUser) {
        loadProfile(currentUser.id);
        channel = supabase
          .channel(`profile:${currentUser.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'profiles',
              filter: `id=eq.${currentUser.id}`,
            },
            (payload) => {
              if (payload.new) {
                setUserDoc({
                  ...payload.new,
                  profileComplete: payload.new.profile_complete,
                  createdAt: payload.new.created_at,
                  consentAt: payload.new.consent_at,
                });
              }
            }
          )
          .subscribe();
      } else {
        setUserDoc(null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ? { ...session.user, uid: session.user.id } : null;
      setUser(currentUser);
      if (currentUser) {
        loadProfile(currentUser.id);
      } else {
        setUserDoc(null);
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  async function register(email, password, consent) {
    if (!consent) {
      throw new Error(
        'You must agree to your health information being stored to personalise your meals.'
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) throw error;

    // Supabase returns a user with empty identities if email already exists
    if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
      throw new Error('An account with this email already exists. Please log in.');
    }

    const sessionUser = data.user ? { ...data.user, uid: data.user.id } : null;

    if (sessionUser) {
      const now = new Date().toISOString();
      await supabase.from('profiles').upsert({
        id: sessionUser.id,
        email: sessionUser.email,
        created_at: now,
        consent_at: now,
        profile_complete: false,
        profile: {},
      });
    }

    return sessionUser;
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) throw error;
    return data.user ? { ...data.user, uid: data.user.id } : null;
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setUserDoc(null);
  }

  const value = {
    user,
    userDoc,
    profileComplete: Boolean(userDoc?.profileComplete),
    loading,
    register,
    login,
    logout,
    refreshProfile: () => user && loadProfile(user.id),
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
