'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Menu, X, User, LogOut, Home, FileText, LogIn, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { StatusIndicator } from './status-indicator';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading, signOut, isDemoMode } = useAuth();
  
  // Debug logging
  useEffect(() => {
    console.log('Navigation - User state:', user?.email, 'Loading:', loading, 'isDemoMode:', isDemoMode);
  }, [user, loading, isDemoMode]);

  async function handleSignOut() {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  // Simplified navigation
  const mainLinks = user ? [
    { href: '/', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    // Add admin link for admin users
    ...(user.role === 'admin' || user.role === 'super_admin' ? [
      { href: '/admin', label: 'Admin', icon: <Shield className="w-4 h-4" /> }
    ] : [])
  ] : [
    { href: '/', label: 'Home', icon: <Home className="w-4 h-4" /> },
  ];

  const navLinks = mainLinks;

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-semibold text-foreground">Prompt-Stack</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-10 md:flex md:space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(link.href)
                      ? 'text-foreground bg-muted'
                      : link.href === '/dashboard' && user
                      ? 'text-accent hover:text-accent/80 hover:bg-accent/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {link.icon}
                  <span className="ml-2">{link.label}</span>
                </Link>
              ))}
            </div>
            
            {/* Developer Tools Link */}
            <div className="hidden md:ml-6 md:flex md:items-center">
              <Link 
                href="/dev-guide" 
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md"
              >
                <FileText className="w-4 h-4" />
                <span className="ml-2">Dev Guide</span>
              </Link>
            </div>
          </div>

          {/* Status and User Menu */}
          <div className="hidden md:flex md:items-center md:gap-4">
            <DarkModeToggle />
            <StatusIndicator />
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-foreground">
                      <User className="h-4 w-4 mr-2" />
                      <span className="hidden lg:block">{user.email}</span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="ml-2 hidden lg:block">Sign out</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/auth/register"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-accent-foreground bg-accent hover:bg-accent/90 rounded-md"
                    >
                      Create account
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="pt-2 pb-3 space-y-1 px-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center px-3 py-2 text-base font-medium rounded-md ${
                  isActive(link.href)
                    ? 'text-foreground bg-muted'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {link.icon}
                <span className="ml-2">{link.label}</span>
              </Link>
            ))}
            
            {/* Dev Guide in mobile */}
            <Link
              href="/dev-guide"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md"
            >
              <FileText className="w-4 h-4" />
              <span className="ml-2">Dev Guide</span>
            </Link>
          </div>
          
          {/* Dark Mode Toggle in Mobile */}
          <div className="px-4 py-3 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Dark Mode</span>
              <DarkModeToggle />
            </div>
          </div>
          
          {!loading && (
            <div className="pt-4 pb-3 border-t border-border px-4">
              {user ? (
                <div className="space-y-1">
                  <div className="flex items-center px-3 py-2 text-sm text-foreground">
                    <User className="h-4 w-4 mr-2" />
                    {user.email}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign in
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-sm font-medium text-accent-foreground bg-accent hover:bg-accent/90 rounded-md"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Create account
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}