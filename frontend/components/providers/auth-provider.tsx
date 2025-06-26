'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { User } from '@supabase/supabase-js'
import { demoAuth } from '@/lib/demo-auth'
import { getApiEndpoint } from '@/lib/api-url'

interface AuthContextType {
  user: User | any | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<{ error: Error | null }>
  isDemoMode: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Singleton instance of Supabase client
let supabaseClient: any = null

// Function to create Supabase client lazily
function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://example.supabase.co') {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
    return supabaseClient
  }
  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | any | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase] = useState(() => getSupabaseClient())
  const isDemoMode = demoAuth.isDemoMode()

  useEffect(() => {
    const initAuth = async () => {
      if (isDemoMode) {
        // Demo mode - use localStorage
        const currentUser = demoAuth.getUser()
        setUser(currentUser)
        console.log('Setting loading to false in demo mode')
        setLoading(false)
        
        const unsubscribe = demoAuth.onAuthStateChange((demoUser) => {
          setUser(demoUser)
        })
        
        return () => {
          unsubscribe()
        }
      } else if (supabase) {
        // Real Supabase mode
        console.log('Supabase mode - checking for stored session')
        
        // Check for stored session first
        if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem('supabase.auth.token')
          const storedUser = localStorage.getItem('supabase.auth.user')
          
          if (storedUser) {
            try {
              const user = JSON.parse(storedUser)
              console.log('Found stored user:', user.email)
              setUser(user)
            } catch (e) {
              console.error('Error parsing stored user:', e)
            }
          }
        }
        
        // Test basic connectivity
        fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          }
        }).then(res => {
          console.log('Supabase REST API test:', res.status)
        }).catch(err => {
          console.error('Supabase REST API error:', err)
        })
        
        setLoading(false)
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            // Fetch role whenever auth state changes
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single()
            
            const userWithRole = {
              ...session.user,
              role: profile?.role || 'user'
            }
            setUser(userWithRole)
          } else {
            setUser(null)
          }
        })
        
        return () => {
          subscription.unsubscribe()
        }
      } else {
        // No Supabase configured, use demo mode
        setLoading(false)
      }
    }
    
    const cleanup = initAuth()
    
    return () => {
      cleanup.then(fn => fn?.())
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('signIn called with email:', email, 'isDemoMode:', isDemoMode, 'supabase:', !!supabase)
    
    if (isDemoMode) {
      const { error } = await demoAuth.signIn(email, password)
      return { error }
    } else if (supabase) {
      console.log('Using backend API for sign in...')
      try {
        // Use the backend API instead of direct Supabase calls
        const response = await fetch(getApiEndpoint('/api/auth/signin'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        })
        
        const result = await response.json()
        console.log('Backend SignIn response:', result, 'Status:', response.status)
        console.log('User object details:', JSON.stringify(result.user, null, 2))
        
        if (!response.ok) {
          console.error('Sign in failed:', result)
          return { error: new Error(result.detail || result.error || `Sign in failed: ${response.status}`) }
        }
        
        // Check if result has the expected structure
        if (!result.user && !result.data?.user) {
          console.error('Unexpected response structure:', result)
          return { error: new Error('Invalid response from server') }
        }
        
        // Manually set the user state since auth listener is hanging
        const user = result.user || result.data?.user
        if (user) {
          // The backend signin endpoint now includes the role
          console.log('User with role from backend:', user)
          setUser(user)
          
          // Store user with role in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('supabase.auth.user', JSON.stringify(user))
          }
        }
        
        // Store session info if available
        const session = result.session || result.data?.session
        if (session?.access_token && typeof window !== 'undefined') {
          localStorage.setItem('supabase.auth.token', JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at
          }))
        }
        
        return { error: null }
      } catch (err) {
        console.error('SignIn error:', err)
        return { error: err instanceof Error ? err : new Error('Sign in failed') }
      }
    } else {
      return { error: new Error('Supabase not configured') }
    }
  }

  const signUp = async (email: string, password: string) => {
    if (isDemoMode) {
      const { error } = await demoAuth.signUp(email, password)
      return { error }
    } else if (supabase) {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      return { error }
    } else {
      return { error: new Error('Supabase not configured') }
    }
  }

  const signOut = async () => {
    if (isDemoMode) {
      const { error } = await demoAuth.signOut()
      return { error }
    } else if (supabase) {
      try {
        // Use backend API for sign out
        const response = await fetch(getApiEndpoint('/api/auth/signout'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        // Clear local state
        setUser(null)
        
        // Clear stored session and user
        if (typeof window !== 'undefined') {
          localStorage.removeItem('supabase.auth.token')
          localStorage.removeItem('supabase.auth.user')
        }
        
        return { error: null }
      } catch (err) {
        console.error('SignOut error:', err)
        return { error: err instanceof Error ? err : new Error('Sign out failed') }
      }
    } else {
      return { error: new Error('Supabase not configured') }
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, isDemoMode }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}