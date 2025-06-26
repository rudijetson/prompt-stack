# Admin System Security Implementation

This document describes the security measures implemented for the admin system.

## Security Improvements Made

### 1. ✅ Proper JWT Validation
- Created `app/core/auth.py` with real JWT validation
- Validates both Supabase and demo tokens
- Returns typed `AuthUser` object with role information
- Handles token expiration properly

### 2. ✅ Role-Based Access Control (RBAC)
- Added `require_role()` dependency for endpoint protection
- Convenience decorators: `require_admin`, `require_super_admin`
- All admin endpoints now require proper authentication

Example:
```python
@router.get("/admin-only")
async def admin_endpoint(user: AuthUser = Depends(require_admin)):
    # Only accessible by admins
```

### 3. ✅ Database Security

#### RLS Policies Fixed
- Users can update their profile EXCEPT the role field
- Only admins can update roles
- Last admin protection (can't demote yourself if you're the last admin)

#### Race Condition Prevention
- Uses advisory lock in `handle_new_user()` function
- Ensures only one "first user" can be created
- Atomic operations for role assignment

### 4. ✅ Admin API Endpoints
Created `/api/admin/*` endpoints with proper authorization:
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - List users with pagination
- `POST /api/admin/users/{id}/promote` - Promote user to admin
- `DELETE /api/admin/users/{id}` - Delete user (super_admin only)
- `GET /api/admin/audit/roles` - Role change history
- `GET /api/admin/config` - System configuration

### 5. ✅ Audit Logging
- `role_audit` table tracks all role changes
- Records who made the change and when
- Includes optional reason field
- Only viewable by admins

### 6. ✅ JWT Claims Enhancement
- Custom JWT hook adds role to token claims
- Role synced to user metadata on change
- Reduces database queries for role checks

### 7. ✅ Frontend Security
- Auth provider fetches user role from profiles
- Admin dashboard properly validates tokens
- Role-based UI elements (admin link only shown to admins)

## Security Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│     API     │────▶│  Database   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                    │                    │
       │              JWT Validation        RLS Policies
       │              Role Checking         Role Audit
       └── Token ────▶ Auth Middleware ───▶ Secure Data
```

## Migration Order

Apply these migrations in order:
1. `001_initial_schema.sql` - Base tables
2. `002_add_user_roles.sql` - Role system
3. `003_update_profile_creation_with_admin_logic.sql` - Admin detection
4. `004_fix_role_security.sql` - Security patches
5. `005_add_jwt_claims_function.sql` - JWT enhancement

## Testing Security

### 1. Test Role Self-Modification (Should Fail)
```sql
-- As a regular user, try to make yourself admin
UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
-- ERROR: new row violates row-level security policy
```

### 2. Test Admin Promotion (Should Work)
```python
# As an admin user
POST /api/admin/users/promote
{
  "email": "user@example.com",
  "role": "admin",
  "reason": "New team member"
}
```

### 3. Test Unauthorized Access (Should Fail)
```python
# Without token or as regular user
GET /api/admin/stats
# 401 Unauthorized or 403 Forbidden
```

### 4. Test Last Admin Protection (Should Fail)
```sql
-- As the last admin, try to demote yourself
UPDATE profiles SET role = 'user' 
WHERE id = auth.uid() AND role = 'admin';
-- ERROR: violates check constraint
```

## Remaining Considerations

### 1. Supabase Dashboard Configuration
After applying migrations, configure in Supabase Dashboard:
- Go to Authentication → Hooks
- Enable "Custom access token hook"
- Select function: `custom_access_token_hook`

### 2. Production Checklist
- [ ] Change `ENVIRONMENT` from "development" to "production"
- [ ] Remove or secure the `+admin` email trick
- [ ] Set strong JWT secret for demo mode
- [ ] Enable rate limiting on admin endpoints
- [ ] Set up monitoring for failed auth attempts
- [ ] Regular audit log reviews

### 3. Additional Security Layers
Consider adding:
- Two-factor authentication for admins
- IP allowlisting for admin endpoints
- Session timeout for admin users
- Suspicious activity detection

## Emergency Procedures

### If All Admins Are Locked Out
1. Access Supabase Dashboard
2. Run SQL Editor as service role:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'emergency@admin.com';
```

### If System Is Compromised
1. Revoke all sessions in Supabase Dashboard
2. Rotate all API keys
3. Review audit logs for unauthorized changes
4. Apply security patches
5. Reset all admin passwords

## Summary

The admin system now has:
- ✅ Real authentication (not placeholder)
- ✅ Server-side authorization
- ✅ Database-level security
- ✅ Audit trail
- ✅ Race condition protection
- ✅ Self-modification prevention
- ✅ Last admin protection

This is now a production-grade admin system with proper security controls.