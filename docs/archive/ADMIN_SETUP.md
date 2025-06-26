# Admin Setup Guide

This guide explains how to set up admin users in Prompt-Stack.

## How Admin Roles Work

Prompt-Stack uses a simple role-based system:
- **user**: Regular users with standard access
- **admin**: Administrative users with elevated privileges
- **super_admin**: Super administrators (reserved for future use)

## Three Ways to Become Admin

### 1. First User Automatically Becomes Admin

When you set up a fresh installation, the **first user to sign up automatically becomes admin**. This ensures you always have at least one admin user.

```bash
# Fresh install
1. Start the app
2. Sign up with your email
3. You're automatically admin!
```

### 2. Predefined Admin Emails

Add specific emails to the `ADMIN_EMAILS` environment variable in `backend/.env`:

```bash
# backend/.env
ADMIN_EMAILS=["rose@company.com","admin@company.com"]

# Or comma-separated:
ADMIN_EMAILS=rose@company.com,admin@company.com
```

Users signing up with these emails automatically get admin role.

### 3. Development Mode Magic Email

In development mode only, you can use the `+admin` email trick:

```bash
# Only works when ENVIRONMENT=development
rose+admin@gmail.com → admin role
rose@gmail.com → regular user
```

This makes testing different roles easy during development.

## Database Migrations

The admin system requires running migrations to add the role column:

```bash
# From the supabase directory
cd supabase
./setup-database.sh

# Choose option 2 to apply to remote database
# Or option 1 for local development
```

## Checking User Roles

### In the Backend

```python
from app.services.auth.role_service import role_service

# Check if user is admin
is_admin = await role_service.is_admin(user_id)

# Check specific role
has_admin = await role_service.has_role(user_id, "admin")

# Get user's role
role = await role_service.check_user_role(user_id)
```

### In the Database

```sql
-- View all admins
SELECT email, role FROM profiles WHERE role IN ('admin', 'super_admin');

-- Manually promote user to admin
UPDATE profiles SET role = 'admin' WHERE email = 'user@example.com';
```

## Demo Mode

In demo mode (when no Supabase is configured), all users are automatically admins. This makes it easy to test admin features without setting up authentication.

## Frontend Integration

The user's role is included in the authentication response:

```javascript
// After signin/signup
const { user } = response;
console.log(user.role); // 'user', 'admin', or 'super_admin'

// Check if admin
const isAdmin = user.role === 'admin' || user.role === 'super_admin';
```

## Security Notes

1. **Role changes require backend restart** - If you update `ADMIN_EMAILS`, restart the backend container
2. **Roles are stored in the database** - The source of truth is the `profiles.role` column
3. **First user protection** - Once you have users, new signups won't automatically become admin
4. **Development-only features** - The `+admin` email trick only works in development mode

## Troubleshooting

### User didn't get admin role

1. Check if email is in `ADMIN_EMAILS`:
   ```bash
   grep ADMIN_EMAILS backend/.env
   ```

2. Verify migrations were applied:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'profiles' AND column_name = 'role';
   ```

3. Manually update in Supabase dashboard:
   - Go to Table Editor → profiles
   - Find user and change role to 'admin'

### Can't find admin features

Admin features are not automatically visible. You need to:
1. Check user role in your components
2. Conditionally show admin UI
3. Protect admin API endpoints

## Example Admin-Only Feature

```typescript
// Frontend component
export function AdminPanel({ user }) {
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return <div>Access denied</div>;
  }
  
  return <div>Admin controls here</div>;
}

// Backend endpoint
@router.post("/admin/action")
async def admin_action(user_id: str = Depends(get_current_user)):
    if not await role_service.is_admin(user_id):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Admin logic here
```