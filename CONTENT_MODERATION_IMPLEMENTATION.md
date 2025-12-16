# Content Moderation Implementation

## Overview
This document outlines the content moderation features implemented to comply with Apple App Store Review Guideline 1.2 - User-Generated Content.

## Features Implemented

### 1. Content Flagging System
Users can report objectionable content through a comprehensive flagging mechanism.

**Implementation:**
- **Component:** `components/flag-content-dialog.tsx`
- **API Endpoint:** `app/api/moderation/flag-content/route.ts`
- **Database Table:** `content_flags`

**Features:**
- Report different content types: looks (designs), reviews, and profiles
- Multiple report reasons: inappropriate content, spam, harassment, copyright violation, other
- Optional detailed description for context
- Instant notification to administrators/moderators
- Status tracking: pending, reviewed, action_taken, dismissed

**User Flow:**
1. User clicks "More options" (⋮) on any content
2. Selects "Report Content"
3. Chooses a reason and optionally adds details
4. Submits report
5. Admin is notified immediately via the notifications system

### 2. User Blocking System
Users can block abusive users with instant content removal from their feed.

**Implementation:**
- **Component:** `components/block-user-dialog.tsx`
- **API Endpoint:** `app/api/moderation/block-user/route.ts`
- **Database Table:** `blocked_users`
- **Settings Page:** `app/settings/blocked-users/page.tsx`

**Features:**
- Block users with optional reason selection
- Instant removal of blocked user's content from feed
- Automatic notification to developers/moderators
- Auto-flag all content from blocked user for review
- Manage blocked users list in settings
- Unblock functionality

**User Flow:**
1. User clicks "More options" (⋮) on content or profile
2. Selects "Block User"
3. Confirms blocking with optional reason
4. Blocked user's content is immediately removed from feed
5. Developer is notified for review
6. User can manage blocked users in Settings > Blocked Users

### 3. Content Filtering
Automatic filtering of blocked users' content across the app.

**Implementation:**
- **Updated API:** `app/api/looks/route.ts`
- Filters out content from blocked users in all feed queries
- Real-time filtering based on user's block list

### 4. Moderation Menu Component
Unified moderation interface for all user-generated content.

**Implementation:**
- **Component:** `components/content-moderation-menu.tsx`
- Provides consistent moderation options across the app
- Context-aware (doesn't show on user's own content)
- Includes both flag and block options

## Database Schema

### content_flags Table
```sql
- id: Primary key
- reporter_id: User who reported the content
- content_type: Type of content (look, review, profile)
- content_id: ID of the flagged content
- content_owner_id: Owner of the flagged content
- reason: Reason for flagging
- description: Additional details
- status: Review status (pending, reviewed, action_taken, dismissed)
- reviewed_by: Admin who reviewed
- reviewed_at: Review timestamp
- action_taken: Action description
- created_at: Flag creation timestamp
```

### blocked_users Table
```sql
- id: Primary key
- blocker_id: User who blocked
- blocked_id: User who is blocked
- reason: Reason for blocking
- created_at: Block timestamp
- UNIQUE constraint on (blocker_id, blocked_id)
```

## Integration Points

### Where Moderation Features Appear:

1. **Look/Design Cards** - Flag content, block user
2. **User Profiles** - Block user
3. **Reviews** - Flag content, block user
4. **Settings** - Manage blocked users list

### API Endpoints:

1. **POST /api/moderation/flag-content**
   - Flag objectionable content
   - Notifies administrators

2. **POST /api/moderation/block-user**
   - Block a user
   - Auto-flags user's content
   - Notifies administrators

3. **DELETE /api/moderation/block-user**
   - Unblock a user

4. **GET /api/moderation/block-user**
   - Get list of blocked users

5. **GET /api/moderation/flag-content**
   - Get content flags (admin view)

## Developer Notifications

When users flag content or block users, the system:
1. Creates a notification record for administrators
2. Includes relevant context (user IDs, content IDs, reasons)
3. Allows for quick review and action

## Privacy & User Experience

- Users cannot see who reported their content
- Blocking is instant and removes content from feed immediately
- Users can manage their blocked list at any time
- Clear communication about what blocking does
- No notification sent to blocked users

## Testing the Features

### To Test Content Flagging:
1. Navigate to any user-generated content (design, review)
2. Click the "⋮" (more options) button
3. Select "Report Content"
4. Choose a reason and submit
5. Verify admin receives notification

### To Test User Blocking:
1. Navigate to another user's content or profile
2. Click the "⋮" (more options) button
3. Select "Block User"
4. Confirm blocking
5. Verify content is immediately removed from feed
6. Check Settings > Blocked Users to manage blocks

## Migration

Run the migration script to add the new tables:
```bash
psql -d your_database < db/migrations/add_content_moderation.sql
```

Or use your ORM migration tool:
```bash
npm run db:push
# or
yarn db:push
```

## Compliance with Apple Guidelines

This implementation satisfies Apple App Store Review Guideline 1.2 requirements:

✅ **Mechanism for users to flag objectionable content**
- Comprehensive flagging system with multiple report reasons
- Available on all user-generated content
- Instant notification to developers

✅ **Mechanism for users to block abusive users**
- Full blocking functionality with instant effect
- Removes blocked user's content from feed immediately
- Notifies developers of the block
- Users can manage blocked list in settings

✅ **Developer notification of inappropriate content**
- All flags and blocks create admin notifications
- Includes context for review and action
- Trackable status system

## Next Steps

1. Run database migration to add new tables
2. Test all moderation features thoroughly
3. Set up admin dashboard for reviewing flags (optional)
4. Configure admin user ID in notification system
5. Submit updated app to Apple for review

## Support

For questions or issues with the moderation system, refer to:
- Database schema: `db/schema.ts`
- API documentation: Individual route files
- Component documentation: Component files with inline comments
