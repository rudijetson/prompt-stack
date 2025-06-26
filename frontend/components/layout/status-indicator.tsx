'use client';

import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useCapabilities } from '@/lib/hooks/useCapabilities';
import { useEffect, useState } from 'react';

export function StatusIndicator() {
  const [mounted, setMounted] = useState(false);
  const { capabilities, isLoading, isDemoMode, hasRealAuth, hasRealAI, mode, error } = useCapabilities();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-400">
        <span>...</span>
      </div>
    );
  }

  // Always show something for debugging
  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-400">
        <span>Loading...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-xs font-medium text-red-600">
        <span>Error: {error.message}</span>
      </div>
    );
  }
  
  if (!capabilities) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-400">
        <span>Connecting...</span>
      </div>
    );
  }

  const getStatusColor = () => {
    if (hasRealAuth && hasRealAI) return 'text-green-600';
    if (hasRealAuth || hasRealAI) return 'text-yellow-600';
    return 'text-gray-400';
  };

  const getStatusIcon = () => {
    if (hasRealAuth && hasRealAI) {
      return <CheckCircle className="w-4 h-4" />;
    }
    if (hasRealAuth || hasRealAI) {
      return <AlertCircle className="w-4 h-4" />;
    }
    return <XCircle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (isDemoMode) return 'Demo Mode';
    if (mode === 'mixed') return 'Mixed Mode';
    if (hasRealAuth && hasRealAI) return 'Production';
    if (hasRealAuth) return 'Auth Only';
    if (hasRealAI) return 'AI Only';
    return 'Not Configured';
  };

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-xs font-medium ${getStatusColor()}`}>
      {getStatusIcon()}
      <span>{getStatusText()}</span>
    </div>
  );
}