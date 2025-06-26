'use client'

/**
 * Developer Guide Page
 * 
 * This page serves as a comprehensive guide to all features included in the Prompt-Stack skeleton.
 * It's designed to help developers understand what's available and how to use it.
 * 
 * Sections:
 * - Getting Started: Quick setup and configuration
 * - Core Features: Essential functionality walkthrough
 * - Code Examples: Practical implementation examples
 * - Next Steps: How to extend and customize
 */

import { 
  MessageSquare, 
  FileText, 
  Code2, 
  ArrowRight,
  Lock,
  Database,
  Zap,
  Component,
  CheckCircle,
  Settings,
  User,
  Shield,
  LogIn,
  Globe,
  Sparkles,
  Terminal,
  Copy,
  ExternalLink,
  BookOpen,
  Rocket,
  Layers
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/components/providers/auth-provider'

export default function GuidePage() {
  const { user, loading, isDemoMode } = useAuth()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Prompt-Stack Developer Guide
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Learn how to build with Prompt-Stack. This interactive guide walks you through every feature with practical examples.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Built with AI-first development in mind</span>
          </div>
        </div>

        {/* Quick Testing Links */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          <Link 
            href="/test-api" 
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md hover:bg-muted"
          >
            <Globe className="w-4 h-4 mr-2" />
            Test API
          </Link>
          <Link 
            href="/test-ai" 
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md hover:bg-muted"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Test AI
          </Link>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md hover:bg-muted"
          >
            <User className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
        </div>

        {/* Current Status Banner */}
        <div className="mb-8 text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            {loading ? (
              <div className="inline-flex items-center px-4 py-2 bg-muted border border-border rounded-lg">
                <div className="animate-spin h-4 w-4 border-2 border-foreground border-t-transparent rounded-full mr-2" />
                <span className="text-sm">Checking authentication...</span>
              </div>
            ) : user ? (
              <div className="inline-flex items-center px-4 py-2 bg-success/10 border border-success/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success mr-2" />
                <span className="text-sm text-success">
                  Signed in as <strong>{user.email}</strong>
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center px-4 py-2 bg-muted border border-border rounded-lg">
                <LogIn className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-sm text-foreground">
                  Not signed in
                </span>
              </div>
            )}
            
            {isDemoMode && (
              <div className="inline-flex items-center px-4 py-2 bg-warning/10 border border-warning/30 rounded-lg">
                <Zap className="h-5 w-5 text-warning mr-2" />
                <span className="text-sm text-warning">Demo Mode Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Getting Started Section */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Rocket className="h-6 w-6 text-accent mr-2" />
              Getting Started
            </h2>
            <p className="text-muted-foreground">
              Prompt-Stack works out of the box with demo mode. Follow these steps to get your app running:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Quick Start */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <Terminal className="h-5 w-5 text-muted-foreground mr-2" />
                1. Quick Start Commands
              </h3>
              <div className="space-y-3">
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Start development server</span>
                    <button
                      onClick={() => copyToClipboard('make dev', 'start')}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {copiedCode === 'start' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                  <code className="text-sm font-mono">make dev</code>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Test API endpoints</span>
                    <button
                      onClick={() => copyToClipboard('./scripts/test-api-simple.sh', 'test')}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {copiedCode === 'test' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                  <code className="text-sm font-mono">./scripts/test-api-simple.sh</code>
                </div>
              </div>
              <div className="mt-4 p-3 bg-success/10 border border-success/30 rounded-md">
                <p className="text-sm text-success flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  No configuration needed - works immediately!
                </p>
              </div>
            </div>

            {/* Environment Setup */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <Settings className="h-5 w-5 text-muted-foreground mr-2" />
                2. Environment Configuration
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Copy environment templates</p>
                    <code className="text-xs text-muted-foreground">cp backend/.env.example backend/.env</code>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Add API keys (optional)</p>
                    <p className="text-xs text-muted-foreground">OpenAI, Anthropic, Supabase, etc.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Restart services</p>
                    <code className="text-xs text-muted-foreground">make restart</code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Try It Now Box */}
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-6">
            <h3 className="font-semibold mb-3 flex items-center">
              <Zap className="h-5 w-5 text-accent mr-2" />
              Try It Right Now!
            </h3>
            <p className="text-sm mb-4">Test the authentication flow in demo mode:</p>
            <div className="flex flex-wrap gap-3">
              {!user ? (
                <>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 text-sm font-medium"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Try Demo Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center px-4 py-2 bg-background border border-border rounded-md hover:bg-muted text-sm font-medium"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Create Demo Account
                  </Link>
                </>
              ) : (
                <div className="inline-flex items-center px-4 py-2 bg-muted text-muted-foreground rounded-md text-sm font-medium">
                  <Lock className="h-4 w-4 mr-2" />
                  Sign in to see protected content
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Architecture Overview Section */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Layers className="h-6 w-6 text-accent mr-2" />
              Architecture Overview
            </h2>
            <p className="text-muted-foreground">
              Understanding the folder structure and where to build your features.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Frontend Structure */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <Code2 className="h-5 w-5 text-muted-foreground mr-2" />
                Frontend Structure
              </h3>
              <div className="space-y-3">
                <div className="bg-muted/50 p-3 rounded-md">
                  <code className="text-sm font-mono block mb-2">frontend/app/</code>
                  <p className="text-xs text-muted-foreground">
                    🎯 <strong>Your application pages</strong> - Build your features here!
                  </p>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-md">
                  <code className="text-sm font-mono block mb-2">frontend/app/(authenticated)/</code>
                  <p className="text-xs text-muted-foreground">
                    🔒 Protected pages that require login
                  </p>
                </div>

                <div className="bg-warning/10 p-3 rounded-md">
                  <code className="text-sm font-mono block mb-2">frontend/app/prompt-stack/</code>
                  <p className="text-xs text-warning">
                    📚 Demo pages and this guide (don't build here!)
                  </p>
                </div>

                <div className="bg-muted/50 p-3 rounded-md">
                  <code className="text-sm font-mono block mb-2">frontend/components/</code>
                  <p className="text-xs text-muted-foreground">
                    🧩 Reusable React components
                  </p>
                </div>

                <div className="bg-muted/50 p-3 rounded-md">
                  <code className="text-sm font-mono block mb-2">frontend/lib/</code>
                  <p className="text-xs text-muted-foreground">
                    🛠️ Utilities and helper functions
                  </p>
                </div>
              </div>
            </div>

            {/* Backend Structure */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <Database className="h-5 w-5 text-muted-foreground mr-2" />
                Backend Structure
              </h3>
              <div className="space-y-3">
                <div className="bg-muted/50 p-3 rounded-md">
                  <code className="text-sm font-mono block mb-2">backend/app/api/endpoints/</code>
                  <p className="text-xs text-muted-foreground">
                    🚀 API route handlers
                  </p>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-md">
                  <code className="text-sm font-mono block mb-2">backend/app/services/</code>
                  <p className="text-xs text-muted-foreground">
                    💼 Business logic (LLM, auth, payments)
                  </p>
                </div>

                <div className="bg-muted/50 p-3 rounded-md">
                  <code className="text-sm font-mono block mb-2">backend/app/models/</code>
                  <p className="text-xs text-muted-foreground">
                    📋 Data models and schemas
                  </p>
                </div>

                <div className="bg-muted/50 p-3 rounded-md">
                  <code className="text-sm font-mono block mb-2">backend/app/core/</code>
                  <p className="text-xs text-muted-foreground">
                    ⚙️ Configuration and utilities
                  </p>
                </div>

                <div className="bg-muted/50 p-3 rounded-md">
                  <code className="text-sm font-mono block mb-2">backend/.env</code>
                  <p className="text-xs text-muted-foreground">
                    🔑 Environment variables and API keys
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="mt-6 bg-accent/10 border border-accent/30 rounded-lg p-6">
            <h4 className="font-semibold mb-2 flex items-center">
              <Zap className="h-5 w-5 text-accent mr-2" />
              Key Principle: Build in the Right Place
            </h4>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm font-medium text-success mb-2">✅ DO Build Here:</p>
                <ul className="text-xs space-y-1">
                  <li>• <code className="bg-muted px-1 rounded">app/dashboard/page.tsx</code></li>
                  <li>• <code className="bg-muted px-1 rounded">app/(authenticated)/profile/page.tsx</code></li>
                  <li>• <code className="bg-muted px-1 rounded">app/api/custom-endpoint/route.ts</code></li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-destructive mb-2">❌ DON'T Build Here:</p>
                <ul className="text-xs space-y-1">
                  <li>• <code className="bg-muted px-1 rounded">app/prompt-stack/*</code> (demos only)</li>
                  <li>• <code className="bg-muted px-1 rounded">app/auth/*</code> (already built)</li>
                  <li>• Root config files (unless necessary)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features Section */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Component className="h-6 w-6 text-accent mr-2" />
              Core Features Walkthrough
            </h2>
            <p className="text-muted-foreground">
              Explore each feature with interactive examples and code snippets.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Authentication Feature */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <Shield className="h-8 w-8 text-accent" />
                <span className="text-xs bg-success/20 text-success px-2 py-1 rounded">Ready</span>
              </div>
              <h3 className="font-semibold mb-2">Authentication System</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Supabase auth with demo mode fallback. Includes login, register, and protected routes.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-xs">
                  <CheckCircle className="h-3 w-3 text-success mr-2" />
                  <span>Email/password authentication</span>
                </div>
                <div className="flex items-center text-xs">
                  <CheckCircle className="h-3 w-3 text-success mr-2" />
                  <span>Protected route middleware</span>
                </div>
                <div className="flex items-center text-xs">
                  <CheckCircle className="h-3 w-3 text-success mr-2" />
                  <span>Demo mode for testing</span>
                </div>
              </div>
              <Link
                href="/auth/login"
                className="text-sm text-accent hover:underline flex items-center"
              >
                Try it now <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>

            {/* AI Integration Feature */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <Sparkles className="h-8 w-8 text-accent" />
                <span className="text-xs bg-success/20 text-success px-2 py-1 rounded">Ready</span>
              </div>
              <h3 className="font-semibold mb-2">AI Integration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Multiple LLM providers with streaming support and demo fallback.
              </p>
              <div className="bg-muted/50 p-3 rounded-md mb-4">
                <code className="text-xs font-mono break-all">
                  POST /api/llm/generate
                </code>
              </div>
              <div className="space-y-1 text-xs mb-4">
                <div>• OpenAI (GPT-4o)</div>
                <div>• Anthropic (Claude)</div>
                <div>• Google (Gemini)</div>
                <div>• Demo mode included</div>
              </div>
              <Link
                href="/test-api"
                className="text-sm text-accent hover:underline flex items-center"
              >
                Test Your API <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>

            {/* Vector Search Feature */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <Database className="h-8 w-8 text-accent" />
                <span className="text-xs bg-success/20 text-success px-2 py-1 rounded">Ready</span>
              </div>
              <h3 className="font-semibold mb-2">Vector Search</h3>
              <p className="text-sm text-muted-foreground mb-4">
                PostgreSQL with pgvector for semantic search. In-memory demo mode.
              </p>
              <div className="bg-muted/50 p-3 rounded-md mb-4 space-y-1">
                <code className="text-xs font-mono block">POST /api/vectors/embed</code>
                <code className="text-xs font-mono block">POST /api/vectors/search</code>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Perfect for RAG applications and semantic search features.
              </p>
              <a
                href="http://localhost:8000/docs#/vectordb"
                target="_blank"
                className="text-sm text-accent hover:underline flex items-center"
              >
                View API Docs <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>

            {/* Payment Integration */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <Zap className="h-8 w-8 text-accent" />
                <span className="text-xs bg-success/20 text-success px-2 py-1 rounded">Ready</span>
              </div>
              <h3 className="font-semibold mb-2">Payment Processing</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Stripe & Lemon Squeezy integration with demo checkout flows.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-xs">
                  <CheckCircle className="h-3 w-3 text-success mr-2" />
                  <span>Subscription management</span>
                </div>
                <div className="flex items-center text-xs">
                  <CheckCircle className="h-3 w-3 text-success mr-2" />
                  <span>Webhook handling</span>
                </div>
                <div className="flex items-center text-xs">
                  <CheckCircle className="h-3 w-3 text-success mr-2" />
                  <span>Demo checkout flow</span>
                </div>
              </div>
              <Link
                href="#payments"
                className="text-sm text-accent hover:underline flex items-center"
              >
                View demo <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>

            {/* Form Components */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <Component className="h-8 w-8 text-accent" />
                <span className="text-xs bg-success/20 text-success px-2 py-1 rounded">Ready</span>
              </div>
              <h3 className="font-semibold mb-2">Form Components</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Reusable form components with validation and error handling.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-xs">
                  <CheckCircle className="h-3 w-3 text-success mr-2" />
                  <span>Input validation</span>
                </div>
                <div className="flex items-center text-xs">
                  <CheckCircle className="h-3 w-3 text-success mr-2" />
                  <span>Error states</span>
                </div>
                <div className="flex items-center text-xs">
                  <CheckCircle className="h-3 w-3 text-success mr-2" />
                  <span>Loading states</span>
                </div>
              </div>
              <Link
                href="#forms"
                className="text-sm text-accent hover:underline flex items-center"
              >
                View components <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>

            {/* API Documentation */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <FileText className="h-8 w-8 text-accent" />
                <span className="text-xs bg-success/20 text-success px-2 py-1 rounded">Live</span>
              </div>
              <h3 className="font-semibold mb-2">API Documentation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Auto-generated FastAPI docs with interactive testing.
              </p>
              <div className="bg-muted/50 p-3 rounded-md mb-4">
                <code className="text-xs font-mono">
                  http://localhost:8000/docs
                </code>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Test endpoints directly from the browser with Swagger UI.
              </p>
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                className="text-sm text-accent hover:underline flex items-center"
              >
                Open API Docs <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
        </section>

        {/* Code Examples Section */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Code2 className="h-6 w-6 text-accent mr-2" />
              Code Examples
            </h2>
            <p className="text-muted-foreground">
              Copy these examples to quickly implement common features.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Protected Route Example */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-3">Creating a Protected Page</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add this to <code className="text-xs bg-muted px-1 py-0.5 rounded">app/(authenticated)/your-page/page.tsx</code>
              </p>
              <div className="bg-muted/50 p-4 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground">TypeScript</span>
                  <button
                    onClick={() => copyToClipboard(`export default function YourProtectedPage() {
  const { user } = useAuth()
  
  return (
    <div>
      <h1>Welcome, {user?.email}!</h1>
      {/* Your protected content */}
    </div>
  )
}`, 'protected')}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {copiedCode === 'protected' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <pre className="text-xs overflow-x-auto">
                  <code>{`export default function YourProtectedPage() {
  const { user } = useAuth()
  
  return (
    <div>
      <h1>Welcome, {user?.email}!</h1>
      {/* Your protected content */}
    </div>
  )
}`}</code>
                </pre>
              </div>
            </div>

            {/* AI API Call Example */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-3">Making AI API Calls</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Example using the LLM generation endpoint:
              </p>
              <div className="bg-muted/50 p-4 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground">JavaScript</span>
                  <button
                    onClick={() => copyToClipboard(`const response = await fetch('/api/llm/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Your prompt here',
    model: 'gpt-4o-mini', // or 'demo'
    stream: false
  })
})

const data = await response.json()
console.log(data.content)`, 'ai-call')}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {copiedCode === 'ai-call' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <pre className="text-xs overflow-x-auto">
                  <code>{`const response = await fetch('/api/llm/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Your prompt here',
    model: 'gpt-4o-mini', // or 'demo'
    stream: false
  })
})

const data = await response.json()
console.log(data.content)`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Common Patterns Section */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Component className="h-6 w-6 text-accent mr-2" />
              Common Patterns
            </h2>
            <p className="text-muted-foreground">
              Best practices and patterns used throughout Prompt-Stack.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Error Handling Pattern */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-3">Error Handling</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Consistent error handling across frontend and backend:
              </p>
              <div className="bg-muted/50 p-4 rounded-md">
                <pre className="text-xs overflow-x-auto">
                  <code>{`// Frontend error handling
try {
  const res = await fetch('/api/endpoint')
  const data = await res.json()
  
  if (!data.success) {
    setError(data.message || 'Something went wrong')
    return
  }
  
  // Process data
} catch (error) {
  setError('Network error')
} finally {
  setLoading(false)
}`}</code>
                </pre>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                <p>• Always check <code className="bg-muted px-1 rounded">data.success</code></p>
                <p>• Display user-friendly error messages</p>
                <p>• Include loading states</p>
              </div>
            </div>

            {/* Loading States Pattern */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-3">Loading States</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Provide feedback during async operations:
              </p>
              <div className="bg-muted/50 p-4 rounded-md">
                <pre className="text-xs overflow-x-auto">
                  <code>{`// Loading state pattern
const [loading, setLoading] = useState(false)
const [data, setData] = useState(null)

async function fetchData() {
  setLoading(true)
  try {
    const result = await api.getData()
    setData(result)
  } finally {
    setLoading(false)
  }
}

// In your component
{loading ? (
  <div className="animate-pulse">Loading...</div>
) : (
  <div>{data}</div>
)}`}</code>
                </pre>
              </div>
            </div>

            {/* Form Validation Pattern */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-3">Form Validation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Client-side validation before API calls:
              </p>
              <div className="bg-muted/50 p-4 rounded-md">
                <pre className="text-xs overflow-x-auto">
                  <code>{`// Form validation pattern
function validateForm() {
  const errors = {}
  
  if (!email.includes('@')) {
    errors.email = 'Valid email required'
  }
  
  if (password.length < 6) {
    errors.password = 'Min 6 characters'
  }
  
  setErrors(errors)
  return Object.keys(errors).length === 0
}

// On submit
if (!validateForm()) return`}</code>
                </pre>
              </div>
            </div>

            {/* API Response Pattern */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-3">API Response Format</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Standardized API responses:
              </p>
              <div className="bg-muted/50 p-4 rounded-md">
                <pre className="text-xs overflow-x-auto">
                  <code>{`// Success response
{
  "success": true,
  "data": { /* your data */ },
  "message": "Success"
}

// Error response
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}`}</code>
                </pre>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                <p>• Always include <code className="bg-muted px-1 rounded">success</code> boolean</p>
                <p>• Consistent structure across all endpoints</p>
                <p>• Clear error messages for debugging</p>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps Section */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <BookOpen className="h-6 w-6 text-accent mr-2" />
              Next Steps
            </h2>
            <p className="text-muted-foreground">
              Ready to build? Here's how to customize Prompt-Stack for your project:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/30 rounded-lg p-6">
              <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                <Database className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">1. Set Up Your Database</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure Supabase for production authentication and data storage.
              </p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Create Supabase project</li>
                <li>• Add environment variables</li>
                <li>• Enable authentication</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/30 rounded-lg p-6">
              <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">2. Add AI Capabilities</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your preferred AI providers for advanced features.
              </p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Add API keys to .env</li>
                <li>• Choose your models</li>
                <li>• Implement AI features</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/30 rounded-lg p-6">
              <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                <Rocket className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">3. Deploy to Production</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ship your app with confidence using our deployment guides.
              </p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Deploy frontend to Vercel</li>
                <li>• Deploy backend to Railway</li>
                <li>• Configure production env</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Troubleshooting Section */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Settings className="h-6 w-6 text-accent mr-2" />
              Troubleshooting Guide
            </h2>
            <p className="text-muted-foreground">
              Common issues and how to fix them.
            </p>
          </div>

          <div className="space-y-6">
            {/* Docker Issues */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-3 text-destructive">🐳 Docker Issues</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Containers won't start:</p>
                  <div className="bg-muted/50 p-3 rounded-md">
                    <code className="text-xs">docker-compose -f docker-compose.dev.yml down</code>
                    <br />
                    <code className="text-xs">docker-compose -f docker-compose.dev.yml up -d</code>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Port already in use:</p>
                  <div className="bg-muted/50 p-3 rounded-md">
                    <code className="text-xs"># Find what's using port 3000</code>
                    <br />
                    <code className="text-xs">lsof -i :3000</code>
                    <br />
                    <code className="text-xs"># Kill the process</code>
                    <br />
                    <code className="text-xs">kill -9 [PID]</code>
                  </div>
                </div>
              </div>
            </div>

            {/* Environment Variable Issues */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-3 text-warning">🔑 Environment Variables</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Changes not taking effect:</p>
                  <div className="bg-warning/10 p-3 rounded-md">
                    <p className="text-xs text-warning mb-2">⚠️ Docker requires full restart for env changes!</p>
                    <code className="text-xs">docker-compose -f docker-compose.dev.yml down</code>
                    <br />
                    <code className="text-xs">docker-compose -f docker-compose.dev.yml up -d</code>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">API key format issues:</p>
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-xs mb-2">Correct format in .env:</p>
                    <code className="text-xs text-success">OPENAI_API_KEY=sk-...</code>
                    <br />
                    <code className="text-xs text-destructive line-through">OpenAI=sk-...</code>
                  </div>
                </div>
              </div>
            </div>

            {/* Authentication Issues */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-3 text-accent">🔐 Authentication Problems</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">"Supabase not configured" when testing LLMs:</p>
                  <div className="bg-accent/10 p-3 rounded-md">
                    <p className="text-xs text-accent">You need Supabase for authentication before testing LLMs!</p>
                    <p className="text-xs mt-2">Setup order: Supabase → LLMs → Other services</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Can't sign in:</p>
                  <ul className="text-xs space-y-1 ml-4">
                    <li>• Check Supabase URL and keys are correct</li>
                    <li>• Verify email confirmation if using real Supabase</li>
                    <li>• Try demo mode first to isolate issues</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* API Issues */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-3 text-accent">🚀 API Connection Issues</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Frontend can't reach backend:</p>
                  <ul className="text-xs space-y-1 ml-4">
                    <li>• Ensure backend is running: <code className="bg-muted px-1 rounded">docker ps</code></li>
                    <li>• Check logs: <code className="bg-muted px-1 rounded">docker logs prompt-stack-backend-1</code></li>
                    <li>• Verify API URL: <code className="bg-muted px-1 rounded">http://localhost:8000</code></li>
                  </ul>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">CORS errors:</p>
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-xs">Check CORS_ORIGINS in backend/.env includes your frontend URL</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Debug Commands */}
          <div className="mt-6 bg-accent/10 border border-accent/30 rounded-lg p-6">
            <h4 className="font-semibold mb-3">🔧 Quick Debug Commands</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Check Status:</p>
                <div className="space-y-1">
                  <code className="text-xs block bg-muted/50 p-2 rounded">docker ps</code>
                  <code className="text-xs block bg-muted/50 p-2 rounded">make logs</code>
                  <code className="text-xs block bg-muted/50 p-2 rounded">curl http://localhost:8000/</code>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Reset Everything:</p>
                <div className="space-y-1">
                  <code className="text-xs block bg-muted/50 p-2 rounded">make clean</code>
                  <code className="text-xs block bg-muted/50 p-2 rounded">make dev</code>
                  <code className="text-xs block bg-muted/50 p-2 rounded">./scripts/test-api-simple.sh</code>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Help Section */}
        <section className="bg-muted/30 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Prompt-Stack is designed to be AI-friendly. Use your favorite AI assistant to help you build faster.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com/your-repo"
              target="_blank"
              className="inline-flex items-center px-4 py-2 bg-background border border-border rounded-md hover:bg-muted text-sm font-medium"
            >
              <Code2 className="h-4 w-4 mr-2" />
              View on GitHub
            </a>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              className="inline-flex items-center px-4 py-2 bg-background border border-border rounded-md hover:bg-muted text-sm font-medium"
            >
              <FileText className="h-4 w-4 mr-2" />
              API Documentation
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}