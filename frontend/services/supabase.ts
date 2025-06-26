import { createClient } from '@supabase/supabase-js';

// Lazy initialization to avoid accessing process.env at module level
let _supabase: ReturnType<typeof createClient> | null | undefined;
let _isDemoMode: boolean | undefined;

function initializeSupabase() {
  if (_supabase !== undefined) return _supabase;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const demoModeEnv = process.env.NEXT_PUBLIC_DEMO_MODE || '';
  
  _isDemoMode = demoModeEnv.toLowerCase() === 'true' || 
                (!supabaseUrl || !supabaseAnonKey || supabaseUrl === '' || supabaseAnonKey === '');
  
  if (_isDemoMode) {
    console.warn('Demo mode active: Supabase client not initialized. Add your keys to enable real authentication.');
    _supabase = null;
  } else {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return _supabase;
}

export function getSupabase() {
  return initializeSupabase();
}

export function getIsDemoMode() {
  if (_isDemoMode === undefined) {
    initializeSupabase();
  }
  return _isDemoMode!;
}

// For backward compatibility
export const supabase = null; // Will be replaced by getSupabase() calls

// Demo mode helpers
const DEMO_USER_KEY = 'demo-user-logged-in';

const demoUser = {
  id: 'demo-user-id',
  email: 'demo@prompt-stack.dev',
  name: 'Demo User'
};

// Demo mode state management
function isDemoLoggedIn() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DEMO_USER_KEY) === 'true';
}

function setDemoLoggedIn(loggedIn: boolean) {
  if (typeof window === 'undefined') return;
  if (loggedIn) {
    localStorage.setItem(DEMO_USER_KEY, 'true');
  } else {
    localStorage.removeItem(DEMO_USER_KEY);
  }
}

// Authentication helpers
export async function signInWithGoogle() {
  if (getIsDemoMode()) {
    setDemoLoggedIn(true);
    return { data: { user: demoUser }, error: null };
  }
  const client = getSupabase();
  if (!client) throw new Error('Supabase client not initialized');
  return client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

export async function signInWithLinkedIn() {
  if (getIsDemoMode()) {
    setDemoLoggedIn(true);
    return { data: { user: demoUser }, error: null };
  }
  const client = getSupabase();
  if (!client) throw new Error('Supabase client not initialized');
  return client.auth.signInWithOAuth({
    provider: 'linkedin',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

// Email password authentication
export async function signInWithEmail(email: string, password: string) {
  if (getIsDemoMode()) {
    // Simple demo validation
    if (email === 'demo@prompt-stack.dev' || password.length >= 6) {
      setDemoLoggedIn(true);
      return { data: { user: { ...demoUser, email } }, error: null };
    }
    return { data: null, error: { message: 'Demo mode: Use demo@prompt-stack.dev or any email with 6+ char password' } };
  }
  const client = getSupabase();
  if (!client) throw new Error("Supabase client not initialized");
  return client.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signUpWithEmail(email: string, password: string) {
  if (getIsDemoMode()) {
    if (password.length >= 6) {
      setDemoLoggedIn(true);
      return { data: { user: { ...demoUser, email } }, error: null };
    }
    return { data: null, error: { message: 'Demo mode: Password must be at least 6 characters' } };
  }
  const client = getSupabase();
  if (!client) throw new Error("Supabase client not initialized");
  return client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

export async function resetPassword(email: string) {
  if (getIsDemoMode()) {
    return { data: {}, error: null };
  }
  const client = getSupabase();
  if (!client) throw new Error("Supabase client not initialized");
  return client.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
}

export async function signOut() {
  if (getIsDemoMode()) {
    setDemoLoggedIn(false);
    return { error: null };
  }
  const client = getSupabase();
  if (!client) throw new Error("Supabase client not initialized");
  return client.auth.signOut();
}

export async function getCurrentUser() {
  if (getIsDemoMode()) {
    return isDemoLoggedIn() ? demoUser : null;
  }
  const client = getSupabase();
  if (!client) return null;
  const { data: { user } } = await client.auth.getUser();
  return user;
}

// Session management
export function onAuthStateChange(callback: (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED', session: any) => void) {
  if (getIsDemoMode()) {
    // In demo mode, simulate a signed-in state
    setTimeout(() => callback('SIGNED_IN', { user: demoUser }), 100);
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  const client = getSupabase();
  if (!client) throw new Error("Supabase client not initialized");
  return client.auth.onAuthStateChange((event, session) => {
    callback(event as any, session);
  });
}