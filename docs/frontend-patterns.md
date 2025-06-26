# Frontend Patterns

This guide covers TypeScript/React patterns and best practices used throughout the frontend codebase.

## Component Patterns

### Component Structure
```
components/
├── ui/                 # Base UI components
│   ├── button.tsx
│   ├── input.tsx
│   └── card.tsx
├── forms/             # Form components
│   ├── LoginForm.tsx
│   └── PaymentForm.tsx
├── layout/            # Layout components
│   ├── Navigation.tsx
│   └── Footer.tsx
└── providers/         # Context providers
    ├── auth-provider.tsx
    └── theme-provider.tsx
```

### Component Template
```typescript
// components/UserProfile.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { User } from '@/types/user'

interface UserProfileProps {
  userId: string
  onUpdate?: (user: User) => void
  className?: string
}

export function UserProfile({ 
  userId, 
  onUpdate,
  className 
}: UserProfileProps) {
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    loadUser()
  }, [userId])
  
  async function loadUser() {
    try {
      setLoading(true)
      const data = await fetchUser(userId)
      setUser(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />
  if (!user) return <NotFound />
  
  return (
    <Card className={className}>
      {/* Component content */}
    </Card>
  )
}
```

### Compound Components
```typescript
// components/DataTable/index.tsx
interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  children?: React.ReactNode
}

export function DataTable<T>({ data, columns, children }: DataTableProps<T>) {
  return (
    <DataTableProvider data={data} columns={columns}>
      <div className="data-table">
        {children || (
          <>
            <DataTableHeader />
            <DataTableBody />
            <DataTablePagination />
          </>
        )}
      </div>
    </DataTableProvider>
  )
}

DataTable.Header = DataTableHeader
DataTable.Body = DataTableBody
DataTable.Pagination = DataTablePagination
DataTable.Search = DataTableSearch

// Usage
<DataTable data={users} columns={columns}>
  <DataTable.Search />
  <DataTable.Header />
  <DataTable.Body />
  <DataTable.Pagination />
</DataTable>
```

## Custom Hooks

### Data Fetching Hook
```typescript
// hooks/useApiCall.ts
import { useState, useCallback } from 'react'
import { ApiError } from '@/lib/errors'

interface UseApiCallState<T> {
  data: T | null
  error: Error | null
  loading: boolean
}

interface UseApiCallResult<T> extends UseApiCallState<T> {
  execute: (...args: any[]) => Promise<T | null>
  reset: () => void
}

export function useApiCall<T>(
  apiFunction: (...args: any[]) => Promise<T>
): UseApiCallResult<T> {
  const [state, setState] = useState<UseApiCallState<T>>({
    data: null,
    error: null,
    loading: false,
  })
  
  const execute = useCallback(async (...args: any[]) => {
    setState({ data: null, error: null, loading: true })
    
    try {
      const result = await apiFunction(...args)
      setState({ data: result, error: null, loading: false })
      return result
    } catch (error) {
      const apiError = error instanceof Error ? error : new Error('Unknown error')
      setState({ data: null, error: apiError, loading: false })
      
      // Handle specific errors
      if (error instanceof ApiError && error.code === 'AUTH_REQUIRED') {
        window.location.href = '/auth/login'
      }
      
      return null
    }
  }, [apiFunction])
  
  const reset = useCallback(() => {
    setState({ data: null, error: null, loading: false })
  }, [])
  
  return { ...state, execute, reset }
}
```

### Local Storage Hook
```typescript
// hooks/useLocalStorage.ts
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Get from local storage then parse stored json or return initialValue
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }
  
  const [storedValue, setStoredValue] = useState<T>(readValue)
  
  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Save to local storage
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
        
        // Dispatch storage event for cross-tab sync
        window.dispatchEvent(new Event('local-storage'))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }
  
  useEffect(() => {
    setStoredValue(readValue())
  }, [])
  
  // Sync between tabs
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue())
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('local-storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('local-storage', handleStorageChange)
    }
  }, [])
  
  return [storedValue, setValue]
}
```

### Debounce Hook
```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])
  
  return debouncedValue
}

// Usage
function SearchInput() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  
  useEffect(() => {
    if (debouncedSearch) {
      performSearch(debouncedSearch)
    }
  }, [debouncedSearch])
  
  return (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

## State Management

### Context Pattern
```typescript
// contexts/AppContext.tsx
import { createContext, useContext, useReducer, ReactNode } from 'react'

interface AppState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  notifications: Notification[]
}

type AppAction =
  | { type: 'SET_THEME'; theme: 'light' | 'dark' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'ADD_NOTIFICATION'; notification: Notification }
  | { type: 'REMOVE_NOTIFICATION'; id: string }

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | undefined>(undefined)

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.theme }
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen }
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [...state.notifications, action.notification] 
      }
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.id)
      }
    default:
      return state
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, {
    theme: 'light',
    sidebarOpen: true,
    notifications: []
  })
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

// Helper hooks
export function useTheme() {
  const { state, dispatch } = useApp()
  
  const setTheme = (theme: 'light' | 'dark') => {
    dispatch({ type: 'SET_THEME', theme })
  }
  
  return { theme: state.theme, setTheme }
}
```

### Zustand Store (Alternative)
```typescript
// stores/userStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserStore {
  user: User | null
  preferences: UserPreferences
  setUser: (user: User | null) => void
  updatePreferences: (prefs: Partial<UserPreferences>) => void
  logout: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      preferences: {
        theme: 'system',
        language: 'en',
        notifications: true,
      },
      
      setUser: (user) => set({ user }),
      
      updatePreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs }
        })),
      
      logout: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ preferences: state.preferences }),
    }
  )
)
```

## API Layer

### API Client
```typescript
// lib/api/client.ts
import { getAuthToken } from '@/lib/auth'

interface ApiConfig extends RequestInit {
  params?: Record<string, string>
  timeout?: number
}

class ApiClient {
  private baseUrl: string
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }
  
  async request<T>(
    endpoint: string,
    config: ApiConfig = {}
  ): Promise<T> {
    const { params, timeout = 10000, ...init } = config
    
    // Build URL with params
    const url = new URL(endpoint, this.baseUrl)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }
    
    // Setup abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(url.toString(), {
        ...init,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`,
          ...init.headers,
        },
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw await this.handleError(response)
      }
      
      const data = await response.json()
      return data.data // Assuming standard response format
      
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      
      throw error
    }
  }
  
  private async handleError(response: Response) {
    const data = await response.json().catch(() => ({}))
    
    return new ApiError(
      data.error || 'Request failed',
      data.code || 'UNKNOWN_ERROR',
      response.status,
      data.details
    )
  }
  
  // Convenience methods
  get<T>(endpoint: string, config?: ApiConfig) {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }
  
  post<T>(endpoint: string, body?: any, config?: ApiConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(body),
    })
  }
  
  put<T>(endpoint: string, body?: any, config?: ApiConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }
  
  delete<T>(endpoint: string, config?: ApiConfig) {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL!)
```

### Service Layer
```typescript
// services/userService.ts
import { apiClient } from '@/lib/api/client'
import type { User, UserUpdate, UserFilters } from '@/types/user'

export const userService = {
  async getMe(): Promise<User> {
    return apiClient.get('/users/me')
  },
  
  async getUser(id: string): Promise<User> {
    return apiClient.get(`/users/${id}`)
  },
  
  async listUsers(filters?: UserFilters): Promise<User[]> {
    return apiClient.get('/users', { params: filters })
  },
  
  async updateUser(id: string, data: UserUpdate): Promise<User> {
    return apiClient.put(`/users/${id}`, data)
  },
  
  async deleteUser(id: string): Promise<void> {
    return apiClient.delete(`/users/${id}`)
  },
  
  async uploadAvatar(file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    
    return apiClient.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}
```

## Form Handling

### React Hook Form Pattern
```typescript
// components/forms/UserSettingsForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const userSettingsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
  }),
})

type UserSettingsData = z.infer<typeof userSettingsSchema>

export function UserSettingsForm({ user, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserSettingsData>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      bio: user.bio,
      notifications: user.notifications,
    },
  })
  
  async function onFormSubmit(data: UserSettingsData) {
    try {
      await onSubmit(data)
      toast.success('Settings updated')
    } catch (error) {
      toast.error(error.message)
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          {...register('name')}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>
      
      <fieldset>
        <legend>Notifications</legend>
        <label>
          <input type="checkbox" {...register('notifications.email')} />
          Email notifications
        </label>
        <label>
          <input type="checkbox" {...register('notifications.push')} />
          Push notifications
        </label>
      </fieldset>
      
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
        
        <button
          type="button"
          onClick={() => reset()}
          className="btn btn-secondary"
        >
          Reset
        </button>
      </div>
    </form>
  )
}
```

## Performance Patterns

### Code Splitting
```typescript
// Lazy load heavy components
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('./Dashboard'))
const Analytics = lazy(() => import('./Analytics'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Suspense>
  )
}
```

### Memoization
```typescript
// Memoize expensive computations
import { useMemo } from 'react'

function DataGrid({ data, filters }) {
  const filteredData = useMemo(() => {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        return item[key] === value
      })
    })
  }, [data, filters])
  
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      // Expensive sorting logic
    })
  }, [filteredData])
  
  return <Grid data={sortedData} />
}

// Memoize components
import { memo } from 'react'

const ExpensiveComponent = memo(({ data }) => {
  // Component that re-renders only when data changes
  return <div>{/* Expensive render */}</div>
})
```

### Virtual Scrolling
```typescript
// components/VirtualList.tsx
import { useVirtual } from '@tanstack/react-virtual'

function VirtualList({ items }) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const rowVirtualizer = useVirtual({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5,
  })
  
  return (
    <div ref={parentRef} className="h-[400px] overflow-auto">
      <div
        style={{
          height: `${rowVirtualizer.totalSize}px`,
          position: 'relative',
        }}
      >
        {rowVirtualizer.virtualItems.map(virtualRow => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {items[virtualRow.index]}
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Testing Patterns

### Component Testing
```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
  
  it('is disabled when loading', () => {
    render(<Button loading>Click me</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
```

### Hook Testing
```typescript
// __tests__/hooks/useCounter.test.ts
import { renderHook, act } from '@testing-library/react'
import { useCounter } from '@/hooks/useCounter'

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter())
    expect(result.current.count).toBe(0)
  })
  
  it('initializes with custom value', () => {
    const { result } = renderHook(() => useCounter(10))
    expect(result.current.count).toBe(10)
  })
  
  it('increments count', () => {
    const { result } = renderHook(() => useCounter())
    
    act(() => {
      result.current.increment()
    })
    
    expect(result.current.count).toBe(1)
  })
  
  it('decrements count', () => {
    const { result } = renderHook(() => useCounter(5))
    
    act(() => {
      result.current.decrement()
    })
    
    expect(result.current.count).toBe(4)
  })
})
```