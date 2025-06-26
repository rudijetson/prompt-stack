'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Users, Settings, Activity } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    totalRequests: 0,
    systemHealth: 'healthy'
  })

  useEffect(() => {
    // Redirect non-admins
    if (!loading && (!user || (user.role !== 'admin' && user.role !== 'super_admin'))) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  useEffect(() => {
    // Fetch admin stats
    const fetchStats = async () => {
      try {
        // Get the session from Supabase or demo auth
        let token = ''
        if (user?.demo) {
          // For demo mode, we need to get the token from localStorage
          const storedUser = localStorage.getItem('demo_auth_user')
          if (storedUser) {
            try {
              const parsed = JSON.parse(storedUser)
              token = parsed.token || ''
            } catch (e) {
              console.error('Failed to parse demo token')
            }
          }
        } else {
          // For real Supabase auth, use the client
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )
          const { data: { session } } = await supabase.auth.getSession()
          token = session?.access_token || ''
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setStats(data.data || stats)
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error)
      }
    }

    if (user?.role === 'admin' || user?.role === 'super_admin') {
      fetchStats()
    }
  }, [user])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return <div className="flex items-center justify-center min-h-screen">Access Denied</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {user.email}. You have {user.role} privileges.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeToday}</div>
            <p className="text-xs text-muted-foreground">Users active in last 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Requests</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
            <p className="text-xs text-muted-foreground">Total API calls today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <div className={`h-3 w-3 rounded-full ${stats.systemHealth === 'healthy' ? 'bg-success' : 'bg-destructive'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{stats.systemHealth}</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>View and manage user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="secondary">
              Manage Users
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
            <CardDescription>Configure system settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="secondary">
              System Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>View detailed analytics and reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="secondary">
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Demo Mode Notice */}
      {user.demo && (
        <div className="mt-8 p-4 bg-warning/10 border border-warning rounded-lg">
          <p className="text-sm text-warning">
            <strong>Demo Mode:</strong> You're viewing the admin dashboard in demo mode. 
            In production, this would show real user data and system metrics.
          </p>
        </div>
      )}
    </div>
  )
}