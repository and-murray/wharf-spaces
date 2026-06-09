---
project_name: 'wharf-spaces'
user_name: 'Ashley'
date: '2026-06-08'
sections_completed:
  - technology_stack
  - language_rules
  - component_architecture
  - state_management
  - firebase_data_models
  - testing_rules
  - feature_inventory
  - critical_rules
status: 'complete'
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Current app (reference only — new repo will upgrade all packages to latest)
- React Native 0.77.3 → **upgrade to latest stable**
- TypeScript 5.0.4 → **upgrade to latest**
- React 18.3.1 → **upgrade to latest**
- UI: NativeBase 3.4.28 → **REPLACING with plain React Native components + custom design system**
  - No external UI library dependency in the rebuild
  - All UI primitives to be built in-house using StyleSheet / View / Text / Pressable etc.
  - Enables clean white-labelling via a theme/token layer
- State: Redux Toolkit 1.9.7, React Redux 8.1.3 → **upgrade to latest**
- Navigation: React Navigation v7 (native-stack, stack, bottom-tabs) → **upgrade to latest**
- Firebase SDK 22.4.0 → **upgrade to latest**
  - Firestore, Auth (Google Sign-In), Functions, Remote Config,
    Analytics, Messaging, Crashlytics, AppCheck
- Date handling: dayjs 1.11.13 → **upgrade to latest**
- Testing: Jest + @testing-library/react-native + ts-jest → **upgrade to latest**
- Environment config: react-native-config → **upgrade to latest**
- CI/CD: Fastlane (iOS + Android QA distribution lanes)
- Node: >=20 required
- Package manager: yarn

### Key architecture notes for rebuild
- Firebase Functions deployed in `europe-west1` region, Gen 2 only (Gen 1 removed)
- Two environments: development (emulators supported) and production
- Android emulator uses 10.0.2.2 for localhost; iOS uses localhost
- Design system should be token-based to support white-label theming per tenant

## Critical Implementation Rules

### Language & TypeScript Rules

- Strict TypeScript throughout — `noImplicitReturns`, `noUnusedLocals`, `noUnusedParameters` all enforced
- Path aliases are used extensively and **must be mirrored in three places simultaneously**:
  `tsconfig.json`, `babel.config.js`, AND `jest.config.ts` — missing any one breaks a different context
- Alias reference guide (carry these forward in the rebuild):
  - `@firebase/*` → Firebase service layer
  - `@navigation/*` → navigation config
  - `@atoms/*`, `@molecules/*`, `@organisms/*` → Atomic Design component layers
  - `@screens/*` → screen-level components
  - `@state/*` → Redux store, slices, selectors
  - `@customTypes/*` → shared TypeScript types
  - `@res/*` → static resources (images, icons as SVG components)
  - `@api/*` → external API calls
  - `@utils/*` → utility functions
  - `@components/*` → entire components tree
- After adding/changing a path alias, reset the Metro cache: `react-native start --reset-cache`
- All SVG icons are React components (not image files) — co-located in `src/res/images/`
- `react-native-reanimated/plugin` must always be the **last plugin** in `babel.config.js`
- Use `dayjs` for all date handling — not `moment`, not `date-fns`
- Firestore timestamps on models use the union type:
  `FirebaseFirestoreTypes.Timestamp | FirebaseFirestoreTypes.FieldValue`
  (write via `FieldValue.serverTimestamp()`, read as `Timestamp`)

### Component Architecture & UI Rules

**Structure — Atomic Design (carry forward into rebuild):**
- `atoms/` — smallest reusable primitives (Button, Text, Input, Icon wrappers, etc.)
- `molecules/` — composed atoms with a single responsibility
- `organisms/` — complex, self-contained UI sections (may hold local state)
- `screens/` — route-level components; orchestrate organisms, connect to Redux
- Each component lives in its own folder: `ComponentName/ComponentName.tsx` + `ComponentName.test.tsx`
- Each layer has a barrel `index.ts` for named exports — always export through the barrel

**Design tokens (from current NativeBase theme — preserve in rebuilt token system):**
- Font: Poppins only — Regular (400) and Medium (500)
- Brand colours:
  - red `#ff323c`, orange `#ff7900`, yellow `#ffc800`, green `#5ac328`,
    blue `#2897ff`, purple `#a050ff`, charcoal `#323232`, white `#ffffff`
- UI colours:
  - lightGrey `#f6f6f6`, greyMid `#757575`, greyDark `#434343`,
    primaryRed `#d82036`, darkRed `#ef4444`, grey `#ECECEC`,
    greenAccent `#43A813`, greenAccentTransparent `#43A8131a`,
    blackTransparent `#0000003a`, redTransparent `#FF323C08`,
    blueTransparent `#1F73C20D`, orangeTransparent `#ff79000D`
- In the rebuild, these tokens must be tenant-overridable (white-label support)

**Navigation structure (carry forward):**
```
AppContainer (NavigationContainer)
  └── ErrorContainer
        └── LoadingContainer
              └── AuthContainer          ← shows LoginScreen if unauthenticated
                    └── HomeContainer    ← Stack or Tab navigator (feature-flagged)
```
- On startup: App Check integrity verified first; if invalid, block with alert + retry
- Splash screen (react-native-bootsplash) hidden when Redux `splashScreen.hideSplashScreen` = true
- FCM push token requested and saved to Firestore after permission granted on HomeContainer mount
- Tab bar navigation is feature-flagged via `featureFlags.tabBarEnabled`

**Rebuild UI rules:**
- No external UI library — all components built with `View`, `Text`, `Pressable`, `StyleSheet`
- Use `testID` props on all interactive and key elements (required for tests)
- All icons remain SVG React components (not image files)
- Theming must be implemented as a token/context system from day one to support white-labelling

### State Management Rules

**Redux store shape:**
```
store
├── splashScreen         — hideSplashScreen, remoteConfigFound, screensLoaded
├── firebaseRemoteConfig — deskCapacity, parkingCapacity, isDemoLoginEnabled,
│                          featureFlags, endpoints
├── featureFlags         — tabBarEnabled (populated from remoteConfig on fetch)
├── user                 — user (User | undefined), activeBookingDates: string[]
├── selectedDayOptions   — selectedDay (UTC date string), selectedSpaceType (SpaceType)
├── note                 — notes: Note[]
├── loading              — isLoading: boolean
├── error                — showError: boolean
└── utils                — londonServerTimestamp, storedDeviceTimestamp
```

**Typed hooks — always use these, never raw `useDispatch`/`useSelector`:**
- `useAppDispatch()` → typed dispatch
- `useAppSelector(state => ...)` → typed selector

**Splash screen gate logic (both conditions must be true before hiding):**
- `screensLoaded` — set true once navigation renders
- `remoteConfigFound` — set true once `fetchRemoteConfig` thunk fulfills
- Splash hides only when both are true

**Remote Config keys (Firebase Remote Config):**
- `deskCapacity` — number, default 36
- `parkingCapacity` — JSON object keyed by BusinessUnit: `{ murray, tenzing, adams, unknown }`
- `isDemoLoginEnabled` — boolean, default false
- `endpoints` — JSON object: `{ carAPIURL, deskAPIURL, genericAPIURL }`
- `featureFlags` — JSON object: `{ tabBarEnabled }`
- Endpoints are fetched from Remote Config at runtime; emulator URLs override in dev mode
- `REMOTE_CONFIG_FETCH_DEBUG=true` in `.env` sets minimumFetchIntervalMillis to 30s

**London server time pattern:**
- `fetchLondonTime` thunk fetched on app foreground and initial load
- Stored alongside device timestamp so offset can be calculated
- Used to prevent time-manipulation exploits on booking logic

**Async thunks pattern:**
- All Firebase async operations use `createAsyncThunk`
- Thunks access other state slices via `thunkAPI.getState()` — cast to full `AppStore` type
- Error slice (`setShowError`) triggered on booking failures

### Firebase & Data Model Rules

**Firestore collections** (via `CollectionName` enum):
- `bookings` — all desk and car bookings
- `users` — user profiles
- `notes` — daily notes (admin-created, one per day)

**Two Firestore client APIs in use (migration in progress — use DatabaseV2 in rebuild):**
- `Database` (old) — chained `.collection().where().onSnapshot()` style
- `DatabaseV2` (new, preferred) — modular `doc()`, `getDoc()`, `collection()` from `@react-native-firebase/firestore`
- In the rebuild, use only the modular (DatabaseV2) API throughout

**Data Models:**

`User`:
```ts
{
  id: string                  // Firebase Auth UID
  firstName: string
  lastName: string
  email: string
  profilePicUrl: string
  role: 'user' | 'admin' | 'demo'
  businessUnit: 'murray' | 'tenzing' | 'adams' | 'unknown'
  createdAt: Timestamp | FieldValue
  updatedAt: Timestamp | FieldValue
}
```

`Booking`:
```ts
{
  id: string
  date: string                // UTC midnight ISO string: yyyy-MM-ddTHH:MM:SSZ
  timeSlot: 'am' | 'pm' | 'allDay'
  bookingType: 'personal' | 'guest'
  spaceType: 'desk' | 'car'
  isReserveSpace: boolean     // reserved vs regular space
  userId: string
  clientName?: string         // guest bookings only
  createdAt: number           // seconds (Timestamp.seconds extracted on read)
  updatedAt: number           // seconds (Timestamp.seconds extracted on read)
}
```

`Note`:
```ts
{
  uuid: string
  text: string
  date: string                // matches booking date format
  isClubhouseClosed: boolean
  createdAt: Timestamp | FieldValue
  updatedAt: Timestamp | FieldValue
}
```

`ReducedUserData` — denormalised user lookup map (avoids repeated full user fetches):
```ts
{ [userId: string]: { name: string; profilePictureURI?: string; businessUnit: string } }
```

**Booking query patterns:**
- Real-time listener on `bookings` filtered by `date` — returns unsubscriber, must be called on unmount
- User's active booking dates: query `bookings` where `date >= today` and `userId == currentUser.id`
- Notes: one-time fetch filtered by `date`
- Users: batched `in` query chunked to 10 IDs max (Firestore limit) via `chunkQuery` utility

**Capacity (from Remote Config):**
- `deskCapacity`: single number, default 36
- `parkingCapacity`: per-BusinessUnit object `{ murray, tenzing, adams, unknown }` — default varies by unit
- `isReserveSpace` flag distinguishes reserved spaces from bookable ones

**API request pattern (all Firebase Function calls):**
- Every request requires two auth headers:
  - `Authorization: Bearer <Firebase ID token>` — from `getTokenID()`
  - `Firebase-AppCheck: <token>` — from `firebase.appCheck().getToken()`
- User creation additionally requires `Google-Access-Token` header
- URL pattern: `${endpointBaseURL}/v1/{resource}`
- Three endpoint bases: `deskAPIURL`, `carAPIURL`, `genericAPIURL` (from Remote Config)
- Desk and car operations are routed to their respective endpoints; user/time ops use `genericAPIURL`

**User creation flow:**
- On sign-in: fetch user from Firestore by Firebase UID
- If user document does not exist → call `POST /v1/user` (creates user from Google profile)
- User is never created client-side directly in Firestore

**Server timestamp utility:**
- Use `getServerTimestamp()` from `src/firebase/firestore/firestoreUtils` for all write timestamps
- Never use `Date.now()` or `new Date()` for Firestore write timestamps

**Multi-tenancy note for rebuild:**
- `BusinessUnit` is currently a hardcoded enum — must become dynamic/tenant-driven
- `parkingCapacity` keyed by BusinessUnit — capacity model will need to support arbitrary tenant IDs
- Endpoints are currently shared per environment — may need per-tenant routing in rebuild

### Testing Rules

**Test file location:** co-located with source — `ComponentName/ComponentName.test.tsx`

**Test describe structure:**
```
describe('When <component/function> is <context>', () => {
  describe('and <condition>', () => {
    it('should <expected behaviour>', () => { ... })
  })
})
```

**Two render helpers — choose the right one:**
- `TestWrapper` — wraps with real Redux store + NavigationContainer; use when no store state control needed
- `renderWithProviders(ui, { preloadedState })` — same wrapper but accepts `preloadedState` and returns `{ store, ...queries }`; use when test needs specific Redux state

**All Firebase modules are mocked globally in `setup-jest.ts`** — do not re-mock in individual test files unless overriding specific behaviour. Exported mock functions (`mockFirestoreGet`, `mockGetFirestore`, etc.) can be imported from `setup-jest.ts` for assertion.

**Mocking patterns:**
- Spy on named exports: `jest.spyOn(module, 'exportName')`
- Mock a whole module: `jest.mock('./path', () => ({ ... }))`
- For Firestore service tests: mock the `Database` or `DatabaseV2` module directly (not the Firebase SDK)
- Fake timers for date-sensitive tests: `jest.useFakeTimers().setSystemTime(new Date('yyyy-MM-dd'))`
- Always `jest.clearAllMocks()` in `beforeEach` (configured globally via `clearMocks: true` in jest config)

**testID convention:** Add `testID` to all interactive elements and root containers — primary query handle in tests (`getByTestId`)

**Firebase service tests:** mock the Database module, not the Firebase SDK — keeps tests isolated from SDK internals

**Pre-push hook:** `jest` runs on `prepush` — all tests must pass before pushing

### Feature Inventory

**Authentication:**
- Sign-in: Google Sign-In only (`GoogleSigninButton`)
- Google domain restriction: currently locked to `@and.digital` — **must become per-tenant config in rebuild**
- Google scopes required: `contacts.readonly`, `user.organization.read`
- Demo login: email/password modal, shown only when `isDemoLoginEnabled` Remote Config flag is true
- App integrity: Firebase AppCheck verified on every app launch; invalid app shows modal with Close / Retry — app is unusable until verified
- On sign-in: if no Firestore user doc exists, auto-create via `POST /v1/user` using Google profile
- Sign-out: clears FCM token from Firestore, then signs out of Firebase Auth
- Crashlytics/Analytics toggle visible on login screen (top-right switch)

**Main Booking Screen** (the only active screen in production):
- Week calendar (DeskCalendar) — horizontal week view, navigate ±1 week
- Days with active bookings marked with an indicator
- Selected day shown as `dddd, DD MMMM` (e.g. "Monday, 26 June")
- Segmented control: "Desk" / "Parking" — switches the entire available spaces + who's in view
- Real-time Firestore listener on bookings for selected date (unsubscribed on date change or unmount)
- Real-time Firestore listener on notes for selected date
- User's active booking dates fetched on mount and kept live (drives calendar indicators)
- Lazy user data loading: profile data fetched only for new userIds not already in local cache

**Desk Booking:**
- Capacity: configurable via Remote Config `deskCapacity` (default 36)
- Time slots: AM, PM, All Day — each independently bookable
- Personal booking: any user can book one slot per time slot
- Guest booking: any user can book guest desk spaces (toggle to show guest section)
- Cancel: deleting booking via `DELETE /v1/booking`
- Reserve list (waitlist): when capacity full, booking is placed on reserve list; position shown in Who's In
- `isReserveSpace: true` on Firestore document for waitlisted bookings

**Parking Booking:**
- Capacity: per-BusinessUnit from Remote Config `parkingCapacity` (`{ murray, tenzing, adams, unknown }`)
- Booking window rules (based on London server time, anti-manipulation):
  - Before midday: can book up to 6 days ahead (same day through +6)
  - After midday: can book up to 7 days ahead (through +7, i.e. next week same day)
  - "Close to booking date" window: same day, OR next day if currently after 9pm London time
  - Within the close window: all BusinessUnit capacities merge (murray + tenzing + adams total)
  - Outside the close window: only your own BusinessUnit's capacity is visible and bookable
- Admin role only: can book guest parking spaces
- Non-admin: guest parking toggle hidden
- Date not yet available: shows informational message with date available + Refresh button
- London server time fetched from `GET /v1/getLondonTime` and stored with device timestamp offset

**Events / Notes (admin-authored, all users can read):**
- One note per day, stored in `notes` Firestore collection
- Displayed as a tappable banner on the booking screen (pencil edit icon)
- "Add Event" when no note exists; "Edit Event(s)" when note exists
- EventModal: free-text input, Save creates/updates/deletes note
  - Empty input on save → deletes existing note
  - Non-empty input → creates or updates note
- Warning alert shown if note is updated externally while modal is open
- `isClubhouseClosed` field exists on Note model (not yet surfaced in UI)
- Notes CRUD: `createNote`, `updateNote`, `deleteNote` Firestore functions
- UUIDs generated client-side with `react-native-uuid`

**Who's In list:**
- Shown below Available Spaces, updates live with booking listener
- One row per booking: profile picture, name, time slot label, space type icon
- Guest bookings shown as `"<Host's Name>'s Visitor N"` with no profile picture
- Current user's row visually highlighted
- Reserve list bookings show their waitlist position number
- Rows sorted alphabetically by name
- Header: count badge showing `"N ANDis + M visitors"` (terminology currently AND-specific — **rename for multi-tenancy**)
- Empty state: "Be the first to book a desk/parking space!"

**Global UI overlays (always rendered, position absolute):**
- Loading overlay: full-screen semi-transparent spinner, triggered by `loading.isLoading`
- Error overlay: full-screen semi-transparent "Something went wrong / Please try again" banner, tap to dismiss, triggered by `error.showError`
- App integrity alert: blocks all interaction if AppCheck fails

**Push notifications (FCM):**
- Token requested on HomeContainer mount (after auth)
- Token saved to Firestore user document
- Token refreshed and re-saved on `onTokenRefresh`
- Token deleted from Firestore on sign-out
- Foreground messages shown as native `Alert` dialog

**Navigation (current):**
- Stack navigator: single "Bookings" screen + logout button in header
- Tab navigator: feature-flagged (`tabBarEnabled`), adds tab bar with Bookings tab
- Logout: confirmation alert → sign out

**Placeholder screens (built but empty — to be implemented):**
- `MyBookingsScreen` — shows "My Bookings" text only
- `ParkingScreen` — shows "PARKING" text only
- `HomeScreen` — dev/debug screen showing user details + sign out button; not in main navigation

**Multi-tenancy gaps to address in rebuild:**
- Google Sign-In `hostedDomain` is hardcoded to `and.digital` — must be tenant-configurable
- "ANDi" terminology in Who's In count — must be tenant-configurable or generic
- `BusinessUnit` enum is hardcoded — must be data-driven per tenant
- Parking capacity keys tied to current BusinessUnit names — must support arbitrary tenant units
- App branding (colours, "Ey up!" greeting, "Murray Desk Booking" app name) — all must be tenant-driven

### Critical Don't-Miss Rules

**Booking date format — strict UTC midnight strings:**
- All booking dates stored and queried as `"YYYY-MM-DDT00:00:00Z"` (UTC midnight)
- Never use `dayjs().toISOString()` — it includes time component and will break queries
- Use `getTodaysUTCDateMidnightString()` or `formatToBookingDateUTC(day, false)` exclusively

**Parking date validation uses server time, not device time:**
- Never use `new Date()` or `dayjs()` alone to validate if parking is bookable
- Always derive current London time by adding elapsed device time to the stored `londonServerTimestamp`
- The `isValidParkingDate` and `isCloseToBookingDate` utilities handle this — use them

**Firestore `in` query limit = 10 items:**
- Firestore rejects `in` queries with more than 10 values
- Always use `chunkQuery` utility when querying users by ID array

**Firestore real-time listeners must be unsubscribed:**
- Every `.onSnapshot()` call returns an unsubscriber function
- Always return it from `useEffect` — failure causes memory leaks and stale data

**User data caching — avoid redundant Firestore reads:**
- `ReducedUserData` map is built incrementally: `calculateNewUserIds` diffs against existing cache
- Never re-fetch users already in local state; always pass the existing map to `calculateNewUserIds` first

**All API calls require both AppCheck token AND Firebase ID token:**
- Missing either header causes a 403 from the Firebase Function
- `getAppCheckToken()` can return `'FAILED_TOKEN'` on error — Functions will reject this; handle gracefully
- User creation additionally requires `Google-Access-Token` (from `GoogleSignin.getTokens()`)

**Google Sign-In domain restriction:**
- `signInSilently` explicitly rejects non-`@and.digital` emails with sign-out + error
- In the rebuild this check must be replaced with a tenant-driven domain allowlist

**Role-based access:**
- `Role.admin` is the only role that can book guest parking spaces
- Admin check: `user.role === Role.admin` — never assume based on BusinessUnit
- `Role.demo` exists for demo accounts (email/password login)

**Reserve list ordering:**
- Waitlist position is determined by `booking.createdAt` (ascending) — the earliest `createdAt` is position 1
- `createdAt` on Booking is stored as seconds (number) after extraction from Firestore Timestamp

**Note UUIDs are client-generated:**
- Notes use `react-native-uuid` v4 generated client-side, not Firestore auto-IDs
- The UUID is the document identifier (`uuid` field) AND used as the Firestore doc ID

**Splash screen requires both signals before hiding:**
- `screensLoaded` AND `remoteConfigFound` must both be true
- Setting only one will not hide the splash — both must be dispatched

**FCM token lifecycle:**
- Token must be deleted from Firestore on sign-out (`messagingSignOutHandler`) before `auth().signOut()`
- If order is reversed, the Firestore write may fail because auth has already cleared

**Environment variables:**
- `REACT_APP_FIREBASE_AUTH_WEB_CLIENT_ID` is required at startup — missing it throws at configure time
- `REACT_APP_USE_EMULATORS` controls local emulator routing (currently hardcoded `false` in `FirebaseUtils.ts` — must be env-driven in rebuild)
- `REMOTE_CONFIG_FETCH_DEBUG` enables short Remote Config fetch interval for dev

**Rebuild-specific: NativeBase removal:**
- Every NativeBase import (`VStack`, `HStack`, `Box`, `Text`, `Button`, `Modal`, `Spinner`, etc.) must be replaced with plain React Native equivalents
- NativeBase theme token strings like `'brand.charcoal'`, `'other.lightGrey'` must be replaced with actual hex values or a custom token system
- `native-base` `Icon` wrapper for SVGs must be replaced — render SVG components directly

---

## Usage Guidelines

**For AI Agents:**
- Read this entire file before implementing any code in this project
- The Feature Inventory section is the source of truth for what the app does
- The Critical Don't-Miss Rules section contains the highest-risk gotchas — check it first when touching dates, parking logic, Firestore queries, or auth
- Multi-tenancy gaps are flagged throughout — always implement the generalised version, not the AND Digital-specific one
- When in doubt about a pattern, prefer the more explicit and type-safe option

**For Humans:**
- Update the Feature Inventory when new screens or behaviours are added
- Update the Data Models section if Firestore schema changes
- Update the Technology Stack section when packages are upgraded in the new repo
- The multi-tenancy gap annotations should be removed once each item is addressed in the rebuild

_Last Updated: 2026-06-08_
