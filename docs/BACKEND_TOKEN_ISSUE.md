# Backend Token Issue - /me Requests Diagnosis

## 🔍 Problem Analysis

User reports: **Constant /me requests appearing**

This can be caused by backend issues, specifically:

---

## 🚨 Possible Backend Issues

### Issue 1: Short Token Expiration

**Symptom:** /me request every few minutes

**Cause:** 
```javascript
// Backend JWT config
const token = jwt.sign(payload, secret, { 
  expiresIn: '5m'  // ← TOO SHORT!
});
```

**Solution:**
```javascript
const token = jwt.sign(payload, secret, { 
  expiresIn: '7d'  // 7 days - reasonable for web app
});
```

---

### Issue 2: 401 Responses Clearing Cache

**Symptom:** /me request after certain operations

**Cause:**
When any backend endpoint returns `401 Unauthorized`:
1. Frontend receives 401
2. Thinks token is invalid
3. Clears cache
4. Next request → no cache → calls /me again

**Common 401 Triggers:**
```javascript
// Backend might be returning 401 for:
GET /api/admin/products  → 401
GET /api/admin/stores    → 401
POST /api/admin/products → 401
```

**Check Backend:**
```javascript
// Are these protected routes working correctly?
// Do they accept Bearer token?
// Is token validation consistent?

app.get('/api/admin/products', authenticateToken, async (req, res) => {
  // Does authenticateToken middleware work correctly?
  // Does it parse Bearer token properly?
});
```

---

### Issue 3: Inconsistent Token Validation

**Symptom:** Random /me requests

**Cause:**
```javascript
// Some endpoints check token differently:

// Endpoint A:
const token = req.headers.authorization?.split(' ')[1];  // Works

// Endpoint B:
const token = req.headers['authorization'];  // Missing .split(' ')[1] - BROKEN!

// Frontend sends: "Bearer eyJhbGc..."
// Endpoint B receives: "Bearer eyJhbGc..." (with "Bearer " prefix) - INVALID!
```

**Solution:** Consistent token parsing across all endpoints
```javascript
// Middleware for token extraction:
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token after "Bearer "
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};
```

---

### Issue 4: CORS Preflight Issues

**Symptom:** /me request before each API call

**Cause:**
Browser sends OPTIONS preflight request before each POST/PUT, backend might be rejecting them.

**Check:**
```javascript
// Backend CORS config:
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

### Issue 5: Session/Token Not Persisting

**Symptom:** Logout after page refresh

**Cause:**
Backend might be setting token in wrong place or with wrong settings.

**Check:**
```javascript
// On login, backend should return:
{
  "success": true,
  "token": "eyJhbGc...",  // Long-lived token
  "user": {
    "id": "...",
    "email": "...",
    "role": "admin"
  }
}

// NOT short-lived tokens that expire in minutes
```

---

## 🧪 How to Diagnose Backend Issue

### Test 1: Check Token Expiration

```bash
# In browser console:
const token = localStorage.getItem('access_token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token expires:', new Date(payload.exp * 1000));
console.log('Current time:', new Date());
console.log('Time left:', (payload.exp * 1000 - Date.now()) / 1000 / 60, 'minutes');
```

**If expires in < 1 hour:** Token too short-lived!

---

### Test 2: Check for 401 Responses

```
Open DevTools → Network tab
Filter by: "api"

Look for RED requests (401 status)
```

**If you see 401s:**
- Check which endpoints return 401
- Report to backend: "Endpoint X returns 401 even with valid token"

---

### Test 3: Check Token Format

```bash
# Backend log should show:
"Received token: eyJhbGc..."  # WITHOUT "Bearer " prefix

# If shows:
"Received token: Bearer eyJhbGc..."  # WITH "Bearer " - WRONG!
```

---

## 🔧 Frontend Protection (Already Added)

I've added extra protection in frontend:

### 1. Cache First Strategy
```javascript
// Check cache BEFORE calling /me
const cachedUser = localStorage.getItem('user');
if (cachedUser) {
  console.log('✅ Using cached user - NO /me REQUEST');
  return; // Don't call /me!
}
```

### 2. Only Call /me Once Per Component
```javascript
useEffect(() => {
  checkAuthOnce();
}, []); // Empty deps = once on mount
```

### 3. Handle 401 Properly
```javascript
if (response.status === 401) {
  console.error('🚨 Token invalid! Clearing cache...');
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  navigate('/auth');
}
```

---

## 📊 Expected vs Actual Behavior

### Expected (Correct):
```
Page load:
  → Check cache
  → Cache found: Use it (no /me call)
  → Total /me calls: 0

First load (no cache):
  → No cache
  → Call /me once
  → Cache result
  → Total /me calls: 1
```

### Actual (If Backend Problem):
```
Page load:
  → Check cache, found
  → Make API request (e.g. GET /api/admin/products)
  → Backend returns 401 "Invalid token"
  → Frontend clears cache
  → Calls /me again
  → Total /me calls: 2+ (repeats)
```

---

## 🎯 What to Check Now

### For User (You):

1. **Open Console and look for:**
```
✅ [checkAdmin] Using cached user data - NO /me REQUEST
```
**If you see this:** Cache is working!

```
🔍 [checkAdmin] No cache, fetching /me from API
```
**If you see this multiple times:** Something is clearing cache!

```
❌ /me request failed with status: 401
🚨 Token is invalid! Clearing cache...
```
**If you see this:** Token is invalid or backend rejecting it!

2. **Check Network tab:**
- Filter by "api"
- Look for RED requests (401 errors)
- Screenshot and show me

---

### For Backend Developer:

**Questions to answer:**

1. **Token expiration time?**
```javascript
expiresIn: '???' // Should be '7d' or '24h', NOT '5m'
```

2. **All admin endpoints accept Bearer token?**
```bash
# Test each endpoint:
curl http://localhost:3000/api/admin/products \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return 200, not 401
```

3. **Token parsing consistent?**
```javascript
// All endpoints should use same middleware
const token = authHeader?.split(' ')[1]; // Extract after "Bearer "
```

4. **CORS configured?**
```javascript
credentials: true
allowedHeaders: ['Authorization', 'Content-Type']
```

---

## 🔍 Debugging Commands

### Check if backend is the problem:

```bash
# 1. Get your token
TOKEN=$(your_token_here)

# 2. Test /me endpoint
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Should return: 200 OK with user data

# 3. Test admin endpoints
curl http://localhost:3000/api/admin/products \
  -H "Authorization: Bearer $TOKEN"

# Should return: 200 OK with products

# If any return 401 → backend token validation issue!
```

---

## 💡 Quick Fix for Backend

If backend is rejecting valid tokens:

```javascript
// Check your auth middleware:

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log('Auth header:', authHeader);  // Debug
  console.log('Extracted token:', token);    // Debug
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('JWT verify error:', err.message);  // Debug
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Apply to ALL protected routes:
app.use('/api/admin/*', authenticateToken);
```

---

## 📝 Summary

**If /me appears constantly:**
- ✅ Frontend is optimized (cache working)
- ❌ Backend might be returning 401 on some requests
- ❌ Token might expire too quickly
- ❌ Token validation might be inconsistent

**Next steps:**
1. User: Check console for [checkAdmin] and [StoreRating] messages
2. User: Screenshot Network tab showing 401s (if any)
3. Backend: Check token expiration and validation middleware
4. Backend: Test all admin endpoints with same token

**This is likely a backend configuration issue!** 🔍

