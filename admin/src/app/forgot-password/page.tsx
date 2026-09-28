'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Coffee, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { resetPassword } = useAuth();
  const { error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (err: any) {
      error('Reset Request Failed', err.message || 'Could not process password reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-espresso-950 flex flex-col justify-center items-center p-4 sm:p-6 text-aura-100 relative">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-caramel-600 to-caramel-400 text-espresso-950 font-bold shadow-xl shadow-caramel-500/20 mb-3">
            <Coffee className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-display font-bold text-aura-50">
            Reset Password
          </h1>
          <p className="text-sm text-aura-300 mt-1">
            We will send you instructions to reset your admin password
          </p>
        </div>

        <div className="bg-espresso-900/90 border border-aura-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {isSubmitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-aura-50">
                Check Your Email
              </h3>
              <p className="text-xs text-aura-300 leading-relaxed">
                If an account exists for <b className="text-aura-100">{email}</b>, you will receive password reset instructions shortly.
              </p>
              <a href="/login" className="inline-block mt-4">
                <Button variant="outline" size="md">
                  Return to Sign In
                </Button>
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cafeaura.com"
                icon={<Mail className="w-4 h-4" />}
                required
              />

              <Button
                type="submit"
                className="w-full mt-2"
                isLoading={isLoading}
                size="lg"
              >
                Send Reset Link
              </Button>

              <div className="text-center pt-2">
                <a
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-aura-400 hover:text-aura-200 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
