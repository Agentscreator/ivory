# OAuth Authentication Security Fix

## Issue Description
The application had a critical security vulnerability where Google and Apple OAuth login buttons were creating user accounts without any actual authentication.

### What Was Wrong
1. **No Real OAuth Flow**: Clicking "Sign in with Google/Apple" didn't actually authenticate with Google or Apple
2. **Empty Passwords**: Users were created with empty password fields
3. **Fake Accounts**: The system generated fake usernames like `google_1234567890` without verifying identity
4. **Immediate Login**: Users were logged in without any verification

## Changes Made

### 1. Frontend (`app/page.tsx`)
- **Disabled OAuth buttons**: They now show an alert explaining OAuth is not configured
- **Removed insecure signup flow**: Deleted code that created fake OAuth accounts
- **Added TODO**: Clear documentation that proper OAuth implementation is needed

### 2. Backend (`app/api/auth/signup/route.ts`)
- **Added password validation**: Email authentication now requires a password
- **Blocked OAuth signups**: The endpoint now rejects OAuth provider requests
- **Clear error messages**: Users get helpful feedback about what's wrong

## What Needs To Be Done

To properly implement OAuth authentication, you need to:

### 1. Set Up OAuth Providers

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs (e.g., `https://yourdomain.com/api/auth/callback/google`)
4. Get Client ID and Client Secret
5. Add to environment variables:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

#### Apple Sign In
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create a Sign in with Apple service
3. Configure your app's bundle ID and redirect URIs
4. Get Client ID and generate a Client Secret
5. Add to environment variables:
   ```
   APPLE_CLIENT_ID=your_client_id
   APPLE_CLIENT_SECRET=your_client_secret
   ```

### 2. Create OAuth Callback Endpoints

Create `app/api/auth/callback/google/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createSession } from '@/lib/auth';
import { env } from '@/lib/env';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect('/login?error=no_code');
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const googleUser = await userInfoResponse.json();

    // Find or create user
    let user = await db
      .select()
      .from(users)
      .where(eq(users.email, googleUser.email))
      .limit(1);

    if (user.length === 0) {
      // Create new user
      const newUser = await db
        .insert(users)
        .values({
          username: googleUser.email.split('@')[0],
          email: googleUser.email,
          authProvider: 'google',
          userType: 'client',
          credits: 5,
          avatar: googleUser.picture,
        })
        .returning();
      
      user = newUser;
    }

    // Create session
    await createSession(user[0].id);

    return NextResponse.redirect('/user-type');
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect('/login?error=oauth_failed');
  }
}
```

Create similar endpoint for Apple at `app/api/auth/callback/apple/route.ts`.

### 3. Update Frontend OAuth Handlers

In `app/page.tsx`, replace the `handleSocialAuth` function:
```typescript
const handleSocialAuth = async (provider: string) => {
  const redirectUri = `${window.location.origin}/api/auth/callback/${provider}`;
  
  if (provider === 'google') {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${redirectUri}&` +
      `response_type=code&` +
      `scope=profile email`;
    
    window.location.href = authUrl;
  } else if (provider === 'apple') {
    // Similar for Apple
  }
};
```

### 4. Security Considerations

- **Never store OAuth tokens in localStorage**: Use HTTP-only cookies
- **Validate state parameter**: Prevent CSRF attacks
- **Verify token signatures**: Don't trust tokens without verification
- **Handle token refresh**: Implement proper token lifecycle management
- **Rate limit OAuth endpoints**: Prevent abuse

## Database Cleanup

If any fake OAuth accounts were created, you may want to clean them up:

```sql
-- Find users with empty passwords and OAuth providers
SELECT id, username, email, auth_provider 
FROM users 
WHERE auth_provider IN ('google', 'apple') 
AND (password_hash = '' OR password_hash IS NULL);

-- Delete them if needed (be careful!)
-- DELETE FROM users WHERE auth_provider IN ('google', 'apple') AND password_hash = '';
```

## Testing

After implementing proper OAuth:

1. Test Google login flow end-to-end
2. Test Apple login flow end-to-end
3. Verify users can't bypass authentication
4. Test error handling (denied permissions, network errors)
5. Verify session management works correctly

## References

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
