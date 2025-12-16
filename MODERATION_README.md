# Content Moderation System

## Apple App Store Guideline 1.2 Compliance ✅

Complete content moderation implementation for user-generated content.

---

## 🚀 Quick Start

### 1. Setup Database
```bash
npm run setup:moderation
```

### 2. Configure Admin ID
Edit these files and change `userId: 1` to your admin user ID:
- `app/api/moderation/flag-content/route.ts` (line 28)
- `app/api/moderation/block-user/route.ts` (line 48)

### 3. Test Features
- Flag content: Click ⋮ menu → "Report Content"
- Block user: Click ⋮ menu → "Block User"
- Manage blocks: Settings → Blocked Users

---

## 📁 File Structure

```
Content Moderation System
│
├── Database
│   ├── db/schema.ts (contentFlags, blockedUsers tables)
│   └── db/migrations/add_content_moderation.sql
│
├── API Endpoints
│   ├── app/api/moderation/flag-content/route.ts
│   └── app/api/moderation/block-user/route.ts
│
├── UI Components
│   ├── components/flag-content-dialog.tsx
│   ├── components/block-user-dialog.tsx
│   ├── components/content-moderation-menu.tsx
│   └── components/look-card.tsx (example)
│
├── Pages
│   ├── app/settings/blocked-users/page.tsx
│   └── app/settings/page.tsx (updated)
│
├── Documentation
│   ├── APPLE_REVIEW_MODERATION_GUIDE.md ⭐ For Apple
│   ├── CONTENT_MODERATION_IMPLEMENTATION.md (Technical)
│   ├── APPLE_SUBMISSION_READY.md (Submission guide)
│   ├── MODERATION_QUICK_START.md (Quick reference)
│   ├── FINAL_CHECKLIST.md (Pre-submission)
│   ├── docs/MODERATION_FLOW.md (Flow diagrams)
│   └── MODERATION_README.md (This file)
│
└── Scripts
    └── scripts/setup-moderation.ts
```

---

## 🎯 Features

### 1. Content Flagging
Users can report inappropriate content with:
- Multiple report reasons
- Optional detailed description
- Anonymous reporting
- Instant developer notification

**Usage:**
```tsx
import ContentModerationMenu from '@/components/content-moderation-menu';

<ContentModerationMenu
  currentUserId={userId}
  contentType="look"
  contentId={lookId}
  contentOwnerId={ownerId}
  contentOwnerUsername={username}
/>
```

### 2. User Blocking
Users can block abusive users with:
- Instant content removal from feed
- Developer notification
- Block management in settings
- Unblock functionality

**API:**
```typescript
// Block user
POST /api/moderation/block-user
{
  blockerId: number,
  blockedId: number,
  reason?: string
}

// Unblock user
DELETE /api/moderation/block-user?blockerId=X&blockedId=Y

// Get blocked users
GET /api/moderation/block-user?userId=X
```

### 3. Feed Filtering
Automatic filtering of blocked users' content:
```typescript
// Pass currentUserId to filter blocked content
const response = await fetch(`/api/looks?currentUserId=${userId}`);
```

---

## 🗄️ Database Schema

### content_flags
```sql
CREATE TABLE content_flags (
  id SERIAL PRIMARY KEY,
  reporter_id INTEGER NOT NULL REFERENCES users(id),
  content_type VARCHAR(50) NOT NULL,
  content_id INTEGER NOT NULL,
  content_owner_id INTEGER NOT NULL REFERENCES users(id),
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP,
  action_taken TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### blocked_users
```sql
CREATE TABLE blocked_users (
  id SERIAL PRIMARY KEY,
  blocker_id INTEGER NOT NULL REFERENCES users(id),
  blocked_id INTEGER NOT NULL REFERENCES users(id),
  reason VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(blocker_id, blocked_id)
);
```

---

## 🔌 API Reference

### Flag Content
**Endpoint:** `POST /api/moderation/flag-content`

**Request:**
```json
{
  "reporterId": 123,
  "contentType": "look",
  "contentId": 456,
  "contentOwnerId": 789,
  "reason": "inappropriate",
  "description": "Optional details"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Content has been flagged for review",
  "flagId": 1
}
```

### Block User
**Endpoint:** `POST /api/moderation/block-user`

**Request:**
```json
{
  "blockerId": 123,
  "blockedId": 456,
  "reason": "harassment"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User has been blocked and content flagged for review"
}
```

### Unblock User
**Endpoint:** `DELETE /api/moderation/block-user`

**Query Params:** `?blockerId=123&blockedId=456`

**Response:**
```json
{
  "success": true,
  "message": "User has been unblocked"
}
```

### Get Blocked Users
**Endpoint:** `GET /api/moderation/block-user`

**Query Params:** `?userId=123`

**Response:**
```json
{
  "blockedUsers": [
    {
      "id": 1,
      "blockedId": 456,
      "reason": "harassment",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## 🎨 UI Components

### ContentModerationMenu
Main component for moderation actions.

**Props:**
```typescript
interface ContentModerationMenuProps {
  currentUserId: number;
  contentType: 'look' | 'review' | 'profile';
  contentId: number;
  contentOwnerId: number;
  contentOwnerUsername: string;
  showBlockOption?: boolean;
}
```

**Example:**
```tsx
<ContentModerationMenu
  currentUserId={1}
  contentType="look"
  contentId={123}
  contentOwnerId={456}
  contentOwnerUsername="JohnDoe"
  showBlockOption={true}
/>
```

### FlagContentDialog
Dialog for reporting content.

**Props:**
```typescript
interface FlagContentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'look' | 'review' | 'profile';
  contentId: number;
  contentOwnerId: number;
  reporterId: number;
}
```

### BlockUserDialog
Dialog for blocking users.

**Props:**
```typescript
interface BlockUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  blockerId: number;
  blockedId: number;
  blockedUsername: string;
  onBlockSuccess?: () => void;
}
```

---

## 🔒 Security Features

### Validation
- ✅ User authentication required
- ✅ Cannot block yourself
- ✅ Cannot block same user twice (DB constraint)
- ✅ Foreign key constraints

### Privacy
- ✅ Anonymous reporting
- ✅ No notification to blocked users
- ✅ Private block lists
- ✅ Secure API endpoints

---

## 📊 Performance

### Database Indexes
```sql
CREATE INDEX idx_content_flags_reporter ON content_flags(reporter_id);
CREATE INDEX idx_content_flags_content ON content_flags(content_type, content_id);
CREATE INDEX idx_content_flags_status ON content_flags(status);
CREATE INDEX idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked ON blocked_users(blocked_id);
```

### Query Optimization
- Blocked users list cached per request
- Single query to get all blocked IDs
- Efficient NOT IN clause with indexes
- No N+1 query problems

---

## 🧪 Testing

### Manual Testing
1. **Flag Content:**
   - Login with User A
   - View User B's content
   - Click ⋮ → "Report Content"
   - Submit report
   - Check notifications table

2. **Block User:**
   - Login with User A
   - View User B's content
   - Click ⋮ → "Block User"
   - Confirm block
   - Verify content disappears
   - Check Settings → Blocked Users

3. **Unblock User:**
   - Go to Settings → Blocked Users
   - Click "Unblock"
   - Verify content reappears

### Automated Testing
```typescript
// Example test
describe('Content Moderation', () => {
  it('should block user and remove content', async () => {
    // Block user
    await blockUser(userId1, userId2);
    
    // Fetch feed
    const feed = await fetchFeed(userId1);
    
    // Verify no content from blocked user
    expect(feed.every(item => item.userId !== userId2)).toBe(true);
  });
});
```

---

## 🐛 Troubleshooting

### Content not disappearing after block
- Check if `currentUserId` is passed to feed API
- Verify blocked_users table has the entry
- Clear any caching layers
- Check browser console for errors

### Admin not receiving notifications
- Verify admin user ID is correct in API routes
- Check notifications table for entries
- Verify database connection

### Cannot block user
- Check if user is trying to block themselves
- Verify user is authenticated
- Check for existing block (duplicate)
- Review API error messages

---

## 📚 Documentation

### For Apple Review
- **APPLE_REVIEW_MODERATION_GUIDE.md** - Step-by-step testing guide

### For Developers
- **CONTENT_MODERATION_IMPLEMENTATION.md** - Technical implementation
- **docs/MODERATION_FLOW.md** - Flow diagrams

### For Submission
- **APPLE_SUBMISSION_READY.md** - Submission checklist
- **FINAL_CHECKLIST.md** - Pre-submission verification

---

## 🔄 Updates and Maintenance

### Adding New Content Types
1. Update `contentType` enum in components
2. Add moderation menu to new content cards
3. Update feed filtering if needed

### Customizing Report Reasons
Edit `components/flag-content-dialog.tsx`:
```tsx
<option value="new_reason">New Reason</option>
```

### Customizing Block Reasons
Edit `components/block-user-dialog.tsx`:
```tsx
<option value="new_reason">New Reason</option>
```

---

## 📞 Support

### Issues
- Check documentation files
- Review API error messages
- Verify database schema
- Check browser console

### Questions
- See APPLE_REVIEW_MODERATION_GUIDE.md
- See CONTENT_MODERATION_IMPLEMENTATION.md
- See docs/MODERATION_FLOW.md

---

## ✅ Compliance

This implementation satisfies Apple App Store Review Guideline 1.2:

✅ Mechanism for users to flag objectionable content  
✅ Mechanism for users to block abusive users  
✅ Instant content removal from blocker's feed  
✅ Developer notification system  
✅ User management interface  

---

## 🎉 You're All Set!

Your app now has enterprise-grade content moderation that:
- Protects users from inappropriate content
- Gives users control over their experience
- Notifies you of potential issues
- Complies with Apple's guidelines

**Next Steps:**
1. Run `npm run setup:moderation`
2. Test all features
3. Submit to Apple with confidence!

---

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Status:** Production Ready ✅
