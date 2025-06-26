// Base interface for email providers
export interface EmailProvider {
  name: string
  addContact(email: string, options?: AddContactOptions): Promise<EmailProviderResponse>
  addTag?(email: string, tag: string): Promise<EmailProviderResponse>
  removeContact?(email: string): Promise<EmailProviderResponse>
}

export interface AddContactOptions {
  tags?: string[]
  customFields?: Record<string, any>
  listId?: string
  source?: string
}

export interface EmailProviderResponse {
  success: boolean
  id?: string
  message?: string
  error?: any
}