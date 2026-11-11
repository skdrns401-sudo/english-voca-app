import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  isConfigured,
  subscribeToAuthState,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logoutUser,
} from '../firebase';

const AuthContext = createContext({
  user: null,
  loading: true,
  isConfigured: false,
  signInGoogle: async () => {},
  signInEmail: async () => {},
  signUpEmail: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToAuthState((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    return await loginWithGoogle();
  };

  const handleEmailLogin = async (email, password) => {
    return await loginWithEmail(email, password);
  };

  const handleEmailRegister = async (email, password, displayName) => {
    return await registerWithEmail(email, password, displayName);
  };

  const handleLogout = async () => {
    return await logoutUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured,
        signInGoogle: handleGoogleLogin,
        signInEmail: handleEmailLogin,
        signUpEmail: handleEmailRegister,
        signOut: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
