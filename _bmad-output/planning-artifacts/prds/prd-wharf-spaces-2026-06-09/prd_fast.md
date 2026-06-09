---
title: "Wharf Spaces — Rebuild PRD (Fast Path Draft)"
status: draft
created: 2026-06-09
updated: 2026-06-09
---

# Wharf Spaces — Rebuild PRD

---

## 1. Overview

Wharf Spaces is a multi-tenant mobile workspace booking platform for shared-building occupants. It enables employees to book desks and parking spaces, view who else is in on any given day, and receive building-level event updates. Company administrators can configure and manage their organisation's presence — branding, auth providers, space allocation, and user management — without requiring engineering involvement from AND Digital.

The rebuild replaces an existing React Native app built exclusively for AND Digital's internal use. The new platform is architected for multi-tenancy from the ground up, with white-label theming, per-tenant auth configuration, and a self-serve onboarding model.

AND Digital owns and operates the platform, and is simultaneously one of its tenants.

---

## 2. Problem Statement

The existing Wharf Spaces app has two compounding problems:

**Maintainability.** The app depends on NativeBase (deprecated) and a number of other aging packages. Upgrading in-place risks introducing breaking changes to a production app. The technical debt has reached a point where further investment in the existing codebase is not justifiable.

**AND Digital lock-in.** The app contains hardcoded AND Digital-specific logic throughout: Google-only auth locked to `@and.digital`, hardcoded business units, AND Digital branding ("ANDis", "Ey up!", "Murray Desk Booking"). Other companies sharing the Calls Wharf building want to use the platform, but the current architecture cannot support them without per-customer engineering work.

A rewrite is the right call because both problems compound each other — patching tenant-specific logic onto a deprecated stack creates more risk than value.

---

## 3. Goals

| # | Goal | Success Metric |
|---|------|----------------|
| G1 | Multiple companies actively using the platform | ≥ 2 additional tenants enrolled within 6 months of launch |
| G2 | New tenants self-onboard without code changes | 0 code deployments required per onboarding |
| G3 | The app is maintainable at launch | 0 deprecated packages; all dependencies at latest stable |
| G4 | Full feature parity with the existing app | All existing AND Digital workflows present at launch |

---

## 4. Non-Goals (v1)

- **Web admin portal** — company admin configuration is mobile-only in v1; web portal is a future phase
- **Building admin role** — a cross-tenant building administrator is out of scope; AND Digital acts as platform operator
- **Billing and payments** — no subscription management or invoicing
- **Floor maps / interactive bay selection** — spaces are capacity-based, not spatially mapped
- **Recurring bookings** — users book one day at a time
- **Calendar integration** — no Google Calendar or O365 sync
- **Hardware integrations** — no sensor, badge reader, or QR/NFC check-in
- **Occupancy analytics dashboard** — reporting for admins is a future phase
- **No-show / auto-cancel** — unchecked-in bookings are not automatically released in v1

> **Note for future phases:** Floor maps, recurring bookings, and calendar integration are table-stakes in the broader workplace booking market (Robin, Condeco, Skedda). These should be treated as high-priority items for v2. First-class parking — a genuine differentiator — is retained in v1.

---

## 5. Users & Roles

### 5.1 End User
An employee of a tenant company. Books desks and parking spaces for themselves and (for desks) guests. Views who else has booked on any given day.

### 5.2 Company Admin
An employee of a tenant company with elevated privileges. Can do everything an end user can, plus:
- Manage their company's user base (invite, remove, assign/revoke admin role)
- Configure their company's space allocation (desk and parking capacities)
- Configure their company's branding (primary colours, display name)
- Configure which auth providers are enabled for their company
- Manage their company's list of business units
- Create, edit, and delete daily event notes

### 5.3 AND Digital (Platform Operator)
AND Digital owns and operates the platform. Responsibilities:
- Approves new tenant onboarding requests
- Configures the email domain allowlist for each tenant at onboarding time
- Maintains and deploys the app

AND Digital is also a tenant and uses the platform as an end user and company admin.

---

## 6. Functional Requirements

### 6.1 Tenant Onboarding & Management

**FR-001** A prospective company can submit a request to join the platform.
**FR-002** AND Digital can approve or reject a tenant onboarding request.
**FR-003** At onboarding, AND Digital configures the email domain allowlist for the tenant (e.g. `@company.com`).
**FR-004** Once approved, a tenant is provisioned with a default configuration that their company admin can then customise.
**FR-005** `[ASSUMPTION]` Onboarding approval in v1 is a simple approve/reject action; no multi-step workflow or SLA tracking.

### 6.2 Authentication

**FR-006** The app supports four auth methods: Google Sign-In, Microsoft Sign-In, Apple Sign-In (iOS only), and email/password.
**FR-007** The auth providers enabled for a given tenant are configurable by the company admin.
**FR-008** On sign-in, the user's email domain is validated against their tenant's allowlist. Non-matching users are rejected with a clear error.
**FR-009** `[ASSUMPTION]` Users are associated with a single tenant via email domain. Cross-tenant accounts are not supported in v1.
**FR-010** On first sign-in, if no user profile exists, one is automatically created from the auth provider's profile data (name, email, profile picture).
**FR-011** Sign-out removes the user's FCM push token from the backend before completing auth sign-out.
**FR-012** The app verifies Firebase AppCheck integrity on every launch. If integrity cannot be established, the app blocks interaction and presents a Close / Retry prompt.
**FR-013** A demo login mode (email/password) can be enabled per-tenant via configuration, for demonstration and testing purposes.

### 6.3 Desk Booking

**FR-014** Users can view desk availability for any day in a scrollable week calendar, navigable ±1 week.
**FR-015** Days on which the current user has an active booking are marked with an indicator on the calendar.
**FR-016** Three time slots are available per day: AM, PM, and All Day. Each is independently bookable.
**FR-017** Available capacity is displayed per time slot as a count (e.g. "33/36").
**FR-018** A user can hold at most one personal desk booking per time slot per day.
**FR-019** When capacity is full, a booking is placed on a reserve (waitlist) list. Reserve position is determined by booking creation time ascending (earliest = position 1).
**FR-020** Users can book a desk on behalf of a guest. Guest bookings require a client name and are displayed distinctly in the Who's In list.
**FR-021** Users can cancel their own bookings.
**FR-022** Desk capacity limits are configurable per tenant by the company admin.
**FR-023** `[ASSUMPTION]` Admins cancelling other users' bookings is out of scope for v1.

### 6.4 Parking Booking

**FR-024** Users can view parking availability for any day within the allowed booking window.
**FR-025** Parking capacity is configured per business unit within a tenant (each business unit has its own capacity).
**FR-026** Parking booking windows are enforced using London server time (anti-manipulation):
- Before midday: users may book up to 6 days ahead
- After midday: users may book up to 7 days ahead
**FR-027** When booking close to the date (same day, or next day if currently after 9pm London time), all business unit capacities within the tenant merge into a single shared pool.
**FR-028** Outside the close-booking window, users can only see and book against their own business unit's capacity allocation.
**FR-029** A user can hold at most one personal parking booking per time slot per day.
**FR-030** Only users with the admin role can book guest parking spaces.
**FR-031** When a selected date is not yet within the booking window, the app shows when it becomes available and provides a Refresh action.
**FR-032** London server time is fetched from a backend endpoint and stored alongside a device timestamp offset, to allow booking window calculations that are resilient to device clock manipulation.
**FR-033** `[ASSUMPTION]` Business units within a tenant are created and managed by the company admin and are not seeded by AND Digital at onboarding.

### 6.5 Who's In

**FR-034** Below the available spaces panel, users see a live list of all bookings for the selected day and space type.
**FR-035** Each row shows: profile picture (where available), display name, time slot, and space type icon.
**FR-036** Guest bookings appear as "[Host Name]'s Visitor N" with no profile picture.
**FR-037** The current user's own row is visually highlighted.
**FR-038** Reserve list bookings show their waitlist position number.
**FR-039** Rows are sorted alphabetically by display name.
**FR-040** The list header shows a count of personal bookings and guest bookings. The member terminology label (currently "ANDis") is tenant-configurable.
**FR-041** The list updates in real time via a Firestore listener.

### 6.6 Events & Notes

**FR-042** Company admin users can create, edit, and delete a daily note (event) for any day.
**FR-043** A daily note is displayed as a tappable banner on the main booking screen.
**FR-044** Tapping the banner opens an edit modal (admin users only).
**FR-045** Saving an empty note deletes the existing note for that day.
**FR-046** If a note is updated externally while a user has the edit modal open, a warning is shown before saving.
**FR-047** `[ASSUMPTION]` Notes are scoped to the tenant and shared across all users of that tenant (not scoped per space type or business unit).

### 6.7 Company Admin Configuration

**FR-048** Company admins can invite users to their tenant and remove existing users.
**FR-049** Company admins can assign and revoke the admin role for users within their tenant.
**FR-050** Company admins can configure desk capacity per time slot for their tenant.
**FR-051** Company admins can configure parking capacity per business unit for their tenant.
**FR-052** Company admins can configure their tenant's branding: primary colour palette and display name.
**FR-053** Company admins can enable or disable specific auth providers for their tenant.
**FR-054** Company admins can create, rename, and remove business units within their tenant.
**FR-055** `[ASSUMPTION]` Company admin configuration is performed within the mobile app in v1. No web portal.

### 6.8 Design System & Theming

**FR-056** The app is built on a token-based design system with no dependency on third-party UI libraries (NativeBase is fully removed).
**FR-057** All design tokens — colours, typography, spacing — are overridable per tenant to support white-label theming.
**FR-058** Tenant branding configured by the company admin is applied at runtime without a new app release.
**FR-059** All UI is built from React Native primitives: `View`, `Text`, `Pressable`, `StyleSheet`.
**FR-060** All icons are SVG React components (not image files).

### 6.9 Push Notifications

**FR-061** On first authentication, the app requests push notification permission and registers the FCM token with the backend.
**FR-062** The FCM token is refreshed and re-registered automatically when it changes.
**FR-063** The FCM token is removed from the backend on sign-out, before auth sign-out completes.
**FR-064** Foreground push notifications are surfaced as in-app alerts.

---

## 7. Non-Functional Requirements

**NFR-001 Maintainability** — No deprecated dependencies at launch. All packages at latest stable versions. Codebase follows Atomic Design component architecture with strict TypeScript (`noImplicitReturns`, `noUnusedLocals`, `noUnusedParameters`).

**NFR-002 Testability** — All components include co-located unit tests (`ComponentName/ComponentName.test.tsx`). A pre-push hook enforces test suite passage before any push. Firebase modules are globally mocked in `setup-jest.ts`; individual tests do not re-mock the SDK unless overriding specific behaviour.

**NFR-003 Security** — Every API call includes both a Firebase AppCheck token and a Firebase ID token. The app verifies AppCheck on every launch and blocks interaction if verification fails.

**NFR-004 Data Integrity** — All booking dates are stored and queried as UTC midnight ISO strings (`"YYYY-MM-DDT00:00:00Z"`). Device time is never used directly for parking validation — the stored server time offset is always used. Firestore `in` queries are always chunked to ≤10 items.

**NFR-005 Performance** — Real-time Firestore listeners are unsubscribed on unmount. User profile data is cached locally (via `ReducedUserData` map) to avoid redundant Firestore reads. Firestore listeners are re-established only on meaningful state changes (date or space type selection).

**NFR-006 Multi-tenancy Isolation** — Tenant data is strictly isolated at the Firestore rules layer. A user from Tenant A cannot read or modify data belonging to Tenant B.

**NFR-007 Platform** — iOS and Android. Node ≥ 20, package manager: yarn. Firebase Functions deployed in `europe-west1`, Gen 2 only.

**NFR-008 Accessibility** — `[ASSUMPTION]` Full WCAG 2.1 AA compliance is a future phase. All interactive elements must have `testID` props and tappable minimum touch targets at launch.

---

## 8. Success Metrics

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Additional tenants enrolled | ≥ 2 | 6 months post-launch |
| Code changes required per tenant onboarding | 0 | Per onboarding |
| Deprecated packages at launch | 0 | At launch |
| Test suite pass rate | 100% | Ongoing (pre-push enforced) |

---

## 9. Open Questions

**OQ-001** Will existing Firestore data (bookings, users, notes) be migrated to the new multi-tenant schema, or does the rebuild start with a clean data slate?

**OQ-002** How does a user identify which tenant they belong to at sign-in — is the tenant resolved automatically from their email domain, or do users explicitly select their company on first launch?

**OQ-003** What is the mechanism for AND Digital to approve a tenant onboarding request in v1 — is there an in-app approval flow, or is this handled manually (e.g. via email + Firebase console)?

**OQ-004** Are business units seeded by AND Digital at onboarding, or created from scratch by the company admin post-approval?

**OQ-005** Is the `isClubhouseClosed` field on the Note model intended to be surfaced in the app UI in v1? It exists in the current data model but is not currently shown to users.

**OQ-006** For Microsoft Sign-In, is the intent to support personal Microsoft accounts, Azure AD tenant accounts only, or both?
