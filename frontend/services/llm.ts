import { getSupabase } from './supabase';
import { getApiUrl as getApiBaseUrl, getApiEndpoint } from '@/lib/api-url';

// Type declaration for process.env
declare const process: {
  env: {
    NEXT_PUBLIC_API_URL?: string;
    [key: string]: string | undefined;
  };
};

// API Base URL
// Use centralized API URL configuration
function getApiUrl() {
  return getApiBaseUrl();
}

// Type definitions
export interface TextGenerationRequest {
  prompt: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  provider?: 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'demo';
}

export interface TextGenerationResponse {
  text: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number | null;
    total_tokens: number;
  };
}

export interface EmbeddingRequest {
  text: string;
  model?: string;
  provider?: 'openai' | 'anthropic';
}

export interface EmbeddingResponse {
  embedding: number[];
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number | null;
    total_tokens: number;
  };
}

// Check if we're in demo mode
function getIsDemoMode() {
  const demoModeEnv = process.env.NEXT_PUBLIC_DEMO_MODE || '';
  // Only use demo mode if explicitly set to true or if Supabase is not configured
  const explicitDemoMode = demoModeEnv.toLowerCase() === 'true';
  const noSupabase = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === '';
  
  // If demo mode is explicitly false and Supabase is configured, use real auth
  if (demoModeEnv.toLowerCase() === 'false' && !noSupabase) {
    return false;
  }
  
  return explicitDemoMode || noSupabase;
}

// Helper to get authentication token
async function getAuthToken() {
  if (getIsDemoMode()) {
    return 'demo-token'; // Mock token for demo mode
  }
  
  const supabase = getSupabase();
  if (!supabase) {
    return 'demo-token'; // Fallback for demo mode
  }
  
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

// Helper to make authenticated API requests
async function apiRequest(endpoint: string, method: string, body?: any) {
  // In demo mode, use the demo endpoint instead
  if (getIsDemoMode() && endpoint === '/api/llm/generate') {
    try {
      console.log(`Making demo request to ${getApiUrl()}/api/llm/demo`);
      
      const response = await fetch(getApiEndpoint('/api/llm/demo'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Demo API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Handle the success_response format
      const result = data.data || data;
      
      // Transform demo response to match expected format
      return {
        text: result.text || result.content || 'Demo response',
        model: result.model || 'demo',
        usage: result.usage || {
          prompt_tokens: Math.floor(Math.random() * 50) + 10,
          completion_tokens: Math.floor(Math.random() * 100) + 20,
          total_tokens: Math.floor(Math.random() * 150) + 30
        }
      };
    } catch (error) {
      console.error('Demo API request error:', error);
      throw error;
    }
  }

  const token = await getAuthToken();

  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    console.log(`Making request to ${getApiUrl()}${endpoint}`);

    const response = await fetch(getApiEndpoint(endpoint), {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      mode: 'cors',
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      let errorMessage = `API request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        // If we can't parse the error as JSON, just use the status message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Handle success_response format for authenticated requests
    if (data.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// LLM API functions
export async function generateText(request: TextGenerationRequest): Promise<TextGenerationResponse> {
  const response = await apiRequest('/api/llm/generate', 'POST', request);
  
  // Transform the response to match the expected format
  return {
    text: response.text || response.content || '',
    model: response.model || request.model || 'unknown',
    usage: response.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0
    }
  };
}

export async function createEmbedding(request: EmbeddingRequest): Promise<EmbeddingResponse> {
  return apiRequest('/api/llm/embedding', 'POST', request);
}