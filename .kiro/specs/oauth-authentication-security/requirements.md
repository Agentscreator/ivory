# Requirements Document

## Introduction

This specification addresses a critical security vulnerability in the authentication system where Google and Apple sign-in buttons create user accounts without proper OAuth verification. Currently, the system generates fake credentials and bypasses authentication entirely, allowing anyone to create accounts by clicking these buttons. This specification defines the requirements for implementing proper OAuth 2.0 authentication flows for both Google and Apple sign-in, ensuring users are properly authenticated before account creation or login.

## Glossary

- **OAuth Provider**: A third-party authentication service (Google or Apple) that verifies user identity
- **OAuth Flow**: The standardized process of redirecting users to an OAuth Provider, obtaining authorization, and receiving verified user credentials
- **Access Token**: A credential issued by the OAuth Provider that proves successful authentication
- **ID Token**: A JWT containing verified user information from the OAuth Provider
- **Redirect URI**: The application URL where the OAuth Provider sends users after authentication
- **Client ID**: The application identifier registered with the OAuth Provider
- **Client Secret**: A confidential key used to verify the application's identity with the OAuth Provider
- **Authorization Code**: A temporary code exchanged for access tokens in the OAuth flow
- **Authentication System**: The application's login and signup functionality

## Requirements

### Requirement 1

**User Story:** As a user, I want to sign in with Google using proper OAuth authentication, so that my identity is verified and my account is secure.

#### Acceptance Criteria

1. WHEN a user clicks the Google sign-in button, THEN the Authentication System SHALL redirect the user to Google's OAuth authorization page
2. WHEN Google successfully authenticates the user, THEN the OAuth Provider SHALL redirect back to the application with an authorization code
3. WHEN the application receives the authorization code, THEN the Authentication System SHALL exchange it for an access token and ID token from Google
4. WHEN the Authentication System receives valid tokens, THEN the Authentication System SHALL extract verified user information from the ID token
5. IF the user's email already exists in the database, THEN the Authentication System SHALL log the user into their existing account
6. IF the user's email does not exist in the database, THEN the Authentication System SHALL create a new account with the verified information
7. WHEN account creation or login succeeds, THEN the Authentication System SHALL create a session for the user

### Requirement 2

**User Story:** As a user, I want to sign in with Apple using proper OAuth authentication, so that my identity is verified and my account is secure.

#### Acceptance Criteria

1. WHEN a user clicks the Apple sign-in button, THEN the Authentication System SHALL redirect the user to Apple's OAuth authorization page
2. WHEN Apple successfully authenticates the user, THEN the OAuth Provider SHALL redirect back to the application with an authorization code
3. WHEN the application receives the authorization code, THEN the Authentication System SHALL exchange it for an access token and ID token from Apple
4. WHEN the Authentication System receives valid tokens, THEN the Authentication System SHALL extract verified user information from the ID token
5. IF the user's email already exists in the database, THEN the Authentication System SHALL log the user into their existing account
6. IF the user's email does not exist in the database, THEN the Authentication System SHALL create a new account with the verified information
7. WHEN account creation or login succeeds, THEN the Authentication System SHALL create a session for the user
8. WHEN Apple provides a private relay email, THEN the Authentication System SHALL accept and store the private relay email address

### Requirement 3

**User Story:** As a developer, I want OAuth credentials securely configured, so that the authentication flow works correctly and secrets are protected.

#### Acceptance Criteria

1. WHEN the application initializes, THEN the Authentication System SHALL load Google Client ID and Client Secret from environment variables
2. WHEN the application initializes, THEN the Authentication System SHALL load Apple Client ID and Client Secret from environment variables
3. WHEN the application initializes, THEN the Authentication System SHALL load OAuth redirect URIs from environment variables
4. IF any required OAuth credentials are missing, THEN the Authentication System SHALL log an error and disable the corresponding OAuth provider
5. WHEN storing OAuth credentials, THEN the Authentication System SHALL ensure Client Secrets are never exposed to the client-side code

### Requirement 4

**User Story:** As a user, I want clear error messages when OAuth authentication fails, so that I understand what went wrong and can try again.

#### Acceptance Criteria

1. WHEN the OAuth Provider returns an error during authorization, THEN the Authentication System SHALL display a user-friendly error message
2. WHEN token exchange fails, THEN the Authentication System SHALL display a user-friendly error message
3. WHEN the OAuth Provider returns invalid or expired tokens, THEN the Authentication System SHALL display a user-friendly error message
4. WHEN network errors occur during OAuth flow, THEN the Authentication System SHALL display a user-friendly error message
5. WHEN an error occurs, THEN the Authentication System SHALL log detailed error information for debugging purposes

### Requirement 5

**User Story:** As a system administrator, I want OAuth accounts properly linked to user records, so that users can access their accounts consistently.

#### Acceptance Criteria

1. WHEN a user signs in with an OAuth Provider for the first time, THEN the Authentication System SHALL create a user record with the authProvider field set to the provider name
2. WHEN a user signs in with an OAuth Provider, THEN the Authentication System SHALL store the OAuth Provider's unique user ID
3. WHEN a user with an existing email signs in via OAuth, THEN the Authentication System SHALL update their authProvider field to reflect OAuth usage
4. WHEN creating an OAuth account, THEN the Authentication System SHALL set the passwordHash field to null
5. WHEN a user has an OAuth account, THEN the Authentication System SHALL prevent password-based login for that account

### Requirement 6

**User Story:** As a user, I want my OAuth authentication to work on both web and mobile platforms, so that I can access my account from any device.

#### Acceptance Criteria

1. WHEN the application runs in a web browser, THEN the Authentication System SHALL use standard OAuth redirect flows
2. WHEN the application runs on iOS via Capacitor, THEN the Authentication System SHALL use iOS-compatible OAuth flows with proper URL scheme handling
3. WHEN the application runs on Android via Capacitor, THEN the Authentication System SHALL use Android-compatible OAuth flows with proper URL scheme handling
4. WHEN OAuth redirect occurs on mobile, THEN the Authentication System SHALL properly capture the redirect and complete the authentication flow
5. WHEN the user completes OAuth on mobile, THEN the Authentication System SHALL create a session accessible to the mobile application
