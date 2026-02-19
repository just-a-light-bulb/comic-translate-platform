# User Settings Feature Implementation Plan

> **Goal:** Implement a complete user settings feature with enhanced backend API and polished UI for managing user preferences.

**Architecture:**

- Backend: SvelteKit API routes with Drizzle ORM for database operations
- Frontend: Svelte 5 with runes, shadcn-svelte components, Tailwind CSS
- Authentication: Kinde Auth for user management
- Theme/Language: Persistent storage with immediate UI feedback

**Tech Stack:** SvelteKit, Svelte 5, TypeScript, Drizzle ORM, PostgreSQL, Tailwind CSS, shadcn-svelte

---

## Current State Analysis

The codebase already has:

- `user_settings` table in database schema
- Basic `/settings` page with display name, language, theme
- Basic `/api/settings` endpoint with GET/PUT
- Server-side functions in `$lib/server/user-settings.ts`

## Improvements Needed

1. **UI Consistency:** Update Header component to link to correct settings page
2. **Enhanced Settings UI:** Add more settings options, improve UX
3. **Database Migration:** Add any missing fields
4. **Theme Persistence:** Ensure theme works across page reloads
5. **Language Integration:** Connect with Paraglide i18n
6. **Form Validation:** Add proper validation with Zod

---

## Task 1: Update Header Component

**Files:**

- Modify: `src/lib/components/layout/Header.svelte`

**Changes:**

- Update settings link from `/dashboard#account` to `/settings`
- Ensure mobile menu also has correct link

---

## Task 2: Enhance Settings Page UI

**Files:**

- Modify: `src/routes/settings/+page.svelte`
- Modify: `src/routes/settings/+page.server.ts`

**Changes:**

- Add proper form validation
- Improve visual design with better spacing
- Add loading states and error handling
- Ensure theme changes apply immediately
- Add "Reset to Defaults" functionality

---

## Task 3: Enhance API Endpoint

**Files:**

- Modify: `src/routes/api/settings/+server.ts`

**Changes:**

- Add Zod validation for request body
- Improve error handling
- Add validation for all fields

---

## Task 4: Add Theme Persistence

**Files:**

- Modify: `src/routes/+layout.svelte`

**Changes:**

- Apply theme on page load from user settings or localStorage
- Ensure theme persists across navigation

---

## Task 5: Update Translations

**Files:**

- Modify: `messages/en.json`
- Modify: `messages/th.json`

**Changes:**

- Add translation keys for settings page

---

## Task 6: Add Database Migration (if needed)

**Files:**

- Create: `drizzle/0001_add_user_settings_fields.sql`

**Changes:**

- Add any missing fields to user_settings table
