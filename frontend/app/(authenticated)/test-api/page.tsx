'use client'

/**
 * API Configuration Test Page
 * 
 * Test your backend API configuration and service status.
 * This is YOUR application's API testing tool, not a PromptStack demo.
 * 
 * Features:
 * - Tests multiple endpoints with a single click
 * - Shows response times and status codes
 * - Displays full JSON responses for debugging
 * - Verifies all your configured services
 * 
 * Use this page to:
 * - Verify backend connectivity
 * - Test your API endpoints
 * - Debug configuration issues
 * - Confirm services are properly set up
 */

import { useState } from 'react'
import { getApiUrl } from '@/lib/api-url'

interface TestResult {
  endpoint: string;
  status: 'success' | 'error' | 'pending';
  response?: any;
  error?: string;
  duration?: number;
}

export default function APITestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)

  const endpoints = [
    { name: 'Root Health Check', path: '/', method: 'GET' },
    { name: 'API Health', path: '/api/health/', method: 'GET' },
    { name: 'System Capabilities', path: '/api/system/capabilities', method: 'GET' },
    { name: 'LLM Providers', path: '/api/llm/providers', method: 'GET' },
    { name: 'Demo LLM Generate', path: '/api/llm/demo', method: 'POST', body: { prompt: 'Hello, AI!', model: 'demo-model', provider: 'demo' } },
  ]

  const testEndpoint = async (endpoint: typeof endpoints[0]): Promise<TestResult> => {
    const startTime = Date.now()
    const baseUrl = getApiUrl()
    
    try {
      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body)
      }

      const response = await fetch(`${baseUrl}${endpoint.path}`, options)
      const duration = Date.now() - startTime
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        endpoint: endpoint.name,
        status: 'success',
        response: data,
        duration,
      }
    } catch (error) {
      return {
        endpoint: endpoint.name,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      }
    }
  }

  const runAllTests = async () => {
    setLoading(true)
    setTestResults([])

    const results: TestResult[] = []
    
    for (const endpoint of endpoints) {
      // Show pending status
      setTestResults(prev => [...prev, { endpoint: endpoint.name, status: 'pending' }])
      
      // Run test
      const result = await testEndpoint(endpoint)
      
      // Update with actual result
      setTestResults(prev => 
        prev.map(r => r.endpoint === endpoint.name ? result : r)
      )
      
      results.push(result)
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    setLoading(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <span className="text-success">✓</span>
      case 'error':
        return <span className="text-destructive">✗</span>
      case 'pending':
        return <span className="text-muted-foreground">⋯</span>
    }
  }

  const backendUrl = getApiUrl()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">API Connection Test</h1>
      
      <div className="bg-card rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Connection Details</h2>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Backend URL:</span>{' '}
            <code className="bg-muted px-2 py-1 rounded">{backendUrl}</code>
          </div>
          <div>
            <span className="font-medium">API Documentation:</span>{' '}
            <a 
              href={`${backendUrl}/docs`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              {backendUrl}/docs
            </a>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Endpoint Tests</h2>
          <button
            onClick={runAllTests}
            disabled={loading}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Running Tests...' : 'Run All Tests'}
          </button>
        </div>

        {testResults.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Click "Run All Tests" to test API endpoints
          </p>
        ) : (
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.endpoint}</span>
                  </div>
                  {result.duration && (
                    <span className="text-sm text-muted-foreground">{result.duration}ms</span>
                  )}
                </div>
                
                {result.status === 'error' && result.error && (
                  <div className="mt-2 p-3 bg-destructive/10 rounded text-sm text-destructive">
                    {result.error}
                  </div>
                )}
                
                {result.status === 'success' && result.response && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                      View Response
                    </summary>
                    <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">
                      {JSON.stringify(result.response, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        {testResults.length > 0 && !loading && (
          <div className="mt-6 p-4 bg-muted rounded">
            <h3 className="font-medium mb-2">Summary</h3>
            <div className="flex space-x-6 text-sm">
              <span>
                Total: {testResults.length}
              </span>
              <span className="text-success">
                Passed: {testResults.filter(r => r.status === 'success').length}
              </span>
              <span className="text-destructive">
                Failed: {testResults.filter(r => r.status === 'error').length}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}