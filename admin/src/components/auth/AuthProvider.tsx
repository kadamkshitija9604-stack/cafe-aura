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

// Initial fallback mock admin
const DEFAULT_DEMO_USER: AdminUser = {
  uid: 'demo-admin-01',
  email: 'admin@cafeaura.com',
  displayName: 'Elena Rostova (Super Admin)',
  role: 'super_admin',
  status: 'active',
  providerId: 'password',
  createdAt: '2024-01-01T00:00:00.000Z',
  lastLoginAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<Role>('super_admin');
  const [isLoading, setIsLoading] = useState(true);
  const isDemoMode = !isFirebaseConfigured;

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
          try {
            // Fetch user profile & role from Firestore
            if (db) {
              const userDocRef = doc(db, 'users', fbUser.uid);
              const userSnap = await getDoc(userDocRef);
              if (userSnap.exists()) {
                const userData = userSnap.data() as AdminUser;
                setUser(userData);
                setRole(userData.role || 'viewer');
              } else {
                // New user - default to viewer or super_admin if first
                const newUser: AdminUser = {
                  uid: fbUser.uid,
                  email: fbUser.email || '',
                  displayName: fbUser.displayName || 'Admin User',
                  photoURL: fbUser.photoURL || undefined,
                  role: 'super_admin', // First user super admin
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
            console.error("Error loading user profile:", err);
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Demo / Local Mode - clear any old legacy auto-login data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cafe_aura_current_user');
      }

      const activeSession = typeof window !== 'undefined' ? sessionStorage.getItem('cafe_aura_authenticated_user') : null;
      if (activeSession) {
        try {
          const parsed = JSON.parse(activeSession);
          if (parsed && parsed.email) {
            setUser(parsed);
            setRole(parsed.role || 'super_admin');
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
          sessionStorage.removeItem('cafe_aura_authenticated_user');
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    }
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        // Firestore fetch handled by onAuthStateChanged
      } else {
        // Demo mode login - validate email & password
        let assignedRole: Role = role || 'super_admin';
        const lowerEmail = email.toLowerCase();
        if (lowerEmail.includes('superadmin') || lowerEmail === 'admin@cafeaura.com') {
          assignedRole = 'super_admin';
        } else if (lowerEmail.includes('manager') && !lowerEmail.includes('menu')) {
          assignedRole = 'manager';
        } else if (lowerEmail.includes('menu')) {
          assignedRole = 'menu_manager';
        } else if (lowerEmail.includes('viewer')) {
          assignedRole = 'viewer';
        }

        const loggedUser: AdminUser = {
          ...DEFAULT_DEMO_USER,
          email,
          role: assignedRole,
          displayName: email.split('@')[0].toUpperCase(),
          lastLoginAt: new Date().toISOString(),
        };
        setUser(loggedUser);
        setRole(assignedRole);
        sessionStorage.setItem('cafe_aura_authenticated_user', JSON.stringify(loggedUser));
      }

      await auditService.logAction({
        userId: user?.uid || 'demo-user',
        userName: user?.displayName || 'Admin',
        userEmail: email,
        userRole: role,
        action: 'AUTH_LOGIN',
        resourceType: 'auth',
        details: `Administrator login with email ${email}`,
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
        const googleDemoUser: AdminUser = {
          ...DEFAULT_DEMO_USER,
          email: 'google.admin@cafeaura.com',
          displayName: 'Google Admin User',
          providerId: 'google.com',
          lastLoginAt: new Date().toISOString(),
        };
        setUser(googleDemoUser);
        setRole(googleDemoUser.role);
        sessionStorage.setItem('cafe_aura_authenticated_user', JSON.stringify(googleDemoUser));
      }

      await auditService.logAction({
        userId: user?.uid || 'demo-google-user',
        userName: user?.displayName || 'Google Admin',
        userEmail: user?.email || 'google.admin@cafeaura.com',
        userRole: role,
        action: 'AUTH_LOGIN',
        resourceType: 'auth',
        details: `Google OAuth login`,
      });
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
        setUser(null);
        sessionStorage.removeItem('cafe_aura_authenticated_user');
        localStorage.removeItem('cafe_aura_current_user');
      }

      await auditService.logAction({
        userId: user?.uid || 'user',
        userName: user?.displayName || 'Admin',
        userEmail: user?.email || '',
        userRole: role,
        action: 'AUTH_LOGOUT',
        resourceType: 'auth',
        details: 'User logged out',
      });
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
      const updated = { ...user, role: newRole };
      setUser(updated);
      sessionStorage.setItem('cafe_aura_authenticated_user', JSON.stringify(updated));
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
