import { useState } from 'react';
import { signInWithGoogle, signInWithLinkedIn, signInWithEmail, signUpWithEmail, resetPassword } from '@/services/supabase';

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState({
    google: false,
    linkedin: false,
    email: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setIsLoading({ ...isLoading, google: true });
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading({ ...isLoading, google: false });
    }
  };

  const handleLinkedInSignIn = async () => {
    try {
      setError(null);
      setIsLoading({ ...isLoading, linkedin: true });
      const { error } = await signInWithLinkedIn();
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with LinkedIn');
    } finally {
      setIsLoading({ ...isLoading, linkedin: false });
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);
      setIsLoading({ ...isLoading, email: true });

      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
      } else if (mode === 'signup') {
        const { error } = await signUpWithEmail(email, password);
        if (error) throw error;
        setSuccess('Check your email for the confirmation link.');
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setSuccess('Check your email for the password reset link.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading({ ...isLoading, email: false });
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-card rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">
          {mode === 'signin' ? 'Sign in to your account' : mode === 'signup' ? 'Create a new account' : 'Reset your password'}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === 'signin' ? 'Or create a new account' : mode === 'signup' ? 'Or sign in to your account' : 'Enter your email to receive a reset link'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-success/10 border border-success text-success rounded">
          {success}
        </div>
      )}

      {/* Email/password form */}
      <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-background text-foreground border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
          />
        </div>

        {mode !== 'reset' && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-background text-foreground border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
            />
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading.email}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-accent-foreground bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          >
            {isLoading.email
              ? 'Loading...'
              : mode === 'signin'
              ? 'Sign in'
              : mode === 'signup'
              ? 'Sign up'
              : 'Send reset instructions'}
          </button>
        </div>
      </form>

      {/* Mode switchers */}
      <div className="text-sm text-center space-y-2 mb-6">
        {mode !== 'signin' && (
          <button
            type="button"
            onClick={() => setMode('signin')}
            className="text-accent hover:text-accent/80"
          >
            Sign in with existing account
          </button>
        )}
        {mode !== 'signup' && (
          <button
            type="button"
            onClick={() => setMode('signup')}
            className="block w-full text-accent hover:text-accent/80"
          >
            Create a new account
          </button>
        )}
        {mode !== 'reset' && (
          <button
            type="button"
            onClick={() => setMode('reset')}
            className="block w-full text-accent hover:text-accent/80"
          >
            Forgot your password?
          </button>
        )}
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="space-y-4">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading.google}
          className="w-full flex items-center justify-center py-2 px-4 border border-border rounded-md shadow-sm bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
        >
          {isLoading.google ? (
            <span>Loading...</span>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleLinkedInSignIn}
          disabled={isLoading.linkedin}
          className="w-full flex items-center justify-center py-2 px-4 border border-border rounded-md shadow-sm bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
        >
          {isLoading.linkedin ? (
            <span>Loading...</span>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#0A66C2"
                  d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                />
              </svg>
              <span>Continue with LinkedIn</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}