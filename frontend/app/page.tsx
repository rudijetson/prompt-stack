'use client';

/**
 * Homepage / Service Status Dashboard
 * 
 * 🎯 THIS IS YOUR HOMEPAGE - Replace this with your landing page!
 * 
 * Current content: Shows the status of all configured services.
 * What you should do: Replace this entire file with your landing page.
 * 
 * Example:
 * export default function Home() {
 *   return <div>Welcome to My SaaS!</div>
 * }
 * 
 * The current service status dashboard can be moved to /admin or /status
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, AlertCircle, ArrowRight, Database, Key, Mail, CreditCard, Brain, Search, Zap } from 'lucide-react';
import { getApiUrl } from '@/lib/api-url';

interface ServiceStatus {
  name: string;
  status: 'ready' | 'not-configured' | 'checking';
  description: string;
  icon: React.ReactNode;
  configKey?: string;
}

export default function Home() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Database (Supabase)',
      status: 'checking',
      description: 'PostgreSQL with auth, storage, and realtime',
      icon: <Database className="w-5 h-5" />,
      configKey: 'SUPABASE_URL'
    },
    {
      name: 'Authentication',
      status: 'checking',
      description: 'Email/password and social login ready',
      icon: <Key className="w-5 h-5" />,
      configKey: 'SUPABASE_URL'
    },
    {
      name: 'AI/LLM Integration',
      status: 'checking',
      description: 'OpenAI, Anthropic, Gemini, DeepSeek',
      icon: <Brain className="w-5 h-5" />,
      configKey: 'AI_CONFIGURED'
    },
    {
      name: 'Vector Search',
      status: 'checking',
      description: 'pgvector or Qdrant for embeddings',
      icon: <Search className="w-5 h-5" />,
      configKey: 'VECTOR_DB'
    },
    {
      name: 'Email Service',
      status: 'checking',
      description: 'Resend for transactional emails',
      icon: <Mail className="w-5 h-5" />,
      configKey: 'RESEND_API_KEY'
    },
    {
      name: 'Payments',
      status: 'checking',
      description: 'Stripe and Lemon Squeezy',
      icon: <CreditCard className="w-5 h-5" />,
      configKey: 'PAYMENTS_CONFIGURED'
    }
  ]);

  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    checkServices();
  }, []);

  async function checkServices() {
    try {
      // Check API status
      const response = await fetch(`${getApiUrl()}/`);
      if (response.ok) {
        const data = await response.json();
        setApiStatus('online');
        
        // Check if response has the expected structure
        if (data.success && data.data) {
          setDemoMode(data.data.demo_mode || false);
          
          // Update service statuses based on API response
          const features = data.data.features || {};
          setServices(prev => prev.map(service => {
            let status: 'ready' | 'not-configured' = 'not-configured';
            
            switch (service.name) {
              case 'Database (Supabase)':
              case 'Authentication':
                status = features.auth ? 'ready' : 'not-configured';
                break;
              case 'AI/LLM Integration':
                status = features.ai ? 'ready' : 'not-configured';
                break;
              case 'Vector Search':
                status = features.vector_db ? 'ready' : 'not-configured';
                break;
              case 'Email Service':
                status = features.email ? 'ready' : 'not-configured';
                break;
              case 'Payments':
                status = features.payments ? 'ready' : 'not-configured';
                break;
            }
            
            return { ...service, status };
          }));
        } else {
          // If response structure is unexpected, assume demo mode
          setDemoMode(true);
          setServices(prev => prev.map(service => ({ ...service, status: 'not-configured' })));
        }
      } else {
        setApiStatus('offline');
        setServices(prev => prev.map(service => ({ ...service, status: 'not-configured' })));
      }
    } catch (error) {
      console.error('Error checking services:', error);
      setApiStatus('offline');
      setServices(prev => prev.map(service => ({ ...service, status: 'not-configured' })));
    }
  }

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'not-configured':
        return <XCircle className="w-5 h-5 text-muted-foreground" />;
      case 'checking':
        return <AlertCircle className="w-5 h-5 text-warning animate-pulse" />;
    }
  };

  const readyCount = services.filter(s => s.status === 'ready').length;
  const totalCount = services.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Prompt-Stack Boilerplate
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Full-stack template with authentication, database, AI, and payments.
          </p>
          {readyCount === 0 ? (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-warning/10 text-warning rounded-lg">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">Demo Mode - All features work with mock data</span>
            </div>
          ) : (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-success/10 text-success rounded-lg">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">{readyCount} services configured</span>
            </div>
          )}
        </div>

        {/* API Status Card */}
        <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Backend API</h2>
              <p className="text-sm text-muted-foreground mt-1">FastAPI server at localhost:8000</p>
            </div>
            <div className="flex items-center gap-2">
              {apiStatus === 'online' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm font-medium text-success">Online</span>
                </>
              ) : apiStatus === 'offline' ? (
                <>
                  <XCircle className="w-5 h-5 text-destructive" />
                  <span className="text-sm font-medium text-destructive">Offline</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-warning animate-pulse" />
                  <span className="text-sm font-medium text-warning">Checking...</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service) => (
            <div key={service.name} className="bg-card rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    {service.icon}
                  </div>
                  <h3 className="font-semibold text-foreground">{service.name}</h3>
                </div>
                {getStatusIcon(service.status)}
              </div>
              <p className="text-sm text-muted-foreground">{service.description}</p>
              {service.status === 'not-configured' && (
                <p className="text-xs text-muted-foreground mt-2">Add API keys to .env</p>
              )}
            </div>
          ))}
        </div>

        {/* Progress Summary */}
        <div className="bg-card rounded-lg shadow-sm p-6 mb-12">
          <h2 className="text-lg font-semibold text-foreground mb-4">Setup Progress</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Services Configured</span>
                <span className="font-medium">{readyCount} / {totalCount}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-success h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(readyCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
            {readyCount === totalCount ? (
              <p className="text-sm text-success font-medium">
                ✨ All services configured! You're ready to build.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Configure the remaining services to unlock full functionality.
              </p>
            )}
          </div>
        </div>


        {/* Test Your Setup */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">🧪 Test Your Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/test-api" className="group bg-card rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Test Your API</h3>
                <p className="text-sm text-muted-foreground mt-1">Check real config</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-muted-foreground" />
            </div>
          </Link>

          <Link href="/test-ai" className="group bg-card rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Test Your AI</h3>
                <p className="text-sm text-muted-foreground mt-1">Test real providers</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-muted-foreground" />
            </div>
          </Link>

          <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="group bg-card rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">API Docs</h3>
                <p className="text-sm text-muted-foreground mt-1">OpenAPI specs</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-muted-foreground" />
            </div>
          </a>

          <Link href="/auth/login" className="group bg-accent text-accent-foreground rounded-lg shadow-sm p-4 hover:bg-accent transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Sign In</h3>
                <p className="text-sm opacity-90 mt-1">Access your dashboard</p>
              </div>
              <ArrowRight className="w-4 h-4 opacity-75 group-hover:opacity-100" />
            </div>
          </Link>
          </div>
        </div>

        {/* Configuration Guide */}
        <div className="mt-12 bg-muted rounded-lg p-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Enable Real Services (Optional)</h2>
          <p className="text-muted-foreground mb-6">
            The app works great in demo mode! Add API keys only for the services you want to use.
          </p>
          <div className="space-y-4">
            <div>
              <p className="text-foreground mb-2">1. Edit your backend/.env file:</p>
              <pre className="bg-card text-card-foreground rounded p-3 text-sm overflow-x-auto">
{`# For AI features (pick one or more):
DEEPSEEK_API_KEY=sk-...      # Cheapest! $0.14/M tokens
OPENAI_API_KEY=sk-...        # GPT-4, o3
ANTHROPIC_API_KEY=sk-...     # Claude
GEMINI_API_KEY=...           # Google

# For real user accounts:
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...`}
              </pre>
            </div>
            <div>
              <p className="text-foreground mb-2">2. Restart to apply changes:</p>
              <pre className="bg-card text-card-foreground rounded p-3 text-sm overflow-x-auto">
{`docker-compose -f docker-compose.dev.yml restart`}
              </pre>
            </div>
            <div className="mt-4 p-4 bg-card rounded">
              <p className="text-sm text-card-foreground">
                💡 <strong>Tip:</strong> Start with just DeepSeek for AI - it's incredibly cheap and powerful!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}