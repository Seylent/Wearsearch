# Backend Requirements for Banner System

## Overview
The frontend banner system is complete but requires backend implementation of analytics tracking endpoints.

## Required Backend Endpoints

### 1. Track Banner Impression (PUBLIC - No Auth Required)
```
POST /api/v1/banners/:bannerId/impression
```

**Request Body:**
```json
{
  "page_url": "https://example.com/page",
  "user_agent": "Mozilla/5.0..."
}
```

**Response:**
```json
{
  "success": true
}
```

**Notes:**
- Should be a public endpoint (no authentication required)
- Records when a banner is displayed to a user
- Can be used for analytics and performance tracking

---

### 2. Track Banner Click (PUBLIC - No Auth Required)
```
POST /api/v1/banners/:bannerId/click
```

**Request Body:**
```json
{
  "page_url": "https://example.com/page",
  "user_agent": "Mozilla/5.0..."
}
```

**Response:**
```json
{
  "success": true
}
```

**Notes:**
- Should be a public endpoint (no authentication required)
- Records when a user clicks on a banner
- Can be used to track banner effectiveness and CTR (Click-Through Rate)

---

## Database Schema Suggestion

### Banner Impressions Table
```sql
CREATE TABLE banner_impressions (
  id UUID PRIMARY KEY,
  banner_id UUID REFERENCES banners(id),
  page_url VARCHAR(500),
  user_agent TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_banner_impressions_banner_id ON banner_impressions(banner_id);
CREATE INDEX idx_banner_impressions_created_at ON banner_impressions(created_at);
```

### Banner Clicks Table
```sql
CREATE TABLE banner_clicks (
  id UUID PRIMARY KEY,
  banner_id UUID REFERENCES banners(id),
  page_url VARCHAR(500),
  user_agent TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_banner_clicks_banner_id ON banner_clicks(banner_id);
CREATE INDEX idx_banner_clicks_created_at ON banner_clicks(created_at);
```

---

## Analytics Queries

### Get Banner Performance
```sql
SELECT 
  b.id,
  b.title,
  COUNT(DISTINCT bi.id) as impressions,
  COUNT(DISTINCT bc.id) as clicks,
  CASE 
    WHEN COUNT(DISTINCT bi.id) > 0 
    THEN (COUNT(DISTINCT bc.id)::float / COUNT(DISTINCT bi.id)::float * 100)
    ELSE 0 
  END as ctr_percentage
FROM banners b
LEFT JOIN banner_impressions bi ON b.id = bi.banner_id
LEFT JOIN banner_clicks bc ON b.id = bc.banner_id
WHERE b.id = $1
GROUP BY b.id, b.title;
```

---

## Frontend Implementation Notes

The frontend already:
- ✅ Calls impression tracking when banner is displayed
- ✅ Calls click tracking when banner is clicked
- ✅ Handles 404 gracefully (won't spam errors if endpoints don't exist yet)
- ✅ Treats tracking endpoints as public (no auth token sent)
- ✅ Includes page_url and user_agent in tracking requests

**Current Behavior:**
- If backend endpoints return 404, the frontend silently continues (no user-facing errors)
- If backend endpoints return other errors, they're logged to console for debugging
- Tracking failures don't block the user experience

---

## Implementation Priority

**Priority: LOW**
- The banner display system works without these endpoints
- These are analytics/tracking endpoints only
- Can be implemented after banner CRUD endpoints are working
- Frontend handles missing endpoints gracefully

**Suggested Order:**
1. Implement banner CRUD endpoints first (GET, POST, PUT, DELETE for /banners)
2. Test banner display on frontend
3. Add impression/click tracking endpoints when analytics are needed
4. Build analytics dashboard in admin panel

---

## Testing

After implementing the endpoints, test with:

```bash
# Track impression
curl -X POST http://localhost:3000/api/v1/banners/YOUR_BANNER_ID/impression \
  -H "Content-Type: application/json" \
  -d '{"page_url":"http://localhost:5173","user_agent":"Mozilla/5.0"}'

# Track click
curl -X POST http://localhost:3000/api/v1/banners/YOUR_BANNER_ID/click \
  -H "Content-Type: application/json" \
  -d '{"page_url":"http://localhost:5173","user_agent":"Mozilla/5.0"}'
```

Expected response: `{"success": true}` with 200 status code
