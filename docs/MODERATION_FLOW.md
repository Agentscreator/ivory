# Content Moderation Flow Diagram

## User Reporting Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER SEES INAPPROPRIATE CONTENT           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Taps Three-Dot Menu (⋮) on Content             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Selects "Report Content"                  │
│                                                              │
│  Component: flag-content-dialog.tsx                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Chooses Report Reason:                    │
│                                                              │
│  • Inappropriate content                                     │
│  • Spam                                                      │
│  • Harassment or bullying                                    │
│  • Copyright violation                                       │
│  • Other                                                     │
│                                                              │
│  + Optional: Add detailed description                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Submits Report                          │
│                                                              │
│  API: POST /api/moderation/flag-content                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
┌──────────────────────────┐  ┌──────────────────────────┐
│   Save to Database       │  │  Notify Developer        │
│                          │  │                          │
│  Table: content_flags    │  │  Table: notifications    │
│  Status: pending         │  │  Type: content_flagged   │
└──────────────────────────┘  └──────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│              User Sees Confirmation Message                  │
│         "Thank you for your report"                          │
└─────────────────────────────────────────────────────────────┘
```

---

## User Blocking Flow

```
┌─────────────────────────────────────────────────────────────┐
│                USER ENCOUNTERS ABUSIVE USER                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         Taps Three-Dot Menu (⋮) on User's Content           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Selects "Block User"                      │
│                                                              │
│  Component: block-user-dialog.tsx                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Reviews Blocking Information:               │
│                                                              │
│  • Content removed from feed instantly                       │
│  • User cannot send design requests                          │
│  • Won't see their comments/reviews                          │
│  • Developer will be notified                                │
│                                                              │
│  Optional: Select reason for blocking                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Confirms Block                          │
│                                                              │
│  API: POST /api/moderation/block-user                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
┌──────────────────────────┐  ┌──────────────────────────┐
│   Save to Database       │  │  Auto-Flag User Content  │
│                          │  │                          │
│  Table: blocked_users    │  │  Table: content_flags    │
│  Unique constraint       │  │  Reason: blocked_user    │
└──────────────────────────┘  └──────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│                    Notify Developer                          │
│                                                              │
│  Table: notifications                                        │
│  Type: user_blocked                                          │
│  Includes: blocker_id, blocked_id, reason                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         ⚡ INSTANT EFFECT - Content Disappears ⚡            │
│                                                              │
│  • Page refreshes automatically                              │
│  • All blocked user's content removed from feed              │
│  • Filter applied: WHERE userId NOT IN (blocked_ids)         │
└─────────────────────────────────────────────────────────────┘
```

---

## Feed Filtering Flow

```
┌─────────────────────────────────────────────────────────────┐
│              USER OPENS FEED / BROWSE PAGE                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│           API Request: GET /api/looks?currentUserId=X        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Query Blocked Users for Current User            │
│                                                              │
│  SELECT blocked_id FROM blocked_users                        │
│  WHERE blocker_id = currentUserId                            │
│                                                              │
│  Result: [blocked_user_1, blocked_user_2, ...]              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Query Looks with Filter                     │
│                                                              │
│  SELECT * FROM looks                                         │
│  WHERE userId NOT IN (blocked_user_ids)                      │
│  ORDER BY created_at DESC                                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Return Filtered Content to User                 │
│                                                              │
│  ✅ Only shows content from non-blocked users                │
│  ✅ Real-time filtering                                      │
│  ✅ No cached blocked content                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Managing Blocked Users Flow

```
┌─────────────────────────────────────────────────────────────┐
│              USER GOES TO SETTINGS                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         Taps "Privacy & Security" → "Blocked Users"          │
│                                                              │
│  Page: app/settings/blocked-users/page.tsx                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Load Blocked Users List                         │
│                                                              │
│  API: GET /api/moderation/block-user?userId=X               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Display Blocked Users                           │
│                                                              │
│  For each blocked user:                                      │
│  • User ID                                                   │
│  • Reason for blocking                                       │
│  • Date blocked                                              │
│  • [Unblock] button                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    (User taps Unblock)
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Unblock User                            │
│                                                              │
│  API: DELETE /api/moderation/block-user                     │
│       ?blockerId=X&blockedId=Y                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Remove from Database                            │
│                                                              │
│  DELETE FROM blocked_users                                   │
│  WHERE blocker_id = X AND blocked_id = Y                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         User's Content Appears in Feed Again                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Admin Review Flow

```
┌─────────────────────────────────────────────────────────────┐
│         ADMIN RECEIVES NOTIFICATION                          │
│                                                              │
│  Type: content_flagged OR user_blocked                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Admin Reviews Notification                      │
│                                                              │
│  Contains:                                                   │
│  • Reporter/Blocker ID                                       │
│  • Content/User ID                                           │
│  • Reason                                                    │
│  • Timestamp                                                 │
│  • Description (if provided)                                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Admin Investigates                              │
│                                                              │
│  Query: GET /api/moderation/flag-content?status=pending     │
│                                                              │
│  Reviews:                                                    │
│  • Content details                                           │
│  • User history                                              │
│  • Previous reports                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
┌──────────────────────────┐  ┌──────────────────────────┐
│   Take Action            │  │  Dismiss Report          │
│                          │  │                          │
│  • Remove content        │  │  • Update status         │
│  • Warn user             │  │  • Add notes             │
│  • Suspend account       │  │                          │
│  • Update flag status    │  │                          │
└──────────────────────────┘  └──────────────────────────┘
```

---

## Database Relationships

```
┌──────────────┐
│    users     │
│              │
│  id (PK)     │◄─────────┐
│  username    │           │
│  email       │           │
└──────────────┘           │
       ▲                   │
       │                   │
       │                   │
┌──────┴───────────────────┴────────┐
│                                   │
│                                   │
┌──────────────┐          ┌──────────────┐
│content_flags │          │blocked_users │
│              │          │              │
│  id (PK)     │          │  id (PK)     │
│  reporter_id │──────┐   │  blocker_id  │──────┐
│  content_id  │      │   │  blocked_id  │      │
│  owner_id    │──────┤   │  reason      │      │
│  reason      │      │   │  created_at  │      │
│  status      │      │   │              │      │
│  created_at  │      │   │  UNIQUE(     │      │
└──────────────┘      │   │   blocker,   │      │
                      │   │   blocked)   │      │
                      │   └──────────────┘      │
                      │                         │
                      └─────────────────────────┘
                              References
                              users.id
```

---

## Key Features Summary

### ✅ Content Flagging
- **Entry Point:** Three-dot menu (⋮) on content
- **Action:** Report with reason + optional details
- **Result:** Saved to database + admin notified
- **Privacy:** Anonymous reporting

### ✅ User Blocking
- **Entry Point:** Three-dot menu (⋮) on content
- **Action:** Block user with optional reason
- **Result:** Instant content removal + admin notified
- **Management:** Settings > Blocked Users

### ✅ Feed Filtering
- **Trigger:** Any feed/browse request
- **Process:** Query blocked users → filter content
- **Result:** Only non-blocked users' content shown
- **Performance:** Indexed queries for speed

### ✅ Admin Notifications
- **Trigger:** Any flag or block action
- **Content:** User IDs, reasons, timestamps
- **Storage:** notifications table
- **Access:** Admin dashboard / API

---

## Performance Considerations

### Database Indexes
```sql
-- Fast lookups for blocked users
CREATE INDEX idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked ON blocked_users(blocked_id);

-- Fast lookups for content flags
CREATE INDEX idx_content_flags_reporter ON content_flags(reporter_id);
CREATE INDEX idx_content_flags_content ON content_flags(content_type, content_id);
CREATE INDEX idx_content_flags_status ON content_flags(status);
```

### Query Optimization
- Blocked users list cached per request
- Single query to get all blocked IDs
- Efficient NOT IN clause with indexes
- No N+1 query problems

---

## Security Features

### Validation
- ✅ Cannot block yourself
- ✅ Cannot block same user twice (DB constraint)
- ✅ User authentication required
- ✅ Foreign key constraints

### Privacy
- ✅ Anonymous reporting
- ✅ No notification to blocked users
- ✅ Private block lists
- ✅ Secure API endpoints

---

This flow ensures complete compliance with Apple's Guideline 1.2 requirements!
