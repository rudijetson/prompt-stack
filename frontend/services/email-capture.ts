import { getSupabase } from './supabase'
import { emailRateLimiter } from '@/lib/rate-limiter'
import { getEmailProvider, getEmailServiceConfig } from './email-providers'

export interface EmailCapture {
  email: string
  source: string
  created_at?: string
}

// Basic email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Check for disposable email domains
const disposableEmailDomains = [
  'tempmail.com', '10minutemail.com', 'guerrillamail.com', 
  'mailinator.com', 'throwaway.email', 'yopmail.com'
]

function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  return disposableEmailDomains.some(d => domain?.includes(d))
}

interface EmailCaptureRecord extends EmailCapture {
  id: string
  created_at: string
}

export const emailCaptureService = {
  async capture(email: string, source: string = 'website') {
    try {
      // Validate email format
      if (!isValidEmail(email)) {
        console.error('Invalid email format:', email)
        return { success: false, message: 'Invalid email format' }
      }
      
      // Check rate limiting
      if (!emailRateLimiter.isAllowed(email)) {
        console.warn('Rate limit exceeded for email:', email)
        return { success: false, message: 'Too many attempts. Please try again later.' }
      }
      
      // Warn about disposable emails (but still allow them)
      if (isDisposableEmail(email)) {
        console.warn('Disposable email detected:', email)
      }
      // First check if email already exists
      const supabase = getSupabase()
      if (!supabase) {
        console.log('Supabase not available in demo mode')
        return { success: true, message: 'Email noted (demo mode)' }
      }
      
      const { data: existing, error: checkError } = await supabase
        .from('email_captures')
        .select('email')
        .eq('email', email)
        .maybeSingle()
      
      // If there's an error checking, log it but continue
      if (checkError) {
        console.log('Check error (might be first email):', checkError)
      }
      
      if (existing) {
        // Email already captured, just return success
        console.log('Email already in system:', email)
        return { success: true, message: 'Email already in system' }
      }
      
      // Insert new email
      const { data, error } = await supabase
        .from('email_captures')
        .insert([{ email, source }])
        .select()
        .single()
      
      if (error) {
        console.error('Insert error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }
      
      console.log('Email captured successfully:', email, source)
      
      // Sync to email service provider if configured
      try {
        const config = getEmailServiceConfig()
        const provider = getEmailProvider(config)
        
        if (provider) {
          console.log(`Syncing to ${provider.name}...`)
          const result = await provider.addContact(email, {
            tags: [source, 'prompt-stack'],
            source,
            customFields: {
              source,
              captured_at: new Date().toISOString()
            }
          })
          
          if (result.success) {
            console.log(`Successfully synced to ${provider.name}`)
          } else {
            console.warn(`Failed to sync to ${provider.name}:`, result.message)
          }
        }
      } catch (syncError) {
        // Don't fail the whole operation if sync fails
        console.error('Email provider sync error:', syncError)
      }
      
      return { success: true, data }
    } catch (error: any) {
      console.error('Email capture error:', error?.message || error)
      
      // Still return success to user even if DB fails
      // You don't want to block them from getting the template
      return { 
        success: true, 
        message: 'Email noted (backup mode)',
        error 
      }
    }
  },
  
  async getAll(): Promise<EmailCaptureRecord[]> {
    const supabase = getSupabase()
    if (!supabase) {
      console.log('Supabase not available in demo mode')
      return []
    }
    
    const { data, error } = await supabase
      .from('email_captures')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return (data || []) as unknown as EmailCaptureRecord[]
  }
}