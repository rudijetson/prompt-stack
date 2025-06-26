'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Handle the callback from Supabase (email confirmation, password reset, etc.)
    const handleCallback = async () => {
      try {
        // Parse the hash to get the access token
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const expiresAt = hashParams.get('expires_at');
        
        if (accessToken) {
          console.log('Found access token in callback');
          
          // Store the session tokens
          if (typeof window !== 'undefined') {
            localStorage.setItem('supabase.auth.token', JSON.stringify({
              access_token: accessToken,
              refresh_token: refreshToken,
              expires_at: expiresAt
            }));
            
            // For now, just redirect to dashboard
            // The auth provider will need to fetch user info on next load
            console.log('Stored auth tokens, redirecting to dashboard');
            router.push('/dashboard');
          }
        } else {
          // Check for other callback types
          const type = hashParams.get('type');
          const error = hashParams.get('error');
          const errorDescription = hashParams.get('error_description');
          
          if (error) {
            console.error('Auth callback error:', error, errorDescription);
            router.push(`/auth/login?error=${error}`);
          } else if (type === 'signup' || type === 'recovery' || type === 'invite') {
            // Email confirmed, redirect to login with success message
            console.log('Email confirmation type:', type);
            router.push('/auth/login?message=email_confirmed&email_verified=true');
          } else {
            // Check query params as well (some callbacks use query instead of hash)
            const queryParams = new URLSearchParams(window.location.search);
            const queryType = queryParams.get('type');
            
            if (queryType === 'signup' || queryType === 'recovery') {
              router.push('/auth/login?message=email_confirmed&email_verified=true');
            } else {
              // Default: just go to login
              router.push('/auth/login');
            }
          }
        }
      } catch (error) {
        console.error('Callback error:', error);
        router.push('/auth/login?error=callback_error');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Processing authentication...</p>
      </div>
    </div>
  );
}