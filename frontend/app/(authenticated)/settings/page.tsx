'use client';

import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="text-accent hover:text-accent/90 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Application Settings</h2>
          <div className="mt-6 p-4 bg-accent/10 rounded">
            <p className="text-sm text-accent">
              💡 This is a placeholder page. Build your settings here!
            </p>
            <p className="text-sm text-accent/90 mt-2">
              You might add: API keys, notifications, preferences, etc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}