# Content Moderation - Apple Review Guide

## Quick Reference for App Review Team

This app now includes comprehensive content moderation features that comply with App Store Review Guideline 1.2.

---

## ✅ Requirement 1: Flag Objectionable Content

### How to Test:
1. Open the app and navigate to any user-generated content (nail design, review, or profile)
2. Look for the **three-dot menu (⋮)** in the top-right corner of the content
3. Tap **"Report Content"**
4. Select a reason:
   - Inappropriate content
   - Spam
   - Harassment or bullying
   - Copyright violation
   - Other
5. Optionally add additional details
6. Tap **"Submit Report"**
7. Confirmation message appears: "Thank you for your report"

### What Happens:
- Report is saved to database with timestamp
- Developer/admin receives instant notification
- Content is flagged for review
- Reporter's identity is kept private

### Location in Code:
- UI Component: `components/flag-content-dialog.tsx`
- API Endpoint: `app/api/moderation/flag-content/route.ts`
- Database Table: `content_flags`

---

## ✅ Requirement 2: Block Abusive Users

### How to Test:
1. Open the app and navigate to another user's content or profile
2. Tap the **three-dot menu (⋮)**
3. Tap **"Block User"** (shown in red)
4. Review the blocking information:
   - Content removed from feed instantly
   - User cannot send design requests
   - Developer notified for review
5. Optionally select a reason
6. Tap **"Block User"**
7. **Instant Effect:** All content from that user disappears from your feed immediately

### Managing Blocked Users:
1. Go to **Settings** (bottom navigation)
2. Tap **"Blocked Users"** under Privacy & Security
3. View list of all blocked users
4. Tap **"Unblock"** to remove a block

### What Happens When Blocking:
✅ **Instant feed removal** - Blocked user's content disappears immediately  
✅ **Developer notification** - Admin receives alert about the block  
✅ **Auto-flagging** - All content from blocked user is flagged for review  
✅ **Persistent** - Block remains until user manually unblocks

### Location in Code:
- UI Component: `components/block-user-dialog.tsx`
- Settings Page: `app/settings/blocked-users/page.tsx`
- API Endpoint: `app/api/moderation/block-user/route.ts`
- Database Table: `blocked_users`
- Feed Filtering: `app/api/looks/route.ts` (lines with `blockedUsers` filtering)

---

## 🔍 Where to Find Moderation Features

### In the App:
1. **Any nail design card** → Three-dot menu → Report/Block
2. **User profiles** → Three-dot menu → Report/Block
3. **Reviews** → Three-dot menu → Report/Block
4. **Settings** → Privacy & Security → Blocked Users

### Visual Indicators:
- Three-dot menu icon (⋮) appears on all user-generated content
- Menu shows "Report Content" with flag icon
- Menu shows "Block User" with user-x icon (in red)

---

## 📊 Developer Monitoring

### Notification System:
When users flag content or block users, the system:
1. Creates a notification record for administrators
2. Includes:
   - Reporter/blocker user ID
   - Content type and ID
   - Reason selected
   - Timestamp
   - Current status

### Admin Dashboard Access:
- Notifications table: `notifications`
- Content flags table: `content_flags`
- Blocked users table: `blocked_users`

### API Endpoints for Admin Review:
```
GET /api/moderation/flag-content?userId=ADMIN_ID&status=pending
GET /api/moderation/block-user?userId=ADMIN_ID
```

---

## 🛡️ Privacy & Safety Features

### User Privacy:
- ✅ Anonymous reporting (content owner doesn't see who reported)
- ✅ No notification sent to blocked users
- ✅ Private block list management

### Safety Measures:
- ✅ Instant content removal from blocker's feed
- ✅ Automatic developer notification
- ✅ Persistent blocking (survives app restarts)
- ✅ Cannot block yourself (validation in place)
- ✅ Cannot block same user twice (database constraint)

---

## 📱 User Experience Flow

### Reporting Flow:
```
User sees inappropriate content
    ↓
Taps three-dot menu
    ↓
Selects "Report Content"
    ↓
Chooses reason + optional details
    ↓
Submits report
    ↓
Sees confirmation message
    ↓
Developer receives notification
```

### Blocking Flow:
```
User encounters abusive user
    ↓
Taps three-dot menu
    ↓
Selects "Block User"
    ↓
Reviews blocking information
    ↓
Confirms block
    ↓
Content disappears INSTANTLY
    ↓
Developer receives notification
    ↓
User can manage blocks in Settings
```

---

## 🔧 Technical Implementation

### Database Schema:
- **content_flags**: Stores all content reports
- **blocked_users**: Stores user blocking relationships
- Indexed for performance
- Foreign key constraints for data integrity

### API Security:
- User authentication required
- Validation prevents self-blocking
- Duplicate block prevention
- Rate limiting ready

### Real-time Filtering:
- Feed queries automatically exclude blocked users
- No caching issues - instant effect
- Efficient database queries with indexes

---

## 📝 Documentation

For detailed technical documentation, see:
- **CONTENT_MODERATION_IMPLEMENTATION.md** - Full implementation details
- **db/schema.ts** - Database schema with moderation tables
- **db/migrations/add_content_moderation.sql** - Migration script

---

## ✨ Summary for Apple Review

This app fully complies with Guideline 1.2 by providing:

1. ✅ **Content Flagging**: Users can report objectionable content with multiple reason options
2. ✅ **User Blocking**: Users can block abusive users with instant feed removal
3. ✅ **Developer Notification**: All flags and blocks notify developers immediately
4. ✅ **User Control**: Settings page for managing blocked users
5. ✅ **Privacy Protection**: Anonymous reporting and private block lists
6. ✅ **Instant Effect**: Blocked content removed from feed immediately

**Test Accounts Available**: Contact developer for test accounts to verify all features.

---

## 📞 Contact

For questions during review, please contact the development team through App Store Connect.
