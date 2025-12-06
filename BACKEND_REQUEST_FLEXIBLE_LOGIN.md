# 📧 Backend Request: Flexible Login (Email OR Username)

## 🎯 Feature Request

User wants to be able to login using **EITHER email OR username** (not just email).

---

## 📋 Current Implementation (Frontend)

**Login Form sends:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Endpoint:** `POST /api/auth/login`

---

## ✅ Requested Implementation

### Option 1: Backend accepts flexible field
```json
{
  "identifier": "user@example.com OR username123",
  "password": "password123"
}
```

Backend logic:
```
if identifier contains '@' → treat as email
else → treat as username
```

### Option 2: Backend accepts both fields
```json
{
  "email": "user@example.com",
  "username": "username123", 
  "password": "password123"
}
```

Backend logic:
```
if email provided → use email
else if username provided → use username
```

### Option 3: Keep current endpoint, add new one
```
POST /api/auth/login/email  (existing)
POST /api/auth/login/username  (new)
```

---

## 🔧 What Backend Needs to Do

### 1. **Database Check**
Does `users` table have a `username` column?
- ✅ Yes → Continue
- ❌ No → Add `username` column (unique, indexed)

```sql
ALTER TABLE users 
ADD COLUMN username VARCHAR(50) UNIQUE;

CREATE INDEX idx_users_username ON users(username);
```

### 2. **Update Login Endpoint**

**Current (likely):**
```python
# Find user by email only
user = db.query(User).filter(User.email == email).first()
```

**Updated:**
```python
# Accept identifier field
identifier = request.json.get('identifier') or request.json.get('email')

# Check if it's email or username
if '@' in identifier:
    user = db.query(User).filter(User.email == identifier).first()
else:
    user = db.query(User).filter(User.username == identifier).first()
```

**OR (if using SQLAlchemy):**
```python
from sqlalchemy import or_

identifier = request.json.get('identifier')
user = db.query(User).filter(
    or_(User.email == identifier, User.username == identifier)
).first()
```

### 3. **Update Registration Endpoint**

Allow users to set username during registration:
```json
{
  "email": "user@example.com",
  "username": "cooluser123",  // NEW
  "password": "password123",
  "display_name": "Cool User"
}
```

Validation:
- Username should be unique
- Username 3-20 characters
- Username alphanumeric + underscore only
- Cannot start with number

---

## 📄 Response Format

### Success (200)
```json
{
  "success": true,
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "Bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "cooluser123",  // Include username in response
    "display_name": "Cool User",
    "role": "user"
  }
}
```

### Error (400/401)
```json
{
  "success": false,
  "error": "Invalid email or username"  // Updated error message
}
```

---

## 🎨 Frontend Changes (After Backend Update)

Once backend is ready, frontend will:

1. **Change label** from "Email" to "Email or Username"
2. **Update field name** from `email` to `identifier`
3. **Send flexible identifier** to backend
4. **Display username** in user profile

---

## ✅ Checklist for Backend Developer

- [ ] Add `username` column to `users` table (if not exists)
- [ ] Make `username` unique and indexed
- [ ] Update `POST /api/auth/login` to accept `identifier` field
- [ ] Add logic to detect email vs username (check for `@` character)
- [ ] Update `POST /api/auth/register` to accept optional `username`
- [ ] Add username validation (3-20 chars, alphanumeric + underscore)
- [ ] Include `username` in auth response
- [ ] Update API documentation

---

## 🧪 Testing

### Test Case 1: Login with Email
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "user@example.com",
    "password": "password123"
  }'
```

**Expected:** ✅ Success

### Test Case 2: Login with Username
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "cooluser123",
    "password": "password123"
  }'
```

**Expected:** ✅ Success

### Test Case 3: Register with Username
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "username": "newuser123",
    "password": "password123",
    "display_name": "New User"
  }'
```

**Expected:** ✅ User created with username

---

## 📊 Database Migration Example

```sql
-- Add username column
ALTER TABLE users 
ADD COLUMN username VARCHAR(50) UNIQUE;

-- Create index for fast lookups
CREATE INDEX idx_users_username ON users(username);

-- (Optional) Populate existing users with auto-generated usernames
UPDATE users 
SET username = LOWER(REPLACE(display_name, ' ', '_')) || '_' || LEFT(id::text, 8)
WHERE username IS NULL;
```

---

## 🚀 Priority

**User Impact:** Medium-High  
**Implementation Effort:** Low-Medium  
**Recommended Timeline:** 1-2 days

---

## 💬 Questions for Backend Team?

1. Does the `users` table already have a `username` column?
2. Should username be required or optional during registration?
3. Preferred implementation: Option 1 (identifier) or Option 2 (both fields)?
4. Any existing username format requirements?

---

Please confirm backend changes are complete, and I'll update the frontend immediately! 🎯

