# Frontend Development Guidelines

## ⚠️ CRITICAL: NO MIGRATIONS IN FRONTEND ⚠️

This frontend application is configured for **DATA OPERATIONS ONLY**.

### What the Frontend CAN Do:
✅ Read data from existing tables (`supabase.from('table').select()`)
✅ Insert new records (`supabase.from('table').insert()`)
✅ Update existing records (`supabase.from('table').update()`)
✅ Delete records (`supabase.from('table').delete()`)
✅ Authenticate users (`supabase.auth.*`)
✅ Upload/download files from storage (`supabase.storage.*`)

### What the Frontend CANNOT Do:
❌ Create or alter tables (CREATE TABLE, ALTER TABLE, DROP TABLE)
❌ Create indexes, functions, triggers, or views
❌ Modify database schema in any way
❌ Call `supabase.rpc()` for schema modifications
❌ Create storage buckets programmatically
❌ Run migration scripts or SQL files

## Why This Matters

Running migrations from the frontend causes:
- **Conflicts**: Multiple clients trying to modify schema simultaneously
- **Security risks**: Exposing migration logic to client-side
- **Errors**: Frontend doesn't have necessary permissions for DDL operations
- **Deployment issues**: Schema changes should be version-controlled and tested

## Proper Migration Workflow

All database migrations must be handled through:

1. **Supabase Dashboard**
   - Go to SQL Editor
   - Paste migration SQL
   - Execute in controlled environment

2. **Supabase CLI** (if installed)
   ```powershell
   supabase db push
   ```

3. **Backend API**
   - Create migration files in `supabase/migrations/`
   - Version control with Git
   - Deploy through proper CI/CD pipeline

## Files Removed

The following migration-related files have been removed from the frontend:
- ❌ `apply-migration.js` - Attempted to run migrations via RPC
- ❌ `MIGRATION_INSTRUCTIONS.md` - Migration instructions (moved to backend docs)
- ❌ `create-test-user.js` - Test user creation script
- ❌ `src/scripts/createStorageBucket.ts` - Storage bucket creation
- ❌ `src/scripts/` - Empty scripts directory
- ❌ `supabase/migrations/` - All SQL migration files (10 files removed)
- ❌ `supabase/config.toml` - Supabase CLI configuration
- ❌ `supabase/` - Entire folder removed from frontend
- ❌ `add-item.html` - Obsolete standalone admin form
- ❌ `package.json` script: `create-bucket`

**Total Cleanup**: 15+ files and folders removed to ensure clean separation between frontend and backend.

## Checking Before Development

Before adding new features:

1. **Check if tables exist** in Supabase Dashboard
2. **Verify RLS policies** are configured correctly
3. **Test queries** in SQL Editor first
4. **Only write frontend code** that reads/writes to existing schema

## Component Graceful Degradation

Components should handle missing backend features gracefully:

```typescript
// ✅ GOOD: Graceful error handling
const { data, error } = await supabase.from('table').select();
if (error) {
  // Return silently or show friendly message
  return;
}

// ❌ BAD: Attempting to create table
await supabase.rpc('exec_sql', { 
  sql: 'CREATE TABLE...' // NEVER DO THIS IN FRONTEND
});
```

## Need Help?

If you need to:
- Add a new table → Create migration file in `supabase/migrations/`
- Modify schema → Update existing migration or create new one
- Add indexes → Write SQL migration, don't run from frontend
- Create storage bucket → Use Supabase Dashboard

**Remember**: Frontend = Data Access, Backend = Schema Management

---

*Last updated: December 1, 2025*
*All migration logic removed to prevent conflicts and errors*
