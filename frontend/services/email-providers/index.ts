import { EmailProvider } from './base'
import { ResendProvider } from './resend'
import { ConvertKitProvider } from './convertkit'
import { SendGridProvider } from './sendgrid'

export * from './base'
export * from './resend'
export * from './convertkit'
export * from './sendgrid'

// Email service configuration
export interface EmailServiceConfig {
  provider: 'resend' | 'convertkit' | 'sendgrid' | 'none'
  resend?: {
    apiKey: string
    audienceId?: string
  }
  convertkit?: {
    apiKey: string
    apiSecret: string
    formId?: string
  }
  sendgrid?: {
    apiKey: string
    listIds?: string[]
  }
}

// Get email provider instance based on config
export function getEmailProvider(config: EmailServiceConfig): EmailProvider | null {
  switch (config.provider) {
    case 'resend':
      if (!config.resend?.apiKey) return null
      return new ResendProvider(config.resend.apiKey, config.resend.audienceId)
    
    case 'convertkit':
      if (!config.convertkit?.apiKey || !config.convertkit?.apiSecret) return null
      return new ConvertKitProvider(
        config.convertkit.apiKey, 
        config.convertkit.apiSecret,
        config.convertkit.formId
      )
    
    case 'sendgrid':
      if (!config.sendgrid?.apiKey) return null
      return new SendGridProvider(config.sendgrid.apiKey, config.sendgrid.listIds)
    
    default:
      return null
  }
}

// Get config from environment variables
export function getEmailServiceConfig(): EmailServiceConfig {
  // Check which provider is configured
  if (process.env.NEXT_PUBLIC_RESEND_API_KEY) {
    return {
      provider: 'resend',
      resend: {
        apiKey: process.env.NEXT_PUBLIC_RESEND_API_KEY,
        audienceId: process.env.NEXT_PUBLIC_RESEND_AUDIENCE_ID
      }
    }
  }
  
  if (process.env.NEXT_PUBLIC_CONVERTKIT_API_KEY) {
    return {
      provider: 'convertkit',
      convertkit: {
        apiKey: process.env.NEXT_PUBLIC_CONVERTKIT_API_KEY,
        apiSecret: process.env.NEXT_PUBLIC_CONVERTKIT_API_SECRET!,
        formId: process.env.NEXT_PUBLIC_CONVERTKIT_FORM_ID
      }
    }
  }
  
  if (process.env.NEXT_PUBLIC_SENDGRID_API_KEY) {
    return {
      provider: 'sendgrid',
      sendgrid: {
        apiKey: process.env.NEXT_PUBLIC_SENDGRID_API_KEY,
        listIds: process.env.NEXT_PUBLIC_SENDGRID_LIST_IDS?.split(',')
      }
    }
  }
  
  return { provider: 'none' }
}