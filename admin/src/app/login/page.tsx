'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Coffee, Lock, Mail, Sparkles, ShieldAlert, Loader2 } from 'lucide-react';
import { ROLE_DEFINITIONS, Role } from '@/types/rbac';

function LoginFormContent() {
  const [email, setEmail] = useState('admin@cafeaura.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { loginWithEmail, loginWithGoogle, setDemoRole, isDemoMode } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().replace(/\s+/g, '');
    if (!cleanEmail || !password) {
      error('Validation Error', 'Please fill in both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      await loginWithEmail(cleanEmail, password);
      success('Welcome Back', 'Signed in to Cafe Aura Admin.');
      router.push(redirect);
    } catch (err: any) {
      error('Login Failed', err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      await loginWithGoogle();
      success('Welcome Back', 'Signed in via Google Authentication.');
      router.push(redirect);
    } catch (err: any) {
      error('Google Sign-In Failed', err.message || 'Could not complete Google authentication.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleQuickDemoRole = (role: Role, demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setDemoRole(role);
  };

  return (
    <div className="min-h-screen bg-espresso-950 flex flex-col justify-center items-center p-4 sm:p-6 text-aura-100 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-caramel-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-aura-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-caramel-600 to-caramel-400 text-espresso-950 font-bold shadow-xl shadow-caramel-500/20 mb-4">
            <Coffee className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-aura-50 tracking-tight">
            Cafe Aura Admin
          </h1>
          <p className="text-sm text-aura-300 mt-1">
            Sign in to access your café management console
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-espresso-900/90 border border-aura-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleEmailLogin} noValidate className="space-y-4">
            <Input
              label="Email Address"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value.replace(/\s+/g, ''))}
              placeholder="admin@cafeaura.com"
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-aura-300">
                  Password
                </label>
                <a
                  href="/forgot-password"
                  className="text-xs text-caramel-400 hover:text-caramel-300 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="text-aura-400 hover:text-aura-100 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                }
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
              size="lg"
            >
              Sign In to Dashboard
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="border-t border-aura-800 w-full" />
            <span className="bg-espresso-900 px-3 text-xs text-aura-400 uppercase tracking-wider relative">
              Or
            </span>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-3 bg-espresso-950/60 hover:bg-espresso-950"
            onClick={handleGoogleLogin}
            isLoading={isGoogleLoading}
            size="lg"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Quick Role Fill Demo Buttons */}
          {isDemoMode && (
            <div className="mt-8 pt-6 border-t border-aura-800/60">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-caramel-400 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Quick Test Logins (Demo RBAC)</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoRole('super_admin', 'superadmin@cafeaura.com')}
                  className="text-left p-2 rounded-lg bg-espresso-950 border border-purple-500/30 hover:border-purple-500 text-xs transition-colors"
                >
                  <p className="font-semibold text-purple-300">Super Admin</p>
                  <p className="text-[10px] text-aura-400">Full control</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoRole('manager', 'manager@cafeaura.com')}
                  className="text-left p-2 rounded-lg bg-espresso-950 border border-emerald-500/30 hover:border-emerald-500 text-xs transition-colors"
                >
                  <p className="font-semibold text-emerald-300">Manager</p>
                  <p className="text-[10px] text-aura-400">Menu & Staff</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoRole('menu_manager', 'menu@cafeaura.com')}
                  className="text-left p-2 rounded-lg bg-espresso-950 border border-amber-500/30 hover:border-amber-500 text-xs transition-colors"
                >
                  <p className="font-semibold text-amber-300">Menu Manager</p>
                  <p className="text-[10px] text-aura-400">Dishes & Pricing</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoRole('viewer', 'viewer@cafeaura.com')}
                  className="text-left p-2 rounded-lg bg-espresso-950 border border-aura-800 hover:border-aura-700 text-xs transition-colors"
                >
                  <p className="font-bold text-aura-100">Viewer</p>
                  <p className="text-[10px] text-aura-300 font-medium">Read-only</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-espresso-950 flex items-center justify-center text-aura-300">
          <Loader2 className="w-8 h-8 animate-spin text-caramel-500" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
