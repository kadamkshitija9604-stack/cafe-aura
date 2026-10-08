'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, isFirebaseConfigured, db } from '@/lib/firebase/config';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Role } from '@/types/rbac';
import { AdminUser } from '@/types/user';
import { auditService } from '@/lib/services/auditService';

interface AuthContextType {
  user: AdminUser | null;
  firebaseUser: FirebaseUser | null;
  role: Role;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setDemoRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<Role>('viewer');
  const [isLoading, setIsLoading] = useState(true);
  const isDemoMode = !isFirebaseConfigured;

  useEffect(() => {
    // 1. If Firebase Auth is configured in environment
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
          try {
            if (db) {
              const userDocRef = doc(db, 'users', fbUser.uid);
              const userSnap = await getDoc(userDocRef);
              if (userSnap.exists()) {
                const userData = userSnap.data() as AdminUser;
                setUser(userData);
                setRole(userData.role || 'viewer');
              } else {
                const newUser: AdminUser = {
                  uid: fbUser.uid,
                  email: fbUser.email || '',
                  displayName: fbUser.displayName || 'Admin User',
                  photoURL: fbUser.photoURL || undefined,
                  role: 'super_admin',
                  status: 'active',
                  providerId: fbUser.providerData[0]?.providerId === 'google.com' ? 'google.com' : 'password',
                  createdAt: new Date().toISOString(),
                  lastLoginAt: new Date().toISOString(),
                };
                await setDoc(userDocRef, newUser);
                setUser(newUser);
                setRole(newUser.role);
              }
            }
          } catch (err) {
            console.error('Error loading user profile:', err);
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      // 2. Production Server Session Validation via HTTP-only cookie
      async function checkServerSession() {
        try {
          const res = await fetch('/api/auth/session', {
            method: 'GET',
            credentials: 'include',
          });

          if (res.ok) {
            const data = await res.json();
            if (data.authenticated && data.user) {
              setUser(data.user);
              setRole(data.user.role || 'viewer');
            } else {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        } catch (err) {
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      }

      checkServerSession();
    }
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        await signInWithEmailAndPassword(auth, email, pass);
      } else {
        // Authenticate against server endpoint which verifies credentials and sets secure cookie
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password: pass }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          const errorMessage = data?.error?.message || data?.message || 'Invalid email or password';
          throw new Error(errorMessage);
        }

        setUser(data.user);
        setRole(data.user.role || 'viewer');
      }

      await auditService.logAction({
        userId: user?.uid || 'authenticated-user',
        userName: user?.displayName || email,
        userEmail: email,
        userRole: role,
        action: 'AUTH_LOGIN',
        resourceType: 'auth',
        details: `Administrator sign in with email ${email}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth && googleProvider) {
        await signInWithPopup(auth, googleProvider);
      } else {
        throw new Error('Google OAuth requires Firebase configuration.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      } else {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        }).catch(() => {});
        setUser(null);
      }

      if (typeof window !== 'undefined') {
        localStorage.removeItem('cafe_aura_current_user');
        sessionStorage.removeItem('cafe_aura_authenticated_user');
        window.location.href = '/login';
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (isFirebaseConfigured && auth) {
      await sendPasswordResetEmail(auth, email);
    }
    await auditService.logAction({
      userId: 'system',
      userName: email,
      userEmail: email,
      userRole: 'viewer',
      action: 'AUTH_PASSWORD_RESET',
      resourceType: 'auth',
      details: `Password reset email requested for ${email}`,
    });
  };

  const setDemoRole = (newRole: Role) => {
    setRole(newRole);
    if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        role,
        isLoading,
        isAuthenticated: !!user,
        isDemoMode,
        loginWithEmail,
        loginWithGoogle,
        logout,
        resetPassword,
        setDemoRole,
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
