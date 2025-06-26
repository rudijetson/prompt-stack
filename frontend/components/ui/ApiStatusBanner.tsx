'use client';

import { AlertTriangle } from 'lucide-react';
import { useCapabilities } from '@/lib/hooks/useCapabilities';

export function ApiStatusBanner() {
  const { isApiDown, error, refetch } = useCapabilities();
  
  if (!isApiDown) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <div className="text-sm font-medium">
              <span className="hidden sm:inline">
                API Connection Lost - Some features may be unavailable
              </span>
              <span className="sm:hidden">
                API Connection Lost
              </span>
            </div>
          </div>
          
          <button
            onClick={() => refetch()}
            className="text-xs underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}