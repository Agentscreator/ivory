# Content Moderation - Quick Start Guide

## Apple App Store Guideline 1.2 Compliance ✅

Your app now has all required content moderation features!

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Run Database Migration
```bash
npm run setup:moderation
```
Or:
```bash
npm run db:push
```

### Step 2: Test the Features

**Flag Content:**
1. Open any user-generated content
2. Click ⋮ menu → "Report Content"
3. Submit a report

**Block User:**
1. Open another user's content
2. Click ⋮ menu → "Block User"
3. Confirm → Content disappears instantly

### Step 3: Configure Admin ID

Edit these files and change `userId: 1` to your admin user ID:
- `app/api/moderation/flag-content/route.ts` (line 28)
- `app/api/moderation/block-user/route.ts` (line 48)

---

## 📱 What Users See

### Report Content
- Available on all user content via ⋮ menu
- Multiple report reasons
- Optional detailed description
- Instant confirmation

### Block Users
- Available via ⋮ menu
- Instant content removal from feed
- Manage in Settings > Blocked Users
- Can unblock anytime

---

## ✅ Apple Review Checklist

- ✅ Users can flag objectionable content
- ✅ Users can block abusive users
- ✅ Blocked content removed instantly
- ✅ Developers notified of all reports/blocks
- ✅ Users can manage blocked list

---

## 📄 Documentation

- **APPLE_REVIEW_MODERATION_GUIDE.md** - For Apple reviewers
- **CONTENT_MODERATION_IMPLEMENTATION.md** - Technical details
- **MODERATION_SETUP_COMPLETE.md** - Full setup guide

---

## 🎯 Integration Example

Add to any component showing user content:

```tsx
import ContentModerationMenu from '@/components/content-moderation-menu';

<ContentModerationMenu
  currentUserId={currentUserId}
  contentType="look"
  contentId={look.id}
  contentOwnerId={look.userId}
  contentOwnerUsername={look.username}
/>
```

---

## ✨ You're Done!

Run the migration, test the features, and resubmit to Apple!
