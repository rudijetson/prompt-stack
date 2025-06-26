import { EmailProvider, AddContactOptions, EmailProviderResponse } from './base'

export class ResendProvider implements EmailProvider {
  name = 'Resend'
  private apiKey: string
  private audienceId?: string

  constructor(apiKey: string, audienceId?: string) {
    this.apiKey = apiKey
    this.audienceId = audienceId
  }

  async addContact(email: string, options?: AddContactOptions): Promise<EmailProviderResponse> {
    try {
      if (!this.audienceId) {
        throw new Error('Resend audience ID not configured')
      }

      const response = await fetch('https://api.resend.com/audiences/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audience_id: this.audienceId,
          email,
          unsubscribed: false,
          ...options?.customFields
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add contact')
      }

      return {
        success: true,
        id: data.id,
        message: 'Contact added to Resend'
      }
    } catch (error: any) {
      console.error('Resend error:', error)
      return {
        success: false,
        error,
        message: error.message
      }
    }
  }

  // Resend uses audiences, not tags
  async addTag(email: string, tag: string): Promise<EmailProviderResponse> {
    // Tags aren't directly supported, would need custom implementation
    return {
      success: true,
      message: 'Resend uses audiences instead of tags'
    }
  }
}