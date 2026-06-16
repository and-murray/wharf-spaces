---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-06-16'
inputDocuments:
  - '_bmad-output/planning-artifacts/prds/prd-wharf-spaces-2026-06-09/prd.md'
  - '_bmad-output/planning-artifacts/prds/prd-wharf-spaces-2026-06-09/addendum.md'
  - '_bmad-output/planning-artifacts/prds/prd-wharf-spaces-2026-06-09/handoff.md'
  - '_bmad-output/project-context.md'
workflowType: 'architecture'
project_name: 'wharf-spaces'
user_name: 'Ashley'
date: '2026-06-16'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (40 total):**

- **Authentication (FR-001–006):** Per-tenant auth provider (Google, Microsoft, Apple); email-first flow resolves tenant from domain; allowlist access control managed by Company Admin; demo access mode for App Store reviewers; no intermediate onboarding after sign-in; push notification permission on first sign-in.
- **Desk Booking (FR-007–014):** Week calendar with booking indicators; space type toggle (desk/parking); three independently bookable time slots (All Day, AM, PM); personal and guest desk bookings; per-tenant capacity from config; waitlist with auto-promotion on cancellation (slot-type matching rules); booking cancellation.
- **Parking Booking (FR-015–019, FR-040):** Same three time slots; tenant-configurable booking window unlocking at 12pm server time; per-tenant groups with per-group capacity allocation; capacity visibility scoped to user's group; guest parking (admin only); nightly cross-group space reallocation at 9pm server time with push notification to promoted users.
- **Events & Notes (FR-020–022):** One note per day per tenant; any signed-in user can author/edit; concurrent edit warning (informational); `isOfficeClosed` field exists on model but out of scope for v1 UI.
- **Who's In List (FR-024–027):** Real-time Firestore listener; desk ("Who's in?") and parking ("Who's parking?") views; guest rows with host attribution; waitlist position shown; tenant-configurable member term; alphabetical sort; empty state.
- **Push Notifications (FR-028–030):** Token lifecycle (register on sign-in, refresh on change, remove on sign-out); foreground messages as native alert; waitlist promotion notification (best-effort, booking stands regardless).
- **Web Platform — AND Digital (FR-031–034):** Tenant provisioning form (name, domain, auth provider, first Company Admin, auto-creates Default group); user allowlist management with mandatory group assignment; tenant suspension (preserves data); permanent tenant removal with immediate hard-delete.
- **Multi-tenancy & White-label (FR-035–039):** Server-enforced tenant data isolation; runtime config loading (single binary); Company Admin configures branding (colours, logo), parking groups/capacity, booking window, member terminology, events banner label; app name is ParkANDPerch (pending marketing).

**Non-Functional Requirements:**

- **GDPR & Privacy (NFR-1):** Data residency in EU (`europe-west1`); user removal triggers personal data + booking record deletion; right to erasure handled manually in v1; tenant offboarding triggers immediate hard-delete; data minimisation (only necessary personal data collected).
- **Security (NFR-2):** Firebase AppCheck on every launch (blocks app on failure); dual auth headers on every API request (Firebase ID token + AppCheck token); tenant isolation enforced server-side (verifiable by security test); RBAC server-side (role cannot be bypassed client-side); parking window validated using server time.
- **Observability (NFR-3):** Tenant-attributed crash reporting (Crashlytics); Firebase Analytics with tenant attribution; user consent toggle on sign-in screen persisting across sessions.
- **Performance (NFR-5):** Booking/cancellation must feel responsive; Who's In updates without user-initiated refresh; concurrent writes must not exceed capacity or corrupt waitlist; graceful offline degradation (no crash, last-known state shown, actions disabled with message).

**Scale & Complexity:**

- Primary domain: Mobile-first full-stack (React Native + Firebase Functions + React web admin)
- Complexity level: High
- Estimated architectural decision areas: ~7 major (auth, Firestore data model, backend logic/jobs, API layer, client state management, white-label theming system, web platform)

### Technical Constraints & Dependencies

- Firebase stack only: Firestore, Auth, Functions (Gen 2, `europe-west1`), FCM, AppCheck, Remote Config, Crashlytics, Analytics
- React Native latest + TypeScript strict mode; no external UI library (custom design system, Atomic Design structure)
- Modular Firestore API exclusively (DatabaseV2 pattern from project-context)
- Redux Toolkit for client state; typed `useAppDispatch`/`useAppSelector` hooks throughout
- Path aliases in `tsconfig.json`, `babel.config.js`, and `jest.config.ts` simultaneously
- `react-native-reanimated/plugin` must be last Babel plugin
- `dayjs` for all date handling; booking dates as UTC midnight ISO strings exclusively
- Firebase Functions deployed in `europe-west1` region; Gen 2 only
- Firestore `in` queries limited to 10 items — batching required for user lookups
- All API calls require both Firebase ID token and AppCheck token headers
- Android emulator uses `10.0.2.2` for localhost; iOS uses `localhost`
- Two environments: development (emulator support) and production
- Node >=20; package manager: yarn; CI/CD: Fastlane (iOS + Android QA distribution)

### Cross-Cutting Concerns Identified

- **Tenant resolution & isolation:** Every data access, API call, and real-time listener must be scoped to the authenticated user's tenant — enforced server-side in Firebase Functions and Firestore Security Rules
- **Server-time dependency:** Parking booking window validation and nightly 9pm job both require authoritative server time; client derives current server time by adding elapsed device time to stored server timestamp offset
- **Dual-header enforcement:** AppCheck + Firebase ID token required on every API call; `getAppCheckToken()` can return `'FAILED_TOKEN'` — must be handled gracefully
- **GDPR deletion cascades:** User removal and tenant removal both trigger deletion of associated records across multiple Firestore collections — must be atomic or at minimum eventually consistent with no orphaned data
- **Real-time listener lifecycle:** All `onSnapshot` calls return unsubscribers; must be called on unmount to prevent memory leaks and stale data
- **Push notification reliability:** Waitlist promotion and nightly reallocation notifications are best-effort — booking stands regardless of notification delivery success
- **Concurrent write correctness:** Capacity limits and waitlist position must be maintained under simultaneous writes (Firestore transactions required for booking and waitlist operations)
- **White-label theming:** Tenant branding (colours, logo, terminology) must be applied at runtime from tenant config — token system from day one; cannot be baked into the binary

## Starter Template Evaluation

### Primary Technology Domain

Dual-platform: React Native mobile app (iOS + Android) + lightweight React web admin.
Two independent starters, one per surface.

### Starter Options Considered

**Mobile — Ignite (Ignite X):** Most popular RN boilerplate (9+ years, actively maintained). However, Ignite X defaults to Expo Router, Expo Prebuild, and MobX-State-Tree — all of which conflict with pre-established decisions (React Navigation v7, Redux Toolkit, bare RN/Fastlane CI). Customising Ignite away from these defaults adds friction without benefit. Ruled out.

**Mobile — `@react-native-community/cli` bare template:** Official community TypeScript template. Minimal, clean, no conflicting opinions. All architectural patterns added deliberately on top. Selected.

**Web — Vite + React + TypeScript:** Standard for lightweight React SPAs in 2026. Fast builds, no SSR complexity. Right-sized for a low-frequency admin tool.

---

### Selected Starter — Mobile: `@react-native-community/cli` TypeScript Template

**Rationale:** The technical stack is already fully specified in `project-context.md`. A minimal starter avoids fighting opinionated boilerplate choices that conflict with pre-established decisions.

**Initialization Command:**

```bash
npx @react-native-community/cli@latest init ParkANDPerch
```

**Architectural Decisions Provided by Starter:**

- **Language:** TypeScript (strict) — configured out of the box
- **Build tooling:** Metro bundler with Babel config scaffold
- **Project structure:** Minimal `src/` scaffold; all Atomic Design structure added in implementation
- **Testing:** Jest + @testing-library/react-native scaffold
- **Platform targets:** iOS and Android native project files generated

**What the team adds on top (per project-context.md):**
- Redux Toolkit store, slices, typed hooks
- React Navigation v7 (native-stack, stack, bottom-tabs)
- `@react-native-firebase/*` packages (modular API)
- Path aliases in `tsconfig.json` + `babel.config.js` + `jest.config.ts`
- Custom design token system (replacing NativeBase)
- Atomic Design directory structure (`atoms/`, `molecules/`, `organisms/`, `screens/`)
- Fastlane lanes for iOS/Android QA distribution
- `react-native-reanimated` (last Babel plugin — enforced)
- `react-native-config` for environment variables

---

### Selected Starter — Web Admin: Vite + React + TypeScript

**Rationale:** Lightweight, no SSR overhead. The web platform is a low-frequency admin tool (AND Digital only) — a full Next.js setup would be disproportionate.

**Initialization Command:**

```bash
npm create vite@latest web -- --template react-ts
```

**Architectural Decisions Provided by Starter:**

- **Language:** TypeScript, Vite-configured
- **Build tooling:** Vite (fast dev server, optimised production builds)
- **Testing:** Vitest (co-located with Vite; replaces Jest on the web side)
- **Project structure:** Minimal `src/` scaffold

**What the team adds on top:**
- Firebase SDK (web/modular) for Auth, Firestore, Functions
- React Router for multi-page navigation (tenant list, tenant detail, provisioning form)
- Visual style aligned to mobile app tokens (colours, Poppins font)

**Note:** Project initialisation for both apps should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Firestore tenancy model (all data access patterns depend on this)
- Tenant ID in Firebase custom claims (all Function and Security Rule patterns depend on this)
- Tenant domain resolution flow (auth entry point)
- Waitlist promotion trigger strategy (booking correctness)
- Nightly reallocation job infrastructure (parking correctness)

**Important Decisions (Shape Architecture):**
- Tenant config storage in Firestore
- Firebase Functions domain-separated structure
- Theme token system (React Context + StyleSheet factory)
- Offline handling approach
- Firebase project count (dev + prod)
- Web admin deployment via Firebase Hosting

**Deferred Decisions (Post-v1):**
- Cross-tenant analytics aggregation strategy
- Self-serve erasure flow (manual handling sufficient for v1)
- Structured support/ticketing model

---

### Data Architecture

**Decision 1.1 — Firestore Tenancy Model: Subcollections per tenant**

All tenant data lives under `tenants/{tenantId}/` subcollections:

```
tenants/{tenantId}/
  bookings/{bookingId}
  users/{userId}
  notes/{noteId}
  config/settings          ← branding, auth provider, booking window, member term, banner label
  config/allowlist         ← permitted email addresses
  groups/{groupId}         ← parking group definitions and per-group capacity
```

**Rationale:** Structural isolation is harder to misconfigure than field-based enforcement. Firestore Security Rules enforce tenant scope via the collection path (`request.auth.token.tenantId == tenantId`). GDPR tenant deletion is a single recursive delete on `tenants/{tenantId}` rather than cross-collection queries.

**User deletion (GDPR):** Delete `tenants/{tenantId}/users/{userId}` and query + delete all `tenants/{tenantId}/bookings` where `userId == deletedUserId`. Executed by a callable Function triggered from the web admin allowlist removal action.

---

**Decision 1.2 — Tenant Config Storage: Firestore document**

Per-tenant configuration (branding colours, logo URL, auth provider, booking window days, member terminology, events banner label) stored in `tenants/{tenantId}/config/settings`. Groups and per-group parking capacity stored in `tenants/{tenantId}/groups/{groupId}`.

**Rationale:** Remote Config is not designed for per-tenant isolation. Firestore provides immediate consistency on Company Admin changes, works in the emulator, and fits naturally within the subcollection tenancy model.

**Client loading:** On sign-in, the app fetches `tenants/{tenantId}/config/settings` once and stores it in Redux (`firebaseRemoteConfig` slice renamed to `tenantConfig`). Theme tokens are derived from this and pushed into `ThemeContext`.

---

### Authentication & Security

**Decision 2.1 — Tenant Domain Resolution: Pre-auth Cloud Function**

A publicly-accessible (but AppCheck-protected) Cloud Function `resolveProvider` accepts an email domain and returns `{ tenantId, provider }`. The client calls this before presenting the auth provider UI.

A top-level `domains/{domain}` collection maps email domains to tenant IDs — readable only by the Function, not directly by clients.

```
domains/
  and.digital → { tenantId: 'abc123', provider: 'google' }
  acme.com    → { tenantId: 'def456', provider: 'microsoft' }
```

**Rationale:** Keeps tenant domain→ID mappings off the client. AppCheck ensures only the genuine app binary can call the endpoint.

---

**Decision 2.2 — Tenant ID in Firebase Custom Claims**

On first verified sign-in (after allowlist check passes), a Function sets `{ tenantId, role }` as custom claims on the user's Firebase Auth token via the Admin SDK.

```ts
await admin.auth().setCustomUserClaims(uid, { tenantId, role: 'user' })
```

All subsequent Function calls and Firestore Security Rules read `request.auth.token.tenantId` — no per-request Firestore lookup required.

**Stale claim window:** Custom claims update on next token refresh (up to 1 hour). Role changes (e.g. granting Company Admin) take effect within 1 hour. Acceptable for v1 — role changes are infrequent and admin-driven.

**Firestore Security Rules pattern:**
```js
match /tenants/{tenantId}/{document=**} {
  allow read, write: if request.auth.token.tenantId == tenantId;
}
```

---

**Decision 2.3 — Allowlist Enforcement: Server-side in Cloud Function**

The `createUser` Function (called on first sign-in if no user document exists) checks `tenants/{tenantId}/config/allowlist` before creating the user record. If the email is not on the list, the Function returns a 403 and the client signs the user out.

Allowlist check is never performed client-side — client-side checks can be bypassed.

---

### API & Communication Patterns

**Decision 3.1 — Firebase Functions Structure: Domain-separated modules**

Functions are organised by domain, each deployed as a Gen 2 Function group:

```
functions/src/
  auth/         → resolveProvider, createUser (checks allowlist + sets claims)
  bookings/     → createBooking, cancelBooking (+ onBookingDeleted trigger)
  parking/      → reallocationJob (scheduled)
  notes/        → createNote, updateNote, deleteNote
  time/         → getLondonTime
  admin/        → provisionTenant, suspendTenant, removeTenant, manageAllowlist
  shared/       → auth middleware, AppCheck enforcement, error types
```

All callable Functions enforce dual-header authentication (Firebase ID token + AppCheck token) via shared middleware. Requests missing either header are rejected with 403.

**API URL pattern:** `${endpointBaseURL}/v1/{resource}` — consistent with existing app.

**Error handling standard:** Functions return structured error responses `{ code, message }`. Client Redux thunks catch errors and dispatch `setShowError(true)` for booking failures; other errors handled contextually.

---

**Decision 3.2 — Waitlist Auto-Promotion: Firestore `onDocumentDeleted` trigger (decoupled)**

Waitlist promotion is triggered by a Firestore `onDocumentDeleted` Function that fires when a booking document is deleted.

**Rationale:** Decoupling cancellation from promotion means a failure in the promotion logic never prevents the user from successfully cancelling their booking. The cancellation always succeeds; promotion is a separate, retriable operation.

**Promotion logic (within the trigger Function):**
1. Read the deleted booking's `{ tenantId, date, spaceType, timeSlot }` from the event data
2. Query `tenants/{tenantId}/bookings` for waitlisted entries matching the date + spaceType, ordered by `createdAt` ascending
3. Apply slot-type matching rules (FR-012): AM cancellation → AM waitlist only; PM → PM only; All Day → All Day, AM, and PM eligible
4. Promote the next eligible entry via Firestore transaction (update `isReserveSpace: false`, decrement remaining waitlist positions)
5. Send FCM push notification to the promoted user (best-effort; booking stands regardless)

**Failure handling:** If the trigger Function fails, Cloud Functions retries automatically (Gen 2 default). Idempotency key: check the candidate booking is still `isReserveSpace: true` before promoting within the transaction.

---

**Decision 3.3 — Nightly Cross-Group Parking Reallocation: Cloud Scheduler → Pub/Sub → Function**

```
Cloud Scheduler (cron: "0 21 * * *", timezone: "Europe/London")
  → publishes to Pub/Sub topic: parking-reallocation
    → triggers Cloud Function (Gen 2): runNightlyReallocation
```

**Function logic:**
1. Fetch all active tenants from Firestore
2. For each tenant, for tomorrow's date:
   - Sum unbooked spaces across all groups
   - Query waitlisted parking bookings for tomorrow, ordered by `createdAt` ascending
   - Allocate pooled spaces to waitlisted users in order (cross-group)
   - Execute allocations via Firestore batch writes
   - Send FCM push notifications to allocated users (best-effort)
3. Log reallocation results with tenant attribution (Crashlytics/Analytics)

**Timezone note:** Cloud Scheduler uses `Europe/London` timezone to correctly handle BST/GMT transitions.

---

**Decision 3.4 — Server Time Endpoint (carried forward)**

`GET /v1/getLondonTime` callable Function returns `{ londonTime: ISO string }`. Client stores it alongside device timestamp; parking window validation derives current London time from stored offset. Pattern unchanged from existing app.

---

### Frontend Architecture

**Decision 4.1 — Theme Token System: React Context + StyleSheet factory**

```ts
// ThemeContext provides resolved token set
const { colors, typography, spacing } = useTheme()

// Components use tokens in StyleSheet
const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  heading: { fontFamily: typography.medium, color: colors.charcoal }
})
```

`ThemeProvider` wraps the app. Before sign-in, a neutral default token set is used. After sign-in, tenant branding (fetched from `tenants/{tenantId}/config/settings`) replaces the defaults.

Token categories: `colors` (brand + UI), `typography` (Poppins Regular/Medium), `spacing`, `radii`. All tokens are tenant-overridable.

**Rationale:** No library dependency; consistent with the "no external UI library" constraint; straightforward for AI agents to implement consistently.

---

**Decision 4.2 — Offline State Handling**

- `@react-native-community/netinfo` monitors connectivity
- Connectivity status stored in Redux `connectivity` slice: `{ isConnected: boolean }`
- Firestore offline persistence enabled by default (`@react-native-firebase/firestore` default) — last-known data served automatically
- Booking/cancellation action dispatches check `connectivity.isConnected` before calling; show inline message if offline
- No crash, no silent failure — NFR-5 satisfied

---

**Decision 4.3 — Web Admin Routing: React Router v7**

Client-side SPA routing with React Router v7 (latest). Routes:
- `/` → Tenant list
- `/tenants/new` → Provisioning form
- `/tenants/:tenantId` → Tenant detail + config
- `/tenants/:tenantId/users` → Allowlist management

No SSR. Firebase Hosting serves the Vite build as a single-page app with a catch-all rewrite rule.

---

### Infrastructure & Deployment

**Decision 5.1 — Firebase Project Count: Two projects (dev + prod)**

| Environment | Firebase Project | Used for |
|-------------|-----------------|----------|
| Development | `parkandperch-dev` | Local dev (emulators), QA builds, testing |
| Production | `parkandperch-prod` | Live app, real tenant data |

`react-native-config` (`.env.development`, `.env.production`) controls which project each build targets. Emulators used locally in dev; dev Firebase project used for QA distribution via Fastlane.

---

**Decision 5.2 — CI/CD: Fastlane + Firebase Hosting**

- **Mobile (iOS + Android):** Fastlane lanes — QA distribution to TestFlight / Firebase App Distribution
- **Web admin:** `vite build` → `firebase deploy --only hosting` (wired into CI or Fastlane)
- **Functions:** `firebase deploy --only functions` — separate deployment step, not bundled with mobile releases

---

### Decision Impact Analysis

**Implementation Sequence (dependencies drive order):**
1. Firebase project setup (dev + prod), emulator configuration
2. Firestore Security Rules and `domains/` collection structure
3. `resolveProvider` Function + `createUser` Function (custom claims + allowlist check)
4. Tenant config schema + `ThemeContext` + token system
5. Redux store shape (with `tenantConfig` slice replacing `firebaseRemoteConfig`)
6. Navigation container + auth flow (email → provider → sign-in → home)
7. Booking screen (calendar, time slots, desk booking CRUD)
8. Parking booking + booking window validation (server time dependency)
9. `onBookingDeleted` trigger + waitlist promotion
10. Notes/events CRUD
11. Push notification token lifecycle + FCM integration
12. Cloud Scheduler + nightly reallocation Function
13. Web admin (tenant provisioning, allowlist management)
14. Tenant suspension + removal (hard-delete cascade)

**Cross-Component Dependencies:**
- Custom claims (`tenantId`, `role`) are read by every Function and every Firestore Security Rule — must be set before any other backend feature is testable
- Tenant config (Firestore) feeds the theme system — must be loaded before any branded UI renders
- Server time offset must be established before parking booking window validation runs
- Waitlist promotion trigger depends on booking cancellation writing the correct Firestore document format
- Nightly reallocation job depends on groups being correctly configured in `tenants/{tenantId}/groups/`

## Implementation Patterns & Consistency Rules

### Critical Conflict Points Identified

10 areas where AI agents could make incompatible choices without explicit rules:
Firestore field naming, Function response shape, auth middleware invocation,
tenant scope in queries, Redux slice/action naming, theme token usage,
test describe structure, component barrel exports, date formatting, and
Function error code vocabulary.

---

### Naming Patterns

**Firestore Field Naming — camelCase throughout**

All Firestore document fields use camelCase to match TypeScript model properties directly:
```ts
// ✅ Correct
{ userId: string, createdAt: Timestamp, isReserveSpace: boolean, timeSlot: 'am' | 'pm' | 'allDay' }

// ❌ Wrong
{ user_id: string, created_at: Timestamp }
```

**Firebase Function Naming — camelCase verb+noun callables; domain-prefixed triggers**

Callable Functions: `resolveProvider`, `createUser`, `createBooking`, `cancelBooking`,
`createNote`, `updateNote`, `deleteNote`, `getLondonTime`, `provisionTenant`,
`suspendTenant`, `removeTenant`, `manageAllowlist`

Triggered Functions: `onBookingDeleted` (Firestore trigger), `runNightlyReallocation`
(Pub/Sub trigger)

**API Endpoint Naming — plural nouns, kebab-case, versioned**

```
POST   /v1/users
POST   /v1/bookings
DELETE /v1/bookings/:bookingId
POST   /v1/notes
PUT    /v1/notes/:noteId
DELETE /v1/notes/:noteId
GET    /v1/london-time
POST   /v1/resolve-provider
POST   /v1/tenants           (web admin only)
PATCH  /v1/tenants/:tenantId
DELETE /v1/tenants/:tenantId
```

**Redux Slice and Action Naming**

Slice names match the store shape keys: `splashScreen`, `tenantConfig`, `featureFlags`,
`user`, `selectedDayOptions`, `note`, `loading`, `error`, `utils`, `connectivity`

Action naming follows RTK convention: `sliceName/actionName`
Thunk naming: `fetchX`, `createX`, `updateX`, `deleteX` (verb prefix required)

```ts
// ✅ Correct
createAsyncThunk('bookings/createBooking', ...)
createAsyncThunk('tenantConfig/fetchTenantConfig', ...)

// ❌ Wrong
createAsyncThunk('getBooking', ...)
createAsyncThunk('booking_create', ...)
```

**Component and File Naming — PascalCase components, camelCase utilities**

```
src/components/atoms/Button/Button.tsx          ✅
src/components/atoms/Button/Button.test.tsx     ✅
src/components/atoms/Button/index.ts            ✅ (barrel export)
src/utils/dateUtils.ts                          ✅
src/utils/bookingUtils.ts                       ✅

src/components/atoms/button.tsx                 ❌
src/components/atoms/ButtonComponent.tsx        ❌
```

**TypeScript Type and Interface Naming — PascalCase, no `I` prefix**

```ts
// ✅
type User = { ... }
type Booking = { ... }
type SpaceType = 'desk' | 'car'
type TimeSlot = 'am' | 'pm' | 'allDay'
type TenantConfig = { ... }

// ❌
interface IUser { ... }
type user_data = { ... }
```

---

### Structure Patterns

**Project Organisation — Mobile**

```
src/
  components/
    atoms/          PascalCase folders, each with Component.tsx + Component.test.tsx + index.ts
    molecules/
    organisms/
  screens/          Screen-level route components; barrel index.ts per screen folder
  navigation/       Navigation containers and stack/tab definitions
  state/            Redux store, slices, selectors, typed hooks
  firebase/         Firebase service layer (auth, firestore, functions, messaging)
  theme/            ThemeContext, ThemeProvider, default tokens, token types
  utils/            Pure utility functions (dateUtils, bookingUtils, chunkQuery, etc.)
  res/              SVG icon components, static images
  customTypes/      Shared TypeScript types (User, Booking, Note, TenantConfig, etc.)
  api/              External API call wrappers (uses endpoints from tenantConfig)
```

Path aliases mirror this structure — must be configured in `tsconfig.json`,
`babel.config.js`, AND `jest.config.ts` simultaneously.

**Project Organisation — Functions**

```
functions/src/
  auth/index.ts
  bookings/index.ts
  parking/index.ts
  notes/index.ts
  time/index.ts
  admin/index.ts
  shared/
    middleware.ts      enforceAuth(), enforceAppCheck(), resolveTenant()
    errors.ts          AppError class, error code constants
    types.ts           shared request/response types
  index.ts             exports all function groups
```

**Test File Location — co-located**

Tests live next to the source file they test, never in a separate `__tests__/` directory:
```
Button/Button.tsx
Button/Button.test.tsx    ✅ (co-located)

__tests__/Button.test.tsx ❌ (separate directory — avoid)
```

**Barrel Exports — required at every Atomic Design layer**

Every `atoms/`, `molecules/`, `organisms/`, `screens/` directory must have an `index.ts`
that re-exports named exports from all components in that layer. Never import directly
from the component file from outside its own folder.

```ts
// ✅ Correct (from outside the folder)
import { Button } from '@atoms'

// ❌ Wrong (bypasses barrel)
import { Button } from '@atoms/Button/Button'
```

---

### Format Patterns

**Function Response Shape — consistent wrapper**

All callable Functions return:
```ts
// Success
{ success: true, data: T }

// Error (thrown as HttpsError)
throw new HttpsError('code', 'Human-readable message')
```

Never return raw data objects without the `{ success, data }` wrapper.
Never return plain JavaScript Error objects — always `HttpsError` with a code from
the Firebase Functions error code vocabulary.

**Firebase HttpsError Code Vocabulary**

| Situation | Code |
|-----------|------|
| Missing/invalid auth token | `'unauthenticated'` |
| AppCheck failure | `'unauthenticated'` |
| Allowlist rejection | `'permission-denied'` |
| Tenant isolation violation | `'permission-denied'` |
| Role insufficient (e.g. non-admin booking guest parking) | `'permission-denied'` |
| Booking at capacity (no waitlist slot) | `'resource-exhausted'` |
| Input validation failure | `'invalid-argument'` |
| Resource not found | `'not-found'` |
| Concurrent write conflict resolved against caller | `'aborted'` |

**Date Formatting — UTC midnight strings for booking dates**

```ts
// ✅ Booking date: always UTC midnight ISO string
'2026-06-16T00:00:00Z'

// Use exclusively:
getTodaysUTCDateMidnightString()
formatToBookingDateUTC(day, false)

// ❌ Never use for booking dates:
dayjs().toISOString()        // includes time component
new Date().toISOString()     // includes time component
```

API responses that include booking dates return the same UTC midnight string format.
Firestore Timestamps on `createdAt`/`updatedAt` fields are stored as server timestamps
and read back as `.seconds` numbers on the Booking model.

**JSON Field Naming in Function Responses — camelCase**

```ts
// ✅
{ tenantId: 'abc', createdAt: 1234567890, isReserveSpace: false }

// ❌
{ tenant_id: 'abc', created_at: 1234567890, is_reserve_space: false }
```

---

### Communication Patterns

**Theme Token Usage — always via `useTheme()`, never hardcoded hex**

```ts
// ✅
const { colors } = useTheme()
const styles = StyleSheet.create({ container: { backgroundColor: colors.background } })

// ❌ — hardcoded hex bypasses tenant theming
const styles = StyleSheet.create({ container: { backgroundColor: '#f6f6f6' } })
```

Default tokens (pre-sign-in) use the brand palette from `project-context.md`.
After sign-in, `ThemeProvider` replaces them with values from `tenantConfig`.

**Tenant Scope in Firestore Queries — always use tenantId from custom claims**

Functions access tenantId exclusively from the verified Firebase Auth token custom
claim — never from the request body or query parameters:

```ts
// ✅
const tenantId = context.auth?.token.tenantId
const ref = db.collection(`tenants/${tenantId}/bookings`)

// ❌ — never trust client-supplied tenantId
const tenantId = request.data.tenantId
```

**Real-time Listener Pattern — always unsubscribe in useEffect cleanup**

```ts
// ✅
useEffect(() => {
  const unsubscribe = firestore()
    .collection(`tenants/${tenantId}/bookings`)
    .where('date', '==', selectedDate)
    .onSnapshot(snapshot => { ... })
  return unsubscribe          // cleanup on unmount
}, [selectedDate])

// ❌ — listener without cleanup causes memory leak and stale data
useEffect(() => {
  firestore().collection(...).onSnapshot(...)
  // no cleanup
}, [])
```

**Redux Async Thunks — use `createAsyncThunk` + typed `AppStore`**

```ts
// ✅
export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (payload: CreateBookingPayload, thunkAPI) => {
    const state = thunkAPI.getState() as AppStore
    const { tenantConfig } = state
    ...
  }
)

// ❌ — raw fetch without thunk
const createBooking = async () => { await fetch(...) }
```

**Dual-Header Auth Attachment — always use the shared utility**

```ts
// ✅ — shared utility in src/firebase/functions/authHeaders.ts
const headers = await getAuthHeaders()   // { Authorization, Firebase-AppCheck }
await fetch(`${endpoint}/v1/bookings`, { method: 'POST', headers, body: ... })

// ❌ — inline header construction (easy to miss AppCheck)
const token = await auth().currentUser?.getIdToken()
await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
```

---

### Process Patterns

**Error Handling — global overlay for booking failures, contextual for others**

- Booking/cancellation failures: dispatch `setShowError(true)` → global error overlay
- Auth errors: handle inline on the auth screen (sign-out + show message)
- Network errors: check `connectivity.isConnected` before action; inline message if offline
- Function `HttpsError` with code `'permission-denied'`: sign the user out (session invalid)

Never let an unhandled rejection propagate to a bare console error in production code.

**Loading State — global for booking operations, local for list fetches**

- Global `loading.isLoading = true` for booking creation/cancellation (blocks full UI)
- Local component state for non-critical fetches (e.g. notes loading)
- Never use global loading for Firestore real-time listeners (they update in-place)

**AppCheck Token Retrieval — handle `'FAILED_TOKEN'` gracefully**

```ts
// ✅
const appCheckToken = await firebase.appCheck().getToken()
if (!appCheckToken.token || appCheckToken.token === 'FAILED_TOKEN') {
  // show AppCheck failure alert, block navigation
  return
}
```

**Test Describe Structure — mandatory nesting format**

```ts
describe('When <Component/function> is <context>', () => {
  describe('and <condition>', () => {
    it('should <expected behaviour>', () => { ... })
  })
})
```

Never write top-level `it()` without a wrapping `describe`.

---

### Enforcement Guidelines

**All AI Agents MUST:**

- Use `useTheme()` for all colour/typography values — never hardcode hex or font names
- Source `tenantId` from Firebase Auth custom claims only — never from request body
- Return `HttpsError` (never plain Error) from all callable Functions
- Attach both Firebase ID token and AppCheck token on every API request via shared utility
- Unsubscribe all Firestore `onSnapshot` listeners in `useEffect` cleanup returns
- Use UTC midnight ISO strings for all booking date values — never `dayjs().toISOString()`
- Co-locate test files with source — never use a separate `__tests__/` directory
- Export components through their layer barrel (`@atoms`, `@molecules`, etc.)
- Wrap Firebase async operations in `createAsyncThunk`, not raw async functions in components
- Configure path aliases in `tsconfig.json`, `babel.config.js`, AND `jest.config.ts` — all three

**Anti-Patterns (never do these):**

```ts
❌ const styles = StyleSheet.create({ color: '#ff323c' })        // hardcoded token
❌ const tenantId = req.body.tenantId                            // client-supplied tenant
❌ throw new Error('something failed')                           // bare Error in Functions
❌ await fetch(url, { headers: { Authorization: `Bearer ${t}` }}) // missing AppCheck
❌ useEffect(() => { db.onSnapshot(...) }, [])                   // no cleanup
❌ dayjs().toISOString()                                         // wrong date format
❌ import { Button } from '@atoms/Button/Button'                 // bypasses barrel
```

## Project Structure & Boundaries

### Complete Project Directory Structure

```
ParkANDPerch/                               ← repo root = React Native mobile app
├── android/                                ← Android native project (generated)
├── ios/                                    ← iOS native project (generated)
│
├── src/
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Text/
│   │   │   ├── Input/
│   │   │   ├── Icon/                       ← wrapper for SVG icon components
│   │   │   ├── Spinner/
│   │   │   ├── Badge/                      ← count badges (Who's In header)
│   │   │   └── index.ts                    ← barrel export
│   │   ├── molecules/
│   │   │   ├── TimeSlotTile/               ← AM / PM / All Day tile (FR-009, FR-015)
│   │   │   ├── BookingRow/                 ← Who's In list row (FR-025)
│   │   │   ├── WeekCalendar/               ← horizontal week view (FR-007)
│   │   │   ├── SpaceTypeToggle/            ← Desk / Parking segmented control (FR-008)
│   │   │   ├── EventsBanner/               ← tappable daily note banner (FR-020)
│   │   │   ├── UserBookingCard/            ← profile pic + name + Book button (FR-010)
│   │   │   └── index.ts
│   │   ├── organisms/
│   │   │   ├── DeskBookingSection/         ← time slots + personal + guest booking (FR-009–014)
│   │   │   ├── ParkingBookingSection/      ← parking slots + window logic (FR-015–019)
│   │   │   ├── WhoIsInList/                ← live booking list + header (FR-024–027)
│   │   │   ├── EventModal/                 ← note create/edit sheet (FR-021–022)
│   │   │   ├── LoadingOverlay/             ← global loading blocker
│   │   │   ├── ErrorOverlay/               ← global error banner
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── screens/
│   │   ├── LoginScreen/
│   │   │   ├── LoginScreen.tsx             ← email entry, provider resolution (FR-001–003)
│   │   │   ├── LoginScreen.test.tsx
│   │   │   └── index.ts
│   │   ├── BookingScreen/
│   │   │   ├── BookingScreen.tsx           ← main booking screen (FR-007–027)
│   │   │   ├── BookingScreen.test.tsx
│   │   │   └── index.ts
│   │   ├── MyBookingsScreen/               ← placeholder (v1 out of scope)
│   │   └── index.ts
│   │
│   ├── navigation/
│   │   ├── AppContainer.tsx                ← NavigationContainer > ErrorContainer > LoadingContainer
│   │   ├── AuthContainer.tsx               ← routes to LoginScreen if unauthenticated (FR-005)
│   │   ├── HomeContainer.tsx               ← Stack/Tab navigator; FCM token on mount (FR-006, FR-028)
│   │   ├── types.ts                        ← RootStackParamList, TabParamList
│   │   └── index.ts
│   │
│   ├── state/
│   │   ├── store.ts                        ← configureStore, AppStore type
│   │   ├── hooks.ts                        ← useAppDispatch, useAppSelector
│   │   ├── slices/
│   │   │   ├── splashScreen.slice.ts       ← hideSplashScreen, screensLoaded, remoteConfigFound
│   │   │   ├── tenantConfig.slice.ts       ← branding, capacity, bookingWindow, featureFlags
│   │   │   ├── featureFlags.slice.ts       ← tabBarEnabled
│   │   │   ├── user.slice.ts               ← user, activeBookingDates
│   │   │   ├── selectedDayOptions.slice.ts ← selectedDay, selectedSpaceType
│   │   │   ├── note.slice.ts               ← notes[]
│   │   │   ├── loading.slice.ts            ← isLoading
│   │   │   ├── error.slice.ts              ← showError
│   │   │   ├── utils.slice.ts              ← londonServerTimestamp, storedDeviceTimestamp
│   │   │   └── connectivity.slice.ts       ← isConnected (NFR-5)
│   │   ├── thunks/
│   │   │   ├── auth.thunks.ts              ← signIn, signOut, resolveProvider
│   │   │   ├── booking.thunks.ts           ← createBooking, cancelBooking, fetchActiveBookingDates
│   │   │   ├── note.thunks.ts              ← fetchNotes, createNote, updateNote, deleteNote
│   │   │   ├── tenantConfig.thunks.ts      ← fetchTenantConfig (on sign-in)
│   │   │   └── utils.thunks.ts             ← fetchLondonTime
│   │   └── index.ts
│   │
│   ├── firebase/
│   │   ├── auth/
│   │   │   ├── authService.ts              ← Google/Microsoft/Apple sign-in, signOut, token
│   │   │   └── index.ts
│   │   ├── firestore/
│   │   │   ├── bookingService.ts           ← onSnapshot listener, fetch active dates
│   │   │   ├── noteService.ts              ← one-time fetch by date
│   │   │   ├── userService.ts              ← batched user lookups (chunkQuery), ReducedUserData cache
│   │   │   ├── tenantConfigService.ts      ← fetch tenants/{tenantId}/config/settings
│   │   │   ├── firestoreUtils.ts           ← getServerTimestamp(), chunkQuery()
│   │   │   └── index.ts
│   │   ├── functions/
│   │   │   ├── authHeaders.ts              ← getAuthHeaders() — Firebase ID token + AppCheck token
│   │   │   ├── bookingFunctions.ts         ← createBooking(), cancelBooking() callable wrappers
│   │   │   ├── noteFunctions.ts            ← createNote(), updateNote(), deleteNote()
│   │   │   ├── authFunctions.ts            ← resolveProvider(), createUser()
│   │   │   ├── timeFunctions.ts            ← getLondonTime()
│   │   │   └── index.ts
│   │   ├── messaging/
│   │   │   ├── messagingService.ts         ← token register/refresh/delete, foreground handler (FR-028–029)
│   │   │   └── index.ts
│   │   ├── appCheck/
│   │   │   ├── appCheckService.ts          ← getToken(), FAILED_TOKEN handling (NFR-2)
│   │   │   └── index.ts
│   │   └── firebaseConfig.ts               ← init Firebase, emulator switching via .env
│   │
│   ├── theme/
│   │   ├── ThemeContext.tsx                ← ThemeTokens context + useTheme() hook
│   │   ├── ThemeProvider.tsx               ← wraps app; loads tenant branding post-sign-in (FR-036–037)
│   │   ├── defaultTokens.ts                ← brand palette (charcoal, red, orange... from project-context)
│   │   ├── types.ts                        ← ThemeTokens interface
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── dateUtils.ts                    ← getTodaysUTCDateMidnightString(), formatToBookingDateUTC()
│   │   ├── bookingUtils.ts                 ← isValidParkingDate(), isCloseToBookingDate() (FR-017)
│   │   ├── chunkQuery.ts                   ← splits userId arrays into ≤10 for Firestore in queries
│   │   ├── serverTimeUtils.ts              ← derives current London time from stored offset
│   │   └── index.ts
│   │
│   ├── customTypes/
│   │   ├── User.ts
│   │   ├── Booking.ts
│   │   ├── Note.ts
│   │   ├── TenantConfig.ts
│   │   ├── Group.ts
│   │   ├── ReducedUserData.ts
│   │   ├── enums.ts                        ← SpaceType, TimeSlot, Role, BookingType, AuthProvider
│   │   └── index.ts
│   │
│   ├── res/
│   │   └── images/
│   │       ├── DeskIcon.tsx
│   │       ├── ParkingIcon.tsx
│   │       ├── LogoPlaceholder.tsx         ← replaced at runtime with tenant logo
│   │       └── index.ts
│   │
│   └── api/
│       └── index.ts                        ← re-exports from firebase/functions (alias compatibility)
│
├── functions/                              ← Firebase Cloud Functions (Gen 2, europe-west1)
│   ├── src/
│   │   ├── auth/
│   │   │   └── index.ts                   ← resolveProvider (pre-auth), createUser (allowlist + claims)
│   │   ├── bookings/
│   │   │   └── index.ts                   ← createBooking, cancelBooking, onBookingDeleted (waitlist trigger)
│   │   ├── parking/
│   │   │   └── index.ts                   ← runNightlyReallocation (Pub/Sub, 21:00 Europe/London)
│   │   ├── notes/
│   │   │   └── index.ts                   ← createNote, updateNote, deleteNote
│   │   ├── time/
│   │   │   └── index.ts                   ← getLondonTime
│   │   ├── admin/
│   │   │   └── index.ts                   ← provisionTenant, suspendTenant, removeTenant, manageAllowlist
│   │   ├── shared/
│   │   │   ├── middleware.ts              ← enforceAuth(), enforceAppCheck(), resolveTenant()
│   │   │   ├── errors.ts                  ← HttpsError wrappers, error code constants
│   │   │   └── types.ts                   ← shared request/response types, FunctionContext
│   │   └── index.ts                       ← exports all function groups
│   ├── package.json
│   └── tsconfig.json
│
├── web/                                    ← React web admin (Vite + React + TypeScript)
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx                         ← React Router v7 routes
│   │   ├── pages/
│   │   │   ├── TenantListPage.tsx          ← / — tenant list (FR-031)
│   │   │   ├── NewTenantPage.tsx           ← /tenants/new — provisioning form (FR-031)
│   │   │   ├── TenantDetailPage.tsx        ← /tenants/:id — config + branding (FR-037–038)
│   │   │   └── AllowlistPage.tsx           ← /tenants/:id/users — allowlist management (FR-032)
│   │   ├── components/
│   │   │   ├── TenantCard/                 ← tenant summary + suspend/remove actions (FR-033–034)
│   │   │   ├── TenantProvisionForm/        ← name, domain, auth provider, first admin (FR-031)
│   │   │   ├── AllowlistTable/             ← add/remove emails, group assignment (FR-032)
│   │   │   ├── GroupCapacityForm/          ← parking group CRUD + capacity (FR-038)
│   │   │   └── BrandingForm/               ← colours + logo URL (FR-037)
│   │   ├── firebase/
│   │   │   ├── firebaseConfig.ts           ← init Firebase web SDK
│   │   │   ├── authService.ts              ← AND Digital admin sign-in
│   │   │   └── tenantService.ts            ← callable wrappers for admin Functions
│   │   └── types/
│   │       └── index.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── fastlane/
│   ├── Fastfile                            ← iOS + Android QA distribution lanes
│   ├── Appfile
│   └── Matchfile
│
├── firebase.json                           ← Hosting (web/) + Functions config
├── .firebaserc                             ← dev=parkandperch-dev, prod=parkandperch-prod
├── firestore.rules                         ← tenant-scoped Security Rules
├── firestore.indexes.json
├── .env.development                        ← dev Firebase keys + REACT_APP_USE_EMULATORS=true
├── .env.production                         ← prod Firebase keys
├── .env.example
├── package.json
├── tsconfig.json                           ← path aliases (must match babel + jest)
├── babel.config.js                         ← path aliases + reanimated plugin (last)
├── jest.config.ts                          ← path aliases + setup-jest.ts
├── metro.config.js
├── react-native.config.js
├── setup-jest.ts                           ← global Firebase mocks
└── .gitignore
```

---

### Architectural Boundaries

**API Boundaries**

| Boundary | Caller | Server | Auth |
|----------|--------|--------|------|
| Mobile → Functions | RN app | Cloud Functions | Firebase ID token + AppCheck token |
| Web admin → Functions | Web SPA | Functions (`/admin/*`) | Firebase ID token + AppCheck token |
| Functions → Firestore | Functions | Firestore (Admin SDK) | Firebase Admin SDK |
| Mobile → Firestore (real-time) | RN app listeners | Firestore | Firebase Auth + Security Rules |
| Cloud Scheduler → Pub/Sub → Function | GCP Scheduler | `runNightlyReallocation` | GCP service account |

All mobile-to-Function calls go through `src/firebase/functions/authHeaders.ts` — the single source of dual-header attachment.

**Component Boundaries**

- `screens/` orchestrate `organisms/` — screens hold no UI primitives directly
- `organisms/` compose `molecules/` and `atoms/` — and may hold local state
- `molecules/` and `atoms/` are stateless where possible; receive props only
- `state/thunks/` is the only layer that calls `firebase/functions/` or `firebase/firestore/`
- Components never call Firebase directly — always via Redux thunks or dedicated service modules

**Data Boundaries**

- Firestore Security Rules enforce all tenant boundaries at the database level
- The `domains/` collection is readable only by the `resolveProvider` Function — never by mobile clients
- `tenants/{tenantId}/config/allowlist` is readable only by Functions — never by mobile clients
- Custom claims (`tenantId`, `role`) are the single source of truth for tenant/role in Functions and Security Rules

---

### Requirements to Structure Mapping

| FR Category | Mobile | Functions | Web |
|-------------|--------|-----------|-----|
| Auth (FR-001–006) | `screens/LoginScreen`, `firebase/auth`, `navigation/AuthContainer` | `auth/` | — |
| Desk Booking (FR-007–014) | `screens/BookingScreen`, `organisms/DeskBookingSection`, `molecules/TimeSlotTile` | `bookings/` | — |
| Parking Booking (FR-015–019, FR-040) | `organisms/ParkingBookingSection`, `utils/bookingUtils` | `bookings/`, `parking/` | — |
| Events/Notes (FR-020–022) | `organisms/EventModal`, `molecules/EventsBanner`, `state/slices/note.slice` | `notes/` | — |
| Who's In (FR-024–027) | `organisms/WhoIsInList`, `molecules/BookingRow`, `firebase/firestore/userService` | — | — |
| Push Notifications (FR-028–030) | `firebase/messaging/messagingService`, `navigation/HomeContainer` | `bookings/` (waitlist), `parking/` (realloc) | — |
| Web Platform (FR-031–034) | — | `admin/` | `pages/`, `components/` |
| Multi-tenancy/Theming (FR-035–039) | `theme/`, `firebase/firestore/tenantConfigService`, `state/slices/tenantConfig.slice` | All (custom claims) | `components/BrandingForm`, `components/GroupCapacityForm` |

**Cross-Cutting Concerns Mapped**

| Concern | Location |
|---------|----------|
| AppCheck enforcement | `src/firebase/appCheck/appCheckService.ts` + `functions/src/shared/middleware.ts` |
| Dual-header attachment | `src/firebase/functions/authHeaders.ts` |
| Tenant isolation | `firestore.rules` + `functions/src/shared/middleware.ts` |
| Server time | `functions/src/time/` + `src/utils/serverTimeUtils.ts` + `state/slices/utils.slice.ts` |
| GDPR user deletion | `functions/src/admin/index.ts` (manageAllowlist triggers deletion cascade) |
| GDPR tenant deletion | `functions/src/admin/index.ts` (removeTenant triggers recursive delete) |
| Offline detection | `src/state/slices/connectivity.slice.ts` + `@react-native-community/netinfo` |
| UTC date formatting | `src/utils/dateUtils.ts` |
| Firestore in-query batching | `src/utils/chunkQuery.ts` + `src/firebase/firestore/userService.ts` |

---

### Integration Points

**Data Flow — Booking Creation**
```
User taps "Book"
  → component dispatches createBooking thunk
  → thunk calls getAuthHeaders() → attaches ID token + AppCheck token
  → POST /v1/bookings (Functions: createBooking)
  → Function: enforceAuth() + enforceAppCheck() + resolveTenant() from custom claims
  → Firestore transaction — check capacity, write booking or set isReserveSpace:true
  → Returns { success: true, data: Booking }
  → Real-time Firestore listener on BookingScreen detects new document → WhoIsInList updates live
```

**Data Flow — Cancellation + Waitlist Promotion (decoupled)**
```
User taps "Cancel"
  → cancelBooking thunk → DELETE /v1/bookings/:id
  → Function deletes Firestore document → returns success immediately
  → Firestore onBookingDeleted trigger fires (separate, async)
  → Reads deleted booking metadata, queries next eligible waitlist entry
  → Firestore transaction: promotes entry, decrements positions
  → FCM push notification sent (best-effort)
```

**Data Flow — Nightly Reallocation**
```
Cloud Scheduler (21:00 Europe/London)
  → Pub/Sub: parking-reallocation
  → runNightlyReallocation Function
  → Iterates tenants → pools unused group spaces → allocates to cross-group waitlist
  → Firestore batch writes → FCM push notifications (best-effort)
```

**External Integrations**

| Service | Purpose | Location |
|---------|---------|----------|
| `@react-native-google-signin/google-signin` | Google auth provider | `src/firebase/auth/authService.ts` |
| Firebase OIDC Microsoft provider + `signInWithCredential` | Microsoft auth provider (no MSAL) | `src/firebase/auth/authService.ts` |
| `@invertase/react-native-apple-authentication` | Apple auth provider | `src/firebase/auth/authService.ts` |
| Firebase AppCheck | App integrity on every launch | `src/firebase/appCheck/appCheckService.ts` |
| Firebase FCM | Push notifications | `src/firebase/messaging/messagingService.ts` |
| `@react-native-community/netinfo` | Offline detection | `src/state/slices/connectivity.slice.ts` |
| `react-native-bootsplash` | Splash screen management | `src/navigation/AppContainer.tsx` |
| `react-native-uuid` | Client-side UUID for Note documents | `src/firebase/firestore/noteService.ts` |

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:** All technology choices are internally compatible.
`@react-native-firebase` (modular), Redux Toolkit, React Navigation v7, and the bare
RN community template form a well-established combination. Firebase Gen 2 Functions +
Cloud Scheduler + Pub/Sub is the canonical GCP pattern for scheduled jobs. Vite +
React Router v7 is right-sized for the lightweight web admin.

**Pattern Consistency:** Naming conventions are internally consistent across Firestore
fields (camelCase), components (PascalCase), and utilities (camelCase). The Function
response wrapper, HttpsError code vocabulary, dual-header utility, and `useTheme()`
enforcement are consistently applied across all sections with no contradictions.

**Structure Alignment:** The directory tree maps directly onto the Atomic Design
hierarchy, the Firestore subcollection tenancy model, and the domain-separated
Functions structure. All architectural boundaries have corresponding file locations.

---

### Requirements Coverage Validation ✅

**Functional Requirements:** 40/40 FRs covered.
All 8 FR categories have explicit architectural support: dedicated files, Functions,
Redux slices, and component locations are defined for every requirement.

**Non-Functional Requirements:** 5/5 NFRs covered.
- NFR-1 (GDPR): `europe-west1` data residency; deletion cascades in `admin/` Functions
- NFR-2 (Security): AppCheck on launch; dual-headers on all API calls; custom claims enforce tenant isolation in Functions and Security Rules; RBAC server-side
- NFR-3 (Observability): Crashlytics + Analytics with tenant attribution; user consent toggle on `LoginScreen`
- NFR-4 (Support): Manual v1 — no architecture required
- NFR-5 (Performance): NetInfo + `connectivity` slice for offline graceful degradation; Firestore offline persistence (default on); Firestore transactions for concurrent booking correctness

---

### Implementation Readiness Validation ✅

**Decision Completeness:** All 12 critical architectural decisions are documented with
rationale. Technology stack is fully specified. Integration patterns (data flows,
trigger chains, auth middleware) are defined with code examples.

**Structure Completeness:** Complete directory tree defined for all three surfaces
(mobile, functions, web). Every FR maps to a specific file or directory. All
integration points, data boundaries, and communication patterns are specified.

**Pattern Completeness:** 10 conflict points addressed with concrete patterns and
anti-pattern examples. Naming, structure, format, communication, and process patterns
are all defined. Critical enforcement rules are enumerated with code examples.

---

### Gap Analysis Results

**Critical Gaps:** None.

**Important Gap — Microsoft auth implementation approach (resolved):**

Use Firebase's built-in Microsoft/OIDC provider + `signInWithCredential` (no separate
native MSAL library). This keeps auth code consistent — all three providers (Google,
Microsoft, Apple) are handled through Firebase Auth. MSAL is unnecessary because
elevated Microsoft Graph scopes were dropped (addendum A-001).

```ts
// Microsoft sign-in pattern in authService.ts
import { OAuthProvider } from '@react-native-firebase/auth'
const provider = new OAuthProvider('microsoft.com')
const credential = provider.credential({ idToken, accessToken })
await auth().signInWithCredential(credential)
```

**Nice-to-Have — Composite Firestore indexes:**

The following composite indexes are needed in `firestore.indexes.json`:
- `tenants/{tenantId}/bookings`: composite on `date` (ASC) + `userId` (ASC) — for fetching active booking dates per user
- `tenants/{tenantId}/bookings`: composite on `date` (ASC) + `spaceType` (ASC) + `isReserveSpace` (ASC) + `createdAt` (ASC) — for waitlist ordering within a slot and date

---

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

---

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — all 40 FRs and all 5 NFRs have explicit architectural
support; no critical gaps remain; Microsoft auth approach resolved above.

**Key Strengths:**
- Subcollection tenancy model makes tenant isolation structural — harder to misconfigure than field-based approaches
- Custom claims eliminate per-request Firestore lookups in all Functions
- Decoupled waitlist promotion (Firestore trigger) means cancellation always succeeds regardless of downstream promotion logic
- Single `getAuthHeaders()` utility as the chokepoint for dual-header enforcement
- `useTheme()` as the sole colour/typography source ensures white-label correctness
- All critical date formatting rules consolidated in `dateUtils.ts`

**Areas for Future Enhancement:**
- Microsoft MSAL if advanced Graph API access is ever needed
- Firestore Security Rules refinement as tenant count grows
- Structured support/ticketing model (NFR-4, deferred post-v1)
- Self-serve GDPR erasure flow (currently manual)
- Building Admin parking occupancy view (out of scope v1)
- Analytics dashboards and data export for Company Admins

---

### Implementation Handoff

**AI Agent Guidelines:**
- Read `project-context.md` in full before implementing any code in this project
- Follow all architectural decisions exactly as documented in this file
- Use implementation patterns consistently — refer to the Anti-Patterns list before writing any code
- Respect project structure and boundaries — components never call Firebase directly
- Refer to this document for all architectural questions; defer to it over general conventions

**First Implementation Priority:**

1. Initialise the repo with both starters:
   ```bash
   npx @react-native-community/cli@latest init ParkANDPerch
   mkdir web && cd web && npm create vite@latest . -- --template react-ts
   ```
2. Set up Firebase projects (dev + prod), emulator config, `.firebaserc`
3. Configure path aliases (`tsconfig.json`, `babel.config.js`, `jest.config.ts`)
4. Scaffold `firestore.rules` with tenant-scoped Security Rules
5. Implement `functions/src/shared/middleware.ts` — auth + AppCheck enforcement used by every Function
