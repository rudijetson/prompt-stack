'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PromptStackPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the developer guide
    router.push('/dev-guide')
  }, [router])
  
  return null
}