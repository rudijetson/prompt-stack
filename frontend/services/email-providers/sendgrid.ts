import { EmailProvider, AddContactOptions, EmailProviderResponse } from './base'

export class SendGridProvider implements EmailProvider {
  name = 'SendGrid'
  private apiKey: string
  private listIds?: string[]

  constructor(apiKey: string, listIds?: string[]) {
    this.apiKey = apiKey
    this.listIds = listIds
  }

  async addContact(email: string, options?: AddContactOptions): Promise<EmailProviderResponse> {
    try {
      const contact = {
        email,
        custom_fields: options?.customFields || {},
        // Add source as custom field if provided
        ...(options?.source && { source: options.source })
      }

      const requestBody: any = {
        contacts: [contact]
      }

      // Add to specific lists if provided
      if (this.listIds && this.listIds.length > 0) {
        requestBody.list_ids = this.listIds
      }

      const response = await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.errors?.[0]?.message || 'Failed to add contact')
      }

      return {
        success: true,
        id: data.job_id,
        message: 'Contact added to SendGrid'
      }
    } catch (error: any) {
      console.error('SendGrid error:', error)
      return {
        success: false,
        error,
        message: error.message
      }
    }
  }

  async addTag(email: string, tag: string): Promise<EmailProviderResponse> {
    // SendGrid uses lists and segments, not tags
    // You could create a custom field for tags or use segments
    return {
      success: true,
      message: 'SendGrid uses lists and segments instead of tags'
    }
  }
}