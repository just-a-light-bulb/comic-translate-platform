# Stack Auth Integration Design

**Date:** 2026-02-18
**Status:** Approved
**Author:** AI Assistant

## Overview

Integrate Stack Auth authentication into the Comic Translate Platform (SvelteKit) using `@stackframe/js` SDK with custom Svelte UI components. This provides full control over UX while leveraging Stack Auth's robust backend.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Svelte)                      │
├─────────────────────────────────────────────────────────┤
│  Pages: /sign-in, /sign-up, /forgot-password            │
│  Components: SignInForm, SignUpForm, OAuthButton        │
│  Uses: shadcn-svelte (Button, Input, Card, Label)       │
└────────────────────────┬────────────────────────────────┘
                         │ API calls
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  SvelteKit Server                        │
├─────────────────────────────────────────────────────────┤
│  hooks.server.ts → Auth middleware (session check)      │
│  routes/api/auth/* → Auth API endpoints                 │
│  lib/server/stack.ts → Stack SDK wrapper                │
└────────────────────────┬────────────────────────────────┘
                         │ Stack SDK
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Stack Auth Cloud                       │
└─────────────────────────────────────────────────────────┘
```

## File Structure

```
src/
├── lib/
│   ├── server/
│   │   ├── stack.ts              # Stack SDK client config
│   │   └── auth.ts               # Auth utilities (getSession, requireAuth)
│   └── components/
│       └── auth/
│           ├── SignInForm.svelte
│           ├── SignUpForm.svelte
│           └── OAuthButtons.svelte
├── routes/
│   ├── (auth)/
│   │   ├── sign-in/+page.svelte
│   │   ├── sign-up/+page.svelte
│   │   └── callback/+page.svelte  # OAuth callback
│   └── api/auth/
│       ├── sign-in/+server.ts
│       ├── sign-up/+server.ts
│       ├── sign-out/+server.ts
│       └── session/+server.ts
└── hooks.server.ts               # Auth middleware (updated)
```

## Session Management

- **Cookies** for session tokens (httpOnly, secure, sameSite)
- **hooks.server.ts** attaches `user` to `event.locals`
- Protected routes use `requireAuth()` helper

### Cookie Strategy

```
stack_access_token  - httpOnly, secure, sameSite=strict, 7 days
stack_refresh_token - httpOnly, secure, sameSite=strict, 30 days
```

## OAuth Flow

```
User clicks "Sign in with Google"
    → Generate OAuth URL with state (CSRF protection)
    → Redirect to Stack Auth OAuth URL
    → User authenticates with Google
    → Redirect to /callback?code=xxx&state=xxx
    → Validate state
    → Exchange code for tokens
    → Set cookies, redirect to dashboard
```

## API Endpoints

| Endpoint                     | Method | Description           |
| ---------------------------- | ------ | --------------------- |
| `/api/auth/sign-up`          | POST   | Create new user       |
| `/api/auth/sign-in`          | POST   | Authenticate user     |
| `/api/auth/sign-out`         | POST   | Clear session         |
| `/api/auth/session`          | GET    | Get current session   |
| `/api/auth/oauth/[provider]` | GET    | Initiate OAuth flow   |
| `/api/auth/oauth/callback`   | GET    | Handle OAuth callback |

## Features

| Feature                | Implementation                |
| ---------------------- | ----------------------------- |
| Email/Password Sign Up | Custom form → Stack API       |
| Email/Password Sign In | Custom form → Stack API       |
| OAuth (Google, GitHub) | Redirect flow → callback      |
| Session Persistence    | Cookie-based tokens           |
| Sign Out               | Clear cookies + Stack API     |
| Password Reset         | Redirect to Stack hosted page |

## Security Considerations

1. **CSRF Protection**: OAuth state parameter with signed cookies
2. **Secure Cookies**: httpOnly, secure, sameSite=strict
3. **Token Rotation**: Refresh tokens on expiry
4. **Input Validation**: Zod schemas for all form inputs
5. **Rate Limiting**: Consider for production

## Error Handling

- Network errors → User-friendly messages
- Invalid credentials → Form validation errors
- OAuth failures → Redirect with error message
- Session expiry → Redirect to sign-in

## Type Definitions

```typescript
// src/app.d.ts additions
declare global {
	namespace App {
		interface Error {
			message: string;
			code?: string;
		}
		interface Locals {
			user: User | null;
			session: Session | null;
		}
	}
}

interface User {
	id: string;
	email: string;
	displayName: string | null;
	profileImageUrl: string | null;
}

interface Session {
	accessToken: string;
	refreshToken: string;
	expiresAt: Date;
}
```

## Dependencies

```json
{
	"@stackframe/js": "latest",
	"zod": "^3.x"
}
```

## Testing Strategy

1. Unit tests for auth utilities
2. Integration tests for API endpoints
3. E2E tests for auth flows (optional)

## Migration Notes

- Update existing hooks.server.ts to chain auth middleware with paraglide
- Environment variables already defined in .env.example
