# Scoreboard Module 
## 1. Top 10 User Scoreboard

### Endpoint - GET /v1/leaderboard/top?limit=10 
This endpoint returns the current top 10 users ranked by score. 
- The leaderboard is ordered by score in descending order. -
-  The response is limited to the top 10 users and does not require pagination. 
  - Each leaderboard entry includes the user identifier, display name, score, and rank.
  
### Access Control 
- The leaderboard may be publicly accessible or restricted based on product requirements. 
- If restricted, the endpoint must require authentication but remains read-only. 
 
## 2. Live Update Scoreboard The scoreboard should update live for all clients viewing it without requiring refresh.

### Recommended Transport 
- Use **WebSocket** for bidirectional, low-latency updates. - (Alternative) SSE can be used if WebSocket is not available. 

### Flow 
1. Client loads the page and fetches the current Top 10 using GET /v1/leaderboard/top. 
2.  Client opens a WebSocket connection and subscribes to leaderboard_top10. 
3.  Whenever a score update affects the Top 10 ranking, the server pushes a leaderboard_update event to all subscribed clients. 

### WebSocket 
Endpoint - GET /v1/leaderboard/ws 

### Event Payload (example)

```json
{ 
  "type": "leaderboard_update", 
  "generated_at": "2026-02-08T12:00:01Z", 
  "items": [ 
    { 
      "user_id": "uuid", 
    "display_name": "Kian", 
    "score": 100, 
    "rank": 1 
    } 
        ]
}
```

## 3. Update User Score (Secure) 

Clients call this endpoint after a user completes an action that increases score. 

### Endpoint 
- POST /v1/scores/increment 

### Auth Guards / Middleware 
The API must prevent unauthorized score inflation. Apply at least two layers: 

1. **Authentication Guard** - Verify access token (JWT/session). - Extract user_id from token. 
2.  **Authorization / User Validation Guard** 
  - Confirm the user exists and is allowed to update score (e.g. active, not banned). 
  - Optionally validate client/app permissions.

### After successful update
- Update score atomically in DB. 
- If Top 10 is affected, publish an update to WebSocket subscribers. 

## 4. Top 10 Change Detection Strategy 

To avoid broadcasting on every score update, the service keeps a cached threshold: 
- The service keeps two Redis keys to efficiently detect whether the Top 10 leaderboard has changed and avoid broadcasting on every score update: 
- leaderboard:top10 Stores the latest Top 10 snapshot (ordered list of { user_id, display_name, score, rank }). 
- leaderboard:10th_score Stores the score of the current 10th place user (derived from leaderboard:top10). 

### How it works 
After a successful score increment (and after obtaining new_score from the database):


1. Read leaderboard:top10 and leaderboard:10th_score from Redis. 
2. Determine if the user was already in the cached Top 10 snapshot: 
   - user_was_in_top10 = top10.contains(user_id) 
3. Only recompute and broadcast the Top 10 if: 
   - user_was_in_top10 == true, OR 
   - new_score >= leaderboard:10th_score 
  
### Recompute + Broadcast Logic 
When the condition above is met: 

1. Fetch the authoritative Top 10 list from the database (source of truth). 
2. Compare the newly computed Top 10 against the cached leaderboard:top10. 
3. If the Top 10 differs (membership or ordering changed): 
   - Update leaderboard:top10 and set leaderboard:10th_score to the new 10th place value. 
   - Broadcast a leaderboard_update event to all WebSocket subscribers. 

### Cache Miss / Fallback 
If either Redis key is missing (e.g., cold start or eviction): 
- Compute Top 10 from the database, 
- Populate leaderboard:top10 and leaderboard:10th_score, 
- Continue using the same detection logic. 
 
### Notes 
- This strategy may recompute more than necessary under high concurrency, which is acceptable for correctness. 
- Database remains the source of truth; Redis is treated as an optimization layer. 
-  Optionally apply a short TTL to the keys, but ensure cache-miss fallback recomputes safely.