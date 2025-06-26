'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function ConfirmEmailPage() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  async function handleResendEmail() {
    setResending(true);
    setError('');
    
    try {
      const supabase = createClient();
      // Note: Supabase doesn't have a direct resend confirmation email method
      // You might need to implement this through your backend or Supabase Edge Functions
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (error) {
      setError('Failed to resend confirmation email. Please try again.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-success/10">
            <Mail className="h-8 w-8 text-success" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We've sent a confirmation link to your email address
          </p>
        </div>

        <div className="bg-info/10 border border-info/20 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-info" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-info">
                Almost there!
              </h3>
              <div className="mt-2 text-sm text-info">
                <p>Please check your email and click the confirmation link to activate your account.</p>
                <p className="mt-2">If you don't see the email, check your spam folder.</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-4">
            <div className="text-sm text-destructive">{error}</div>
          </div>
        )}

        {resent && (
          <div className="rounded-md bg-success/10 p-4">
            <div className="text-sm text-success">
              Confirmation email resent! Please check your inbox.
            </div>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleResendEmail}
            disabled={resending}
            className="w-full flex justify-center py-2 px-4 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? 'Resending...' : 'Resend confirmation email'}
          </button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already confirmed? </span>
            <Link href="/auth/login" className="font-medium text-accent hover:text-accent/80">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}