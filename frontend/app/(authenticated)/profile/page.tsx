'use client';

import { useAuth } from '@/components/providers/auth-provider';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="text-accent hover:text-accent/90 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Your Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground">Email</label>
              <p className="mt-1 text-sm text-foreground">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">User ID</label>
              <p className="mt-1 text-sm text-foreground font-mono">{user?.id}</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-accent/10 rounded">
            <p className="text-sm text-accent">
              💡 This is a placeholder page. Build your profile features here!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}