'use client';

import { useAuth } from '@/components/providers/auth-provider';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.email}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            This is your personal dashboard. Start building your app here.
          </p>
        </div>

        {/* Quick Start Guide */}
        <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Start</h2>
          <div className="prose prose-sm text-muted-foreground">
            <p>This is YOUR dashboard, not a demo. You can:</p>
            <ul>
              <li>Replace this page with your own content</li>
              <li>Add new pages in the <code>(authenticated)</code> folder</li>
              <li>Build your SaaS features here</li>
            </ul>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/profile" className="block">
            <div className="bg-card rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Profile</h3>
              <p className="text-muted-foreground text-sm">
                Manage your account settings and preferences
              </p>
            </div>
          </Link>

          <Link href="/settings" className="block">
            <div className="bg-card rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Settings</h3>
              <p className="text-muted-foreground text-sm">
                Configure your application settings
              </p>
            </div>
          </Link>

          <Link href="/test-api" className="block">
            <div className="bg-card rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">API Testing</h3>
              <p className="text-muted-foreground text-sm">
                Test your backend configuration
              </p>
            </div>
          </Link>

          <Link href="/test-ai" className="block">
            <div className="bg-card rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">AI Testing</h3>
              <p className="text-muted-foreground text-sm">
                Test your AI providers
              </p>
            </div>
          </Link>
        </div>

        {/* Dev Guide Link */}
        <div className="mt-8">
          <Link href="/dev-guide" className="inline-flex items-center text-accent hover:text-accent/80">
            View developer guide →
          </Link>
        </div>

        {/* Sign Out Button */}
        <div className="mt-8">
          <Link 
            href="/auth/logout"
            className="inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-foreground bg-card hover:bg-muted"
          >
            Sign Out
          </Link>
        </div>
      </div>
    </div>
  );
}