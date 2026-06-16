---
stepsCompleted: [1, 2]
step3Progress: 'epic-1-complete'
inputDocuments:
  - '_bmad-output/planning-artifacts/prds/prd-wharf-spaces-2026-06-09/prd.md'
  - '_bmad-output/planning-artifacts/prds/prd-wharf-spaces-2026-06-09/addendum.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/project-context.md'
---

# wharf-spaces - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for ParkANDPerch (wharf-spaces rebuild), decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR-001: Each tenant has one authentication provider configured (Google, Microsoft, or Apple). On the sign-in screen, the user enters their email address; the app resolves the tenant from the email domain and presents the sign-in journey for that tenant's configured provider.
FR-002: Sign-in is restricted to email addresses on the tenant's allowlist, managed by the Company Admin. A user not on the allowlist is shown a message directing them to contact their administrator.
FR-003: A demo access mode can be enabled per-environment, allowing App Store/Play Store reviewers to sign in using a preconfigured demo account without requiring corporate SSO credentials.
FR-005: On successful sign-in, the user is routed directly to the booking screen with no intermediate onboarding steps.
FR-006: On first sign-in, the user is prompted to grant push notification permissions before or immediately upon landing on the booking screen.
FR-007: The booking screen displays a horizontal week view (Mon–Fri). The user can navigate forward or back one week at a time. Days with active bookings are visually indicated.
FR-008: A segmented control (Desk / Parking) switches the entire booking view between desk and parking contexts.
FR-009: The desk view shows three independently bookable time slots: All Day, AM, and PM. Each tile displays bookings against tenant desk capacity.
FR-010: The signed-in user's profile picture, name, and a Book button are shown once a time slot is selected. Tapping Book confirms the personal booking.
FR-011: Desk capacity is configured per tenant. When bookings for a slot reach capacity, no further personal bookings are accepted (waitlist applies — see FR-012).
FR-012: When a time slot is at capacity, a booking is placed on a reserve (waitlist) list. On cancellation, the next eligible waitlist user is automatically promoted with slot-type matching rules (AM→AM, PM→PM, AllDay→AllDay/AM/PM). A push notification is sent to the promoted user.
FR-013: Any user can book a desk for a guest. Guest bookings are attributed to the host and displayed in Who's In under the host's name.
FR-014: A user can cancel their own desk booking for a given slot and date. Cancellation removes the booking and advances waitlist positions.
FR-015: The parking view shows the same three time slots (All Day, AM, PM). Each tile displays bookings against the capacity visible to the user.
FR-016: The user books a parking space for a selected slot and date. The tile shows a "You've Booked!" confirmation state with a Cancel button. Changing slots is done by tapping a different tile — no separate edit flow.
FR-017: Each tenant's Company Admin configures how many days ahead parking bookings can be made. The booking window unlocks one day at a time at 12pm server time. Dates outside the window display an informational message with a Refresh button. All calculations use server time to prevent device clock manipulation.
FR-018: Each tenant defines internal groups (e.g. teams, floors). Parking capacity is allocated per group. The capacity and bookings visible to a user reflect their group's allocation for the selected date and slot.
FR-019: Only users with the Company Admin role can book guest parking spaces. The guest parking option is not shown to standard users.
FR-020: A tappable banner is displayed on the booking screen showing the day's note. The banner label is tenant-configurable. When no note exists, the banner shows a prompt to add one.
FR-021: Any signed-in user can create or edit the day's note for their tenant. One note per day per tenant. The edit modal has a single text input with Save and Cancel. Saving with non-empty text creates/updates; saving with empty text deletes without confirmation prompt.
FR-022: If the note is modified externally while a user has the edit modal open, the user is shown an advisory warning (informational only — they are not blocked from saving).
FR-023: isOfficeClosed field — out of scope for v1 UI. Field exists on Note model.
FR-024: Below the time slot tiles, the booking screen displays a live list of all bookings for the selected date and space type. The list updates in real time. It switches between "Who's in?" (desk) and "Who's parking?" (parking) based on the active space type toggle.
FR-025: Each row shows the user's profile picture, name, and time slot. The signed-in user's own row is visually highlighted. Guest rows display as "[Host's name]'s Visitor N" with no profile picture. Waitlisted bookings display the user's reserve position number.
FR-026: The count badge in the Who's In header uses a tenant-configurable term for members (replacing "ANDis"). Visitors are counted separately.
FR-027: Rows are sorted alphabetically by name. An empty state message is shown when no bookings exist for the selected date and space type.
FR-028: On sign-in, the app requests push notification permission and registers the device token. The token is refreshed automatically when it changes. On sign-out, the token is removed before the session ends.
FR-029: Notifications received while the app is in the foreground are displayed as a native alert dialog.
FR-030: When the system automatically books a user from the waitlist (FR-012), a push notification is sent to that user confirming their booking.
FR-031: AND Digital provisions a new tenant via a web form capturing: tenant name, email domain, authentication provider, and email of first Company Admin. Submission creates the tenant, associates the domain, grants the first Company Admin access, and auto-creates a Default group with 0 parking capacity.
FR-032: Company Admins manage their tenant's user allowlist via the web platform — adding and removing email addresses. When adding a user, the Company Admin must assign them to a group.
FR-033: AND Digital can suspend a tenant (e.g. non-payment), immediately locking out all users. Tenant data is preserved. Reinstating restores full access.
FR-034: AND Digital can permanently remove a tenant and hard-delete all associated data (users, bookings, configuration). Immediate hard delete is acceptable.
FR-035: Each tenant's data — users, bookings, notes, configuration — is fully isolated. Cross-tenant data access must return an error. This is a backend security guarantee verifiable by security test.
FR-036: The app is a single binary on the App Store. Tenant branding, configuration, and feature settings are loaded at runtime based on the signed-in user's tenant. No per-tenant builds are produced.
FR-037: Company Admins configure their tenant's branding via the web platform — colours and logo. Branding is applied across the mobile app at runtime.
FR-038: Company Admins configure the following via the web platform: parking groups and per-group capacity, booking window rules, member terminology, and the events banner label.
FR-039: The app name is ParkANDPerch (pending marketing sign-off).
FR-040: At 9pm London server time each evening, unbooked parking spaces across all groups within a tenant are pooled and allocated to waitlisted users in waitlist order, regardless of group membership. A push notification is sent to each allocated user (best-effort). A user who did not receive a notification will see their booking in-app on next visit.

### NonFunctional Requirements

NFR-1 (GDPR & Privacy): Personal data held: name, email, tenant/group membership, profile picture URL, role, booking history. Data residency: EU only (Firebase `europe-west1`). User removal from allowlist triggers deletion of personal data and booking records. Right to erasure handled manually in v1. Tenant removal triggers immediate hard-delete of all associated data. Data minimisation enforced.
NFR-2 (Security): Firebase AppCheck verifies app binary integrity on every launch — app is blocked until verified. Every API request requires both a Firebase ID token (user identity) and an AppCheck token (app integrity). Tenant isolation is enforced server-side and verifiable by security test. User roles are enforced server-side. Parking booking window rules are validated using server time to prevent device clock manipulation.
NFR-3 (Observability & Logging): Crash reports and error events must be attributed to the tenant. Firebase Crashlytics used for crash/non-fatal reporting with tenant, user role, and feature area context. Firebase Analytics tracks usage with tenant attribution. A toggle on the sign-in screen allows users to opt out of Crashlytics and Analytics — this setting persists across sessions.
NFR-4 (Support Model): Company Admins contact AND Digital directly for platform support. No in-app support mechanism in v1.
NFR-5 (Performance & Reliability): Booking and cancellation actions must feel responsive — confirmation perceptible without uncomfortable wait. Who's In list must update without a user-initiated refresh. Concurrent booking writes must not exceed capacity or corrupt waitlist positions. When offline, app must not crash — last-known state displayed, booking actions disabled with clear message. Platform availability inherits Firebase infrastructure characteristics (no separate uptime target in v1).

### Additional Requirements

- **Repo initialisation (mobile):** `npx @react-native-community/cli@latest init ParkANDPerch` — bare TypeScript community template; no Expo
- **Repo initialisation (web admin):** `npm create vite@latest web -- --template react-ts` — inside the same monorepo
- **Two Firebase projects:** `parkandperch-dev` (development + QA) and `parkandperch-prod` (production); configured via `.firebaserc` and `react-native-config` `.env` files
- **Firebase emulator suite:** configured for local development against `parkandperch-dev`
- **Firestore subcollection tenancy model:** all tenant data under `tenants/{tenantId}/` subcollections (bookings, users, notes, config/settings, config/allowlist, groups)
- **Top-level `domains/` collection:** maps email domains to `{ tenantId, provider }` — readable only by Functions, never by mobile clients
- **Firestore Security Rules:** tenant-scoped using custom claims (`request.auth.token.tenantId == tenantId`); must be implemented before any feature is testable
- **Firebase Custom Claims `{ tenantId, role }`:** set by `createUser` Function on first verified sign-in; used by all Functions and Security Rules as the single source of tenant identity
- **Firebase Functions Gen 2, `europe-west1` region, domain-separated:** `auth/`, `bookings/`, `parking/`, `notes/`, `time/`, `admin/`, `shared/`
- **Shared Functions middleware (`functions/src/shared/middleware.ts`):** `enforceAuth()`, `enforceAppCheck()`, `resolveTenant()` — must be implemented first and used by every Function
- **Function response shape:** `{ success: true, data: T }` for success; `HttpsError` with typed code for errors
- **Cloud Scheduler → Pub/Sub → Function (Gen 2):** `runNightlyReallocation` triggered at `0 21 * * *` (Europe/London timezone)
- **Firestore `onDocumentDeleted` trigger:** `onBookingDeleted` handles waitlist promotion (decoupled from cancellation so cancellation always succeeds)
- **Path aliases:** configured in `tsconfig.json`, `babel.config.js`, AND `jest.config.ts` simultaneously — `@atoms/*`, `@molecules/*`, `@organisms/*`, `@screens/*`, `@state/*`, `@firebase/*`, `@navigation/*`, `@customTypes/*`, `@res/*`, `@api/*`, `@utils/*`, `@components/*`
- **`getAuthHeaders()` shared utility (`src/firebase/functions/authHeaders.ts`):** single source of dual-header (Firebase ID token + AppCheck token) attachment — all API calls must use this
- **ThemeContext + ThemeProvider token system:** `useTheme()` hook provides all colour/typography tokens; default tokens pre-sign-in, tenant branding tokens post-sign-in
- **`@react-native-community/netinfo` + `connectivity` Redux slice:** offline detection; booking actions disabled with clear message when offline (NFR-5)
- **Microsoft auth via Firebase OIDC provider + `signInWithCredential`:** no MSAL library; consistent with Google and Apple provider pattern
- **Composite Firestore indexes:** (1) `tenants/{tenantId}/bookings` on `date` ASC + `userId` ASC; (2) `tenants/{tenantId}/bookings` on `date` ASC + `spaceType` ASC + `isReserveSpace` ASC + `createdAt` ASC
- **`react-native-reanimated/plugin` must be the last plugin in `babel.config.js`**
- **All booking dates as UTC midnight ISO strings:** `YYYY-MM-DDT00:00:00Z` — use `getTodaysUTCDateMidnightString()` and `formatToBookingDateUTC()` exclusively; never `dayjs().toISOString()`
- **Firestore `in` queries limited to 10 items:** always use `chunkQuery()` utility for user ID array lookups
- **`react-native-uuid` for Note document IDs:** client-generated UUID used as both the `uuid` field and Firestore document ID

### UX Design Requirements

No UX design document — skipped by choice. Screenshots in `docs/screenshots/` provide reference for copy tone and interaction patterns (addendum A-003). The conversational product voice ("You've Booked!", "Be the first to book!") should be preserved in all user-facing copy.

### FR Coverage Map

FR-001: Epic 2 — Per-tenant auth provider resolved from email domain
FR-002: Epic 2 — Allowlist check in createUser Function
FR-003: Epic 2 — Demo access mode (preconfigured demo tenant)
FR-004: N/A — Not in PRD (skipped number)
FR-005: Epic 2 — Post-sign-in routing to BookingScreen
FR-006: Epic 3 — Push notification permission on HomeContainer mount
FR-007: Epic 3 — Week calendar (Mon–Fri, week navigation, booking indicators)
FR-008: Epic 3 — Desk/Parking space type toggle
FR-009: Epic 3 — Desk time slot tiles (All Day, AM, PM) with capacity display
FR-010: Epic 3 — Personal desk booking
FR-011: Epic 3 — Per-tenant desk capacity enforcement
FR-012: Epic 3 — Waitlist with onBookingDeleted auto-promotion (slot-type matching)
FR-013: Epic 3 — Guest desk booking
FR-014: Epic 3 — Desk booking cancellation
FR-015: Epic 4 — Parking time slot tiles
FR-016: Epic 4 — Personal parking booking with slot-switch UX
FR-017: Epic 4 — Tenant-configurable booking window (server-time validated)
FR-018: Epic 4 — Per-tenant groups and per-group parking capacity
FR-019: Epic 4 — Guest parking (Company Admin only)
FR-020: Epic 3 — Daily events banner (tenant-configurable label)
FR-021: Epic 3 — Note authoring (create/update/delete)
FR-022: Epic 3 — Concurrent edit warning
FR-023: Out of scope v1 — isOfficeClosed UI not implemented
FR-024: Epic 3 — Live Who's In list (real-time Firestore listener)
FR-025: Epic 3 — Booking row display (highlight, guest format, waitlist position)
FR-026: Epic 3 — Tenant-configurable member term in Who's In header
FR-027: Epic 3 — Alphabetical sort and empty state
FR-028: Epic 3 — FCM token lifecycle (register, refresh, remove on sign-out)
FR-029: Epic 3 — Foreground push notification display
FR-030: Epic 3 — Waitlist promotion push notification
FR-031: Epic 5 — Tenant provisioning form (web)
FR-032: Epic 5 — User allowlist management with group assignment (web)
FR-033: Epic 5 — Tenant suspension (web)
FR-034: Epic 5 — Tenant permanent removal + GDPR hard-delete (web)
FR-035: Epic 2 — Server-enforced tenant data isolation
FR-036: Epic 2 — Runtime tenant config loading (single binary)
FR-037: Epic 5 — Company Admin branding configuration (web)
FR-038: Epic 5 — Company Admin operational config (groups, window, terminology, banner)
FR-039: Epic 5 — App name ParkANDPerch (pending marketing)
FR-040: Epic 4 — Nightly 9pm cross-group parking reallocation

## Epic List

### Epic 1: Project Foundation & Infrastructure
Set up the monorepo, both Firebase projects (dev + prod), emulator config, Firestore Security Rules, shared Functions middleware, path aliases, ThemeContext token system, Redux store shell, navigation container skeleton, and Fastlane basics. Also includes the web admin Vite project scaffold. This epic has no directly mapped FRs — it is the infrastructure that makes every other epic possible.
**FRs covered:** (none — infrastructure foundation)
**NFRs addressed:** NFR-1 (EU region), NFR-2 (AppCheck, Security Rules, dual-header middleware), NFR-3 (Crashlytics/Analytics wiring), NFR-5 (connectivity slice, Firestore offline persistence)

### Epic 2: Tenant-Aware Authentication
Users can sign in with their company's configured auth provider (Google, Microsoft, or Apple). The app resolves the tenant from their email domain, verifies they're on the allowlist, sets their tenant identity as a custom claim, loads their tenant's config, and applies their company's branding. After sign-in they land directly on the booking screen.
**FRs covered:** FR-001, FR-002, FR-003, FR-005, FR-035, FR-036
**NFRs addressed:** NFR-2 (custom claims, tenant isolation), NFR-3 (user consent toggle on LoginScreen)

### Epic 3: Desk Booking & Core Booking Experience
Users can navigate a week calendar, toggle between desk and parking views, book or cancel desk slots (personal and guest), join and be promoted off the waitlist, see who else is in the office in real time, view and edit the day's note, receive push notifications, and use the app gracefully when offline.
**FRs covered:** FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013, FR-014, FR-020, FR-021, FR-022, FR-024, FR-025, FR-026, FR-027, FR-028, FR-029, FR-030
**NFRs addressed:** NFR-5 (real-time Who's In, responsive booking, offline handling, concurrent write correctness)

### Epic 4: Parking Booking
Users can book parking spaces for their group, see their group's capacity, respect the tenant-configurable booking window (validated using server time), book guest parking if a Company Admin, and benefit from automatic nightly cross-group space reallocation with push notification.
**FRs covered:** FR-015, FR-016, FR-017, FR-018, FR-019, FR-040
**NFRs addressed:** NFR-2 (server-time validation for booking window anti-manipulation)

### Epic 5: Web Platform — Tenant Management
AND Digital can provision new tenants, manage user allowlists with group assignment, configure per-tenant branding and operational settings (groups/capacity, booking window, member terminology, events banner), and suspend or permanently remove tenants with full GDPR data deletion.
**FRs covered:** FR-031, FR-032, FR-033, FR-034, FR-037, FR-038, FR-039
**NFRs addressed:** NFR-1 (GDPR deletion cascade on user/tenant removal)

---

## Epic 1: Project Foundation & Infrastructure

Set up the monorepo, both Firebase projects (dev + prod), emulator config, Firestore Security Rules, shared Functions middleware, path aliases, ThemeContext token system, Redux store shell, navigation container skeleton, and Fastlane basics. Also includes the web admin Vite project scaffold. This epic has no directly mapped FRs — it is the infrastructure that makes every other epic possible.

### Story 1.1: Monorepo Initialisation & Project Configuration

As a developer,
I want the monorepo initialised with the React Native mobile app, Vite web admin, Firebase project aliases, emulator config, and all path aliases configured,
So that every agent starts from a correctly-configured baseline with no ambiguity about project structure.

**Acceptance Criteria:**

**Given** the repo is cloned and `yarn install` is run at root,
**When** all dependencies install,
**Then** there are no errors and the lockfile is committed

**Given** the path aliases are configured,
**When** TypeScript resolves `@atoms`, `@molecules`, `@organisms`, `@screens`, `@state`, `@firebase`, `@navigation`, `@customTypes`, `@res`, `@api`, `@utils`, `@components`,
**Then** they resolve to the correct `src/` subdirectories in all three contexts: `tsconfig.json` compilation, Metro bundler (`babel.config.js`), and Jest tests (`jest.config.ts`)

**Given** `react-native-reanimated/plugin` is configured,
**When** `babel.config.js` plugins array is inspected,
**Then** `react-native-reanimated/plugin` is the last entry — no plugins follow it

**Given** the `.firebaserc` file exists,
**When** `firebase use dev` is run,
**Then** it targets `parkandperch-dev`; when `firebase use prod` is run, it targets `parkandperch-prod`

**Given** `.env.development` contains `REACT_APP_USE_EMULATORS=true`,
**When** the dev build is run,
**Then** Firebase services connect to the local emulator suite (Auth, Firestore, Functions emulators)

**Given** `setup-jest.ts` is configured,
**When** any test file runs,
**Then** all `@react-native-firebase/*` modules are globally mocked without per-test re-mocking; the mock exports `mockFirestoreGet`, `mockGetFirestore` etc. for assertion use

**Given** the web admin is scaffolded in `web/`,
**When** `cd web && npm run dev` is run,
**Then** the Vite dev server starts and serves the placeholder React app without errors

---

### Story 1.2: Firebase Functions Foundation & Shared Middleware

As a developer,
I want the Firebase Functions project scaffolded with domain-separated empty modules and shared authentication/AppCheck middleware,
So that every Function enforces dual-header auth from day one using a single shared utility that cannot be accidentally skipped.

**Acceptance Criteria:**

**Given** the functions project is set up,
**When** `firebase deploy --only functions` targets `parkandperch-dev`,
**Then** Functions deploy successfully to `europe-west1` as Gen 2 Functions with no errors

**Given** `enforceAuth(context)` is called without a valid Firebase ID token,
**When** the middleware runs,
**Then** it throws `HttpsError('unauthenticated', ...)` immediately, before any business logic executes

**Given** `enforceAppCheck(context)` is called without a valid AppCheck token,
**When** the middleware runs,
**Then** it throws `HttpsError('unauthenticated', ...)` immediately

**Given** `resolveTenant(context)` is called with a valid auth context containing a `tenantId` custom claim,
**When** the middleware runs,
**Then** it returns the `tenantId` string from `context.auth.token.tenantId`

**Given** `resolveTenant(context)` is called with a valid auth context that has no `tenantId` claim,
**When** the middleware runs,
**Then** it throws `HttpsError('permission-denied', ...)`

**Given** `functions/src/index.ts` is inspected,
**When** the exports are listed,
**Then** all six domain modules (`auth`, `bookings`, `parking`, `notes`, `time`, `admin`) are exported, even if each module currently exports only an empty object

**Given** `functions/src/shared/errors.ts` defines the error code vocabulary,
**When** any Function throws an `HttpsError`,
**Then** the code is one of: `unauthenticated`, `permission-denied`, `resource-exhausted`, `invalid-argument`, `not-found`, `aborted`

---

### Story 1.3: Firestore Security Rules & TypeScript Data Models

As a developer,
I want Firestore Security Rules that enforce tenant isolation at the database level, plus TypeScript interfaces for all data models,
So that cross-tenant data access is impossible even if a Function is misconfigured, and all agents write type-consistent code.

**Acceptance Criteria:**

**Given** Firestore Security Rules are deployed to `parkandperch-dev`,
**When** a request is made with `auth.token.tenantId = 'tenant-A'` to path `tenants/tenant-B/bookings/...`,
**Then** the request is denied

**Given** Firestore Security Rules are deployed,
**When** a request is made with `auth.token.tenantId = 'tenant-A'` to path `tenants/tenant-A/bookings/...`,
**Then** read and write are permitted

**Given** Firestore Security Rules are deployed,
**When** a mobile client (not Admin SDK) attempts to read `domains/{domain}`,
**Then** the request is denied — the `domains/` collection is not readable by any client

**Given** `firestore.indexes.json` is deployed,
**When** querying `tenants/{tenantId}/bookings` filtered by `date` and `userId` ordered ascending,
**Then** the query succeeds without a missing-index error

**Given** `firestore.indexes.json` is deployed,
**When** querying `tenants/{tenantId}/bookings` filtered by `date`, `spaceType`, `isReserveSpace` and ordered by `createdAt` ascending,
**Then** the query succeeds without a missing-index error

**Given** `src/customTypes/` is fully implemented,
**When** TypeScript compiles,
**Then** `User`, `Booking`, `Note`, `TenantConfig`, `Group`, `ReducedUserData` types and `SpaceType`, `TimeSlot`, `Role`, `BookingType`, `AuthProvider` enums all resolve without type errors

**Given** the `Booking` type is defined,
**When** the `timeSlot` field is inspected,
**Then** it is typed as `'am' | 'pm' | 'allDay'` — not a free string

**Given** the `Booking` type is defined,
**When** the `date` field is inspected,
**Then** its JSDoc documents that the value must be a UTC midnight ISO string (`YYYY-MM-DDT00:00:00Z`)

---

### Story 1.4: Theme Token System

As a developer,
I want a `ThemeContext`-based token system with the default brand palette,
So that every UI component accesses colours and typography through `useTheme()` and tenant branding can replace defaults at runtime — making hardcoded hex values a compile-detectable anti-pattern.

**Acceptance Criteria:**

**Given** `ThemeProvider` wraps the app with no tenant branding loaded (pre-sign-in),
**When** `useTheme()` is called in any component,
**Then** it returns the default token set including: charcoal `#323232`, red `#ff323c`, orange `#ff7900`, yellow `#ffc800`, green `#5ac328`, blue `#2897ff`, purple `#a050ff`, white `#ffffff`, lightGrey `#f6f6f6`, greyMid `#757575`

**Given** `ThemeTokens` is a TypeScript interface,
**When** a component references `colors.nonExistentKey`,
**Then** TypeScript reports a type error — invalid token keys are caught at compile time

**Given** `ThemeProvider` is updated with a new colour set (simulating post-sign-in tenant branding),
**When** `useTheme()` is called by child components,
**Then** they receive the updated token values without needing to remount

**Given** any component in the codebase renders a colour value,
**When** the source code is inspected,
**Then** no hex literals (`#rrggbb`) or hardcoded font family strings appear in any `StyleSheet.create()` call — all values come from `useTheme()`

---

### Story 1.5: Redux Store Shell & Core Slices

As a developer,
I want the Redux store configured with all required slices and typed hooks,
So that the full store shape is established from day one and agents consistently use `useAppDispatch` and `useAppSelector` rather than raw Redux APIs.

**Acceptance Criteria:**

**Given** `store.ts` is configured,
**When** the `AppStore` type is inspected,
**Then** it contains all ten keys: `splashScreen`, `tenantConfig`, `featureFlags`, `user`, `selectedDayOptions`, `note`, `loading`, `error`, `utils`, `connectivity`

**Given** `hooks.ts` exports `useAppDispatch` and `useAppSelector`,
**When** `useAppDispatch()` is called in a component,
**Then** the returned dispatch function accepts only valid action types — dispatching an unknown action type is a TypeScript error

**Given** `loading.slice.ts` is implemented,
**When** `setIsLoading(true)` is dispatched,
**Then** `state.loading.isLoading` becomes `true`; when `setIsLoading(false)` is dispatched, it becomes `false`

**Given** `connectivity.slice.ts` is wired to `@react-native-community/netinfo`,
**When** NetInfo reports `isConnected: false`,
**Then** `state.connectivity.isConnected` updates to `false` in the Redux store

**Given** `splashScreen.slice.ts` is implemented with a `selectShouldHideSplashScreen` selector,
**When** only `setScreensLoaded(true)` has been dispatched (not `setRemoteConfigFound`),
**Then** the selector returns `false`; when both have been dispatched, it returns `true`

**Given** `error.slice.ts` is implemented,
**When** `setShowError(true)` is dispatched,
**Then** `state.error.showError` becomes `true`

---

### Story 1.6: Navigation Shell, Observability & Build Pipeline

As a developer,
I want the navigation container skeleton, Firebase observability, and Fastlane/Hosting build pipeline in place,
So that the app boots correctly to a placeholder, crashes are reported with tenant context, and QA builds can be distributed from day one.

**Acceptance Criteria:**

**Given** the app launches on iOS or Android,
**When** `AppContainer` renders,
**Then** the render tree is: `NavigationContainer` → `AuthContainer` → `HomeContainer` → placeholder `BookingScreen` showing "Booking Screen — Coming Soon"

**Given** `react-native-bootsplash` is installed and the splash screen is shown,
**When** `splashScreen.screensLoaded` is `true` but `splashScreen.remoteConfigFound` is `false`,
**Then** the splash screen remains visible

**Given** both `screensLoaded` and `remoteConfigFound` are dispatched as `true`,
**When** the splash screen logic runs,
**Then** `react-native-bootsplash` hides the splash screen

**Given** Firebase Crashlytics is configured and a non-fatal error is logged,
**When** the error event is inspected in the Crashlytics console,
**Then** it includes a `tenantId` custom key (`'unknown'` pre-sign-in)

**Given** the user has set the Crashlytics/Analytics consent toggle to off (persisted),
**When** a new session starts,
**Then** `Crashlytics.setCrashlyticsCollectionEnabled(false)` and `Analytics.setAnalyticsCollectionEnabled(false)` are called — no data is sent

**Given** Fastlane is configured,
**When** `fastlane ios qa` is invoked in CI,
**Then** the lane builds the iOS app in Release configuration and uploads to TestFlight (stubbed — credentials managed in CI secrets, not in the lane file)

**Given** the web admin `firebase.json` Hosting config exists with a catch-all rewrite to `index.html`,
**When** `cd web && npm run build && firebase deploy --only hosting` is run,
**Then** the web admin deploys to `parkandperch-dev` Hosting and navigating directly to any React Router route returns the app (not a 404)
