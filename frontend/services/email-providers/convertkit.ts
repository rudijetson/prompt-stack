import { EmailProvider, AddContactOptions, EmailProviderResponse } from './base'

export class ConvertKitProvider implements EmailProvider {
  name = 'ConvertKit'
  private apiKey: string
  private apiSecret: string
  private formId?: string

  constructor(apiKey: string, apiSecret: string, formId?: string) {
    this.apiKey = apiKey
    this.apiSecret = apiSecret
    this.formId = formId
  }

  async addContact(email: string, options?: AddContactOptions): Promise<EmailProviderResponse> {
    try {
      // Add to form if formId provided, otherwise just create subscriber
      const endpoint = this.formId 
        ? `https://api.convertkit.com/v3/forms/${this.formId}/subscribe`
        : 'https://api.convertkit.com/v3/subscribers'

      const body = this.formId ? {
        api_key: this.apiKey,
        email,
        tags: options?.tags,
        fields: options?.customFields
      } : {
        api_secret: this.apiSecret,
        email,
        tags: options?.tags,
        fields: options?.customFields
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add subscriber')
      }

      return {
        success: true,
        id: data.subscription?.subscriber?.id || data.subscriber?.id,
        message: 'Subscriber added to ConvertKit'
      }
    } catch (error: any) {
      console.error('ConvertKit error:', error)
      return {
        success: false,
        error,
        message: error.message
      }
    }
  }

  async addTag(email: string, tag: string): Promise<EmailProviderResponse> {
    try {
      // First get the subscriber by email
      const subscriberResponse = await fetch(
        `https://api.convertkit.com/v3/subscribers?api_secret=${this.apiSecret}&email_address=${email}`,
        { method: 'GET' }
      )
      
      const subscriberData = await subscriberResponse.json()
      const subscriber = subscriberData.subscribers?.[0]
      
      if (!subscriber) {
        throw new Error('Subscriber not found')
      }

      // Tag the subscriber
      const tagResponse = await fetch(
        `https://api.convertkit.com/v3/tags/${tag}/subscribe`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: this.apiKey,
            email
          })
        }
      )

      const tagData = await tagResponse.json()

      return {
        success: tagResponse.ok,
        message: tagResponse.ok ? 'Tag added' : tagData.message
      }
    } catch (error: any) {
      return {
        success: false,
        error,
        message: error.message
      }
    }
  }
}