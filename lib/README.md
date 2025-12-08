# Library Utilities

Shared utilities and helpers for the Ivory application.

## Files

### `env.ts`
Environment variable management with type safety and validation.

```typescript
import { env, validateEnv, isProduction } from '@/lib/env';

// Access environment variables
const dbUrl = env.DATABASE_URL;
const appUrl = env.APP_URL;

// Validate on startup
validateEnv();

// Check environment
if (isProduction) {
  // Production-only code
}
```

### `constants.ts`
Application-wide constants and enums.

```typescript
import { USER_TYPES, REQUEST_STATUS, API_ROUTES } from '@/lib/constants';

// Use constants
const userType = USER_TYPES.CLIENT;
const status = REQUEST_STATUS.PENDING;

// Use API routes
fetch(API_ROUTES.LOOKS.BY_ID(123));
```

### `api-utils.ts`
API route helpers for consistent error handling and responses.

```typescript
import { 
  handleApiError, 
  ApiErrors, 
  successResponse,
  validateRequired 
} from '@/lib/api-utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    validateRequired(body, ['name', 'email']);
    
    // Your logic here
    const result = await createUser(body);
    
    // Return success
    return successResponse(result, 201);
  } catch (error) {
    // Handle errors consistently
    return handleApiError(error);
  }
}
```

### `auth.ts`
Authentication helpers for client-side auth checks.

```typescript
import { getUserFromLocalStorage, isAuthenticated } from '@/lib/auth';

// Get current user
const user = getUserFromLocalStorage();

// Check if authenticated
if (isAuthenticated()) {
  // User is logged in
}
```

### `storage.ts`
File upload utilities supporting multiple storage providers.

```typescript
import { uploadFile, deleteFile, generateFilename } from '@/lib/storage';

// Upload a file
const { url, key } = await uploadFile(file, 'design.jpg', {
  folder: 'nail-designs',
});

// Delete a file
await deleteFile(key);

// Generate unique filename
const filename = generateFilename('photo.jpg', 'nail');
```

### `ai.ts`
AI generation utilities for creating nail designs.

```typescript
import { generateNailDesign, nailArtStyles } from '@/lib/ai';

// Generate designs from prompt
const images = await generateNailDesign({
  prompt: 'minimalist floral nail art',
  count: 3,
  size: '1024x1024',
});

// Use predefined styles
const prompt = nailArtStyles.minimalist;
```

### `email.ts`
Email utilities for sending notifications.

```typescript
import { sendEmail, emailTemplates } from '@/lib/email';

// Send welcome email
await sendEmail({
  to: 'user@example.com',
  ...emailTemplates.welcome('John'),
});

// Send custom email
await sendEmail({
  to: 'user@example.com',
  subject: 'Custom Subject',
  html: '<p>Email content</p>',
});
```

### `utils.ts`
General utility functions (from shadcn/ui).

```typescript
import { cn } from '@/lib/utils';

// Merge class names
<div className={cn('base-class', isActive && 'active-class')} />
```

## Best Practices

### Environment Variables
- Always use `env.ts` to access environment variables
- Never access `process.env` directly in application code
- Validate required variables on startup

### API Routes
- Use `handleApiError` for consistent error responses
- Use `validateRequired` to check required fields
- Return proper HTTP status codes
- Use `ApiErrors` for common error cases

### Constants
- Define all magic strings and numbers in `constants.ts`
- Use TypeScript `as const` for type safety
- Group related constants together

### Type Safety
- Export types alongside utilities
- Use TypeScript strict mode
- Avoid `any` types

## Adding New Utilities

1. Create a new file in `lib/`
2. Export functions with clear names
3. Add JSDoc comments for documentation
4. Update this README with usage examples
5. Add tests if applicable

## Examples

### Creating a Protected API Route

```typescript
import { handleApiError, ApiErrors, validateRequired } from '@/lib/api-utils';
import { env } from '@/lib/env';
import { db } from '@/db';

export async function POST(request: Request) {
  try {
    // Get auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      throw ApiErrors.Unauthorized('Missing authorization header');
    }

    // Parse body
    const body = await request.json();
    validateRequired(body, ['title', 'imageUrl']);

    // Your logic
    const result = await db.insert(looks).values(body);

    return successResponse(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Using Constants in Components

```typescript
import { APP_ROUTES, USER_TYPES } from '@/lib/constants';
import { useRouter } from 'next/navigation';

export function MyComponent() {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(APP_ROUTES.LOOK(123));
  };
  
  return <button onClick={handleClick}>View Look</button>;
}
```

### Environment-Specific Logic

```typescript
import { env, isProduction, isDevelopment } from '@/lib/env';

export function setupAnalytics() {
  if (isProduction && env.GA_ID) {
    // Initialize Google Analytics
  }
  
  if (isDevelopment) {
    console.log('Analytics disabled in development');
  }
}
```
