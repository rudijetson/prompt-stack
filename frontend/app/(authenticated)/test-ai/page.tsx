'use client';

/**
 * AI Model Test Page
 * 
 * Test your configured AI providers and models.
 * This page is part of YOUR application, not a PromptStack demo.
 * 
 * Features:
 * - Test all configured AI providers (OpenAI, Anthropic, Gemini, DeepSeek)
 * - Compare responses from different models
 * - Verify your API keys are working correctly
 * - Requires authentication for real AI responses
 * 
 * Note: You must be signed in to use real AI providers due to
 * auth-first security policy.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { getApiEndpoint, getApiUrl } from '@/lib/api-url';

interface LLMProvider {
  name: string;
  available: boolean;
  configured: boolean;
  models: string[];
}

export default function DemoPage() {
  const { user, isDemoMode } = useAuth();
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('demo');
  const [selectedModel, setSelectedModel] = useState('demo');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testData, setTestData] = useState<any>(null);

  useEffect(() => {
    fetchProviders();
    testDatabase();
  }, []);

  async function fetchProviders() {
    try {
      const res = await fetch(getApiEndpoint('/api/llm/providers'));
      const data = await res.json();
      
      if (data.success && data.data && data.data.providers) {
        setProviders(data.data.providers);
        
        // Set default model for selected provider
        const defaultProvider = data.data.providers.find((p: LLMProvider) => p.name === selectedProvider);
        if (defaultProvider && defaultProvider.models.length > 0) {
          setSelectedModel(defaultProvider.models[0]);
        }
      } else {
        console.error('Invalid provider response:', data);
        setProviders([]);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      setProviders([]);
    }
  }

  async function testDatabase() {
    // Check if we have Supabase configured (not just in demo mode)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasSupabase = supabaseUrl && supabaseUrl !== 'https://example.supabase.co';
    
    if (hasSupabase && !isDemoMode) {
      try {
        // Make a simple API call to check database status
        const res = await fetch(getApiEndpoint('/api/health/detailed'));
        const data = await res.json();
        
        if (data.data?.services?.database === 'connected' || data.data?.services?.database === 'online') {
          setTestData({ connected: true, message: 'Database connection successful' });
        } else {
          setTestData({ connected: false, message: 'Database offline' });
        }
      } catch (error) {
        setTestData({ connected: false, message: 'Database connection failed' });
      }
    } else if (isDemoMode) {
      setTestData({ connected: true, message: 'Demo mode - using mock database' });
    } else {
      setTestData({ connected: false, message: 'Supabase not configured' });
    }
  }

  async function handleGenerateText(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setResponse('');
    setLoading(true);

    try {
      // Check if API is available
      const apiUrl = getApiUrl();
      
      // If no providers are loaded or in demo mode, show a demo response
      if (providers.length === 0 || !providers.some(p => p.configured)) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Demo responses based on prompt
        const demoResponses: Record<string, string> = {
          'hello': 'Hello! I\'m running in demo mode. To use real AI models, configure your API keys in the backend .env file.',
          'test': 'This is a test response from demo mode. The system is working correctly!',
          'help': 'I\'m a demo AI assistant. Add your OpenAI, Anthropic, Gemini, or DeepSeek API keys to enable real AI responses.',
          'default': `Demo response to: "${prompt}"\n\nTo enable real AI responses:\n1. Add API keys to backend/.env\n2. Restart the server\n3. The AI will automatically be available!`
        };
        
        const promptLower = prompt.toLowerCase();
        const response = demoResponses[promptLower] || 
                        Object.entries(demoResponses).find(([key]) => promptLower.includes(key))?.[1] || 
                        demoResponses.default;
        
        setResponse(response);
        return;
      }

      // Use the authenticated endpoint
      const endpoint = '/api/llm/generate';
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add auth token
      if (!isDemoMode) {
        // For real Supabase auth, we need to get the session token
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://example.supabase.co') {
          try {
            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(supabaseUrl, supabaseAnonKey);
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session?.access_token) {
              headers['Authorization'] = `Bearer ${session.access_token}`;
            } else {
              throw new Error('No active session found');
            }
          } catch (error) {
            console.error('Error getting auth token:', error);
            throw new Error('Authentication required. Please sign in again.');
          }
        }
      } else {
        // For demo mode, use a simple token
        headers['Authorization'] = `Bearer demo-token-${user?.email || 'anonymous'}`;
      }

      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt,
          provider: selectedProvider || 'demo',
          model: selectedModel || 'demo',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.success && data.data) {
        setResponse(data.data.text || data.data.response || 'No response generated');
      } else {
        throw new Error(data.error || 'Invalid response format');
      }
    } catch (error) {
      console.error('Generation error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  const selectedProviderData = providers.find(p => p.name === selectedProvider);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">AI Model Testing</h1>
      
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Authentication Status */}
        <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Authentication</h2>
          {isDemoMode ? (
            user ? (
              <div>
                <p className="text-success mb-2">✓ Authenticated (Demo Mode)</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">Using demo authentication</p>
              </div>
            ) : (
              <div>
                <p className="text-warning mb-2">⚠ Not authenticated</p>
                <a href="/auth/login" className="text-accent hover:underline text-sm">
                  Sign in with demo account
                </a>
              </div>
            )
          ) : (
            user ? (
              <div>
                <p className="text-success mb-2">✓ Authenticated</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">Using Supabase authentication</p>
              </div>
            ) : (
              <div>
                <p className="text-warning mb-2">⚠ Not authenticated</p>
                <a href="/auth/login" className="text-accent hover:underline text-sm">
                  Sign in to access all features
                </a>
              </div>
            )
          )}
        </div>

        {/* Database Status */}
        <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Database</h2>
          {testData ? (
            testData.connected ? (
              <div>
                <p className="text-success mb-2">✓ Connected</p>
                <p className="text-sm text-muted-foreground">{testData.message}</p>
              </div>
            ) : (
              <div>
                <p className="text-destructive mb-2">✗ Not connected</p>
                <p className="text-sm text-muted-foreground">{testData.message}</p>
              </div>
            )
          ) : (
            <p className="text-muted-foreground">Checking...</p>
          )}
        </div>

        {/* LLM Status */}
        <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">LLM Providers</h2>
          {providers.length > 0 ? (
            <div className="space-y-2">
              {providers.map(provider => (
                <div key={provider.name} className="flex items-center justify-between">
                  <span className="text-sm">
                    {provider.name === 'demo' ? 'Demo' :
                     provider.name === 'deepseek' ? 'DeepSeek' : 
                     provider.name === 'openai' ? 'OpenAI' :
                     provider.name === 'anthropic' ? 'Anthropic' :
                     provider.name === 'gemini' ? 'Gemini' :
                     provider.name.charAt(0).toUpperCase() + provider.name.slice(1)}
                  </span>
                  {provider.configured ? (
                    <span className="text-success text-sm">✓ Ready</span>
                  ) : (
                    <span className="text-muted text-sm">Not configured</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Loading...</p>
          )}
        </div>
      </div>

      {/* LLM Test Form */}
      <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test AI Models</h2>
          
          {providers.some(p => p.name !== 'demo' && p.configured) ? (
            <div className="mb-4 p-4 bg-success/10 rounded-md">
              <p className="text-sm text-foreground">
                <strong>✓ Ready:</strong> Select a provider and model to test.
              </p>
            </div>
          ) : (
            <div className="mb-4 p-4 bg-warning/10 rounded-md">
              <p className="text-sm text-foreground">
                <strong>No AI providers configured:</strong> Add API keys to backend/.env to enable real AI.
              </p>
            </div>
          )}

          <form onSubmit={handleGenerateText} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Provider
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => {
                    setSelectedProvider(e.target.value);
                    const provider = providers.find(p => p.name === e.target.value);
                    if (provider && provider.models.length > 0) {
                      setSelectedModel(provider.models[0]);
                    }
                  }}
                  className="w-full px-3 py-2 bg-background text-foreground border border-border rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                >
                  {providers
                    .filter(provider => provider.configured)
                    .map(provider => (
                      <option key={provider.name} value={provider.name}>
                        {provider.name === 'demo' ? 'Demo (Mock Responses)' :
                         provider.name === 'deepseek' ? 'DeepSeek' : 
                         provider.name === 'openai' ? 'OpenAI' :
                         provider.name === 'anthropic' ? 'Anthropic' :
                         provider.name === 'gemini' ? 'Gemini' :
                         provider.name.charAt(0).toUpperCase() + provider.name.slice(1)}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 bg-background text-foreground border border-border rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                  disabled={!selectedProviderData?.models.length}
                >
                  {selectedProviderData?.models.map(model => (
                    <option key={model} value={model}>{model}</option>
                  )) || <option>No models available</option>}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-background text-foreground border border-border rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                placeholder="Enter your prompt here..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !prompt}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-destructive/10 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {response && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-foreground mb-2">Response:</h3>
              <div className="p-4 bg-muted rounded-md">
                <p className="text-foreground whitespace-pre-wrap">{response}</p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}