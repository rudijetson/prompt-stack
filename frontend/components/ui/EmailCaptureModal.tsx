'use client'

import { useState } from 'react'
import { X, Download, Mail, CheckCircle } from 'lucide-react'
import { emailCaptureService } from '@/services/email-capture'

interface EmailCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  title?: string
  description?: string
  buttonText?: string
}

export function EmailCaptureModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  title = "Get the Prompt-Stack Template",
  description = "Enter your email to get instant access to the template + updates on new features.",
  buttonText = "Get Template"
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Save to Supabase
      const result = await emailCaptureService.capture(email, 'template-download')
      
      // Also send to your email service if configured
      // await sendToConvertKit(email) // TODO: Add your email service
      
      console.log('Email captured:', result)
      
      setLoading(false)
      setSubmitted(true)
      
      // Redirect to GitHub after 2 seconds
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 3000)
    } catch (error) {
      console.error('Error capturing email:', error)
      // Still show success to user - don't block them
      setLoading(false)
      setSubmitted(true)
      
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 3000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-card rounded-lg shadow-xl max-w-md w-full p-6 border border-border">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">Success!</h3>
              <p className="text-muted-foreground mb-4">
                I'm sending the GitHub link to your email now!
              </p>
              <p className="text-sm text-accent font-medium">
                💡 Pro tip: If you get stuck, the Setup Kit shows you exactly what to do
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <Download className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-10 pr-3 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : buttonText}
                </button>
                
                <p className="text-xs text-muted-foreground text-center">
                  We'll never spam. Unsubscribe anytime.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}