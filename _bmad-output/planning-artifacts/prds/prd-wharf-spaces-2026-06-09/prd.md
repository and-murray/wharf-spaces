---
title: "Wharf Spaces — Rebuild PRD"
status: draft
created: 2026-06-09
updated: 2026-06-10
---

# Wharf Spaces — Rebuild PRD

## 1. Vision

### Problem

Wharf Spaces is AND Digital's internal desk and parking booking app, currently used exclusively by AND Digital employees. The existing app is built on a deprecated package foundation (NativeBase being the headline dependency) that makes every maintenance task costly. The codebase is also tightly coupled to AND Digital's specific setup — hardcoded business units, branding, auth domain, and terminology — making it impossible to offer the app to other companies without a rewrite.

The result: AND Digital spends disproportionate time firefighting the app rather than improving it, onboarding new companies is not currently possible, and the app cannot scale beyond a single tenant.

### Goal

Rebuild Wharf Spaces on a clean, maintainable foundation with multi-tenancy and white-label theming built in from day one. The rebuilt app should be shippable to multiple companies sharing the AND Digital office building, and architected to grow beyond that building over time.

**V1 delivers:**
- A React Native mobile app (iOS + Android) with feature parity to the existing app, rebuilt without deprecated dependencies and with all AND Digital-specific hardcoding removed
- Multi-tenant support: each company operates as an isolated tenant with its own branding, auth configuration, space allocation, and user base
- A lightweight React web app used by AND Digital to onboard new tenants and by building administrators to view parking occupancy

### Users

| Role | Surface | Description |
|------|---------|-------------|
| **End User** | Mobile app | Employee of a tenant company; books desks and parking for themselves or guests |
| **Company Admin** | Mobile app | Manages space allocation, branding config, and user roles for their organisation |
| **AND Digital (Platform Operator)** | Web app | Onboards new tenants via the onboarding form; controls the platform |
| **Building Admin** | Web app | Views a list of people parked on a given date across all tenants; no access to tenant config. **Out of scope v1 — no Building Admin capability is delivered in this release.** |

### Success

V1 is successful when:
- Multiple tenant companies are onboarded and actively using the app
- AND Digital's maintenance overhead is materially reduced — fewer firefighting sessions, fewer manual Firebase interventions
- New tenant onboarding is self-serve enough that AND Digital does not need to manually edit Firebase values
- The codebase is on a stable, dependency-current foundation that the team is confident maintaining

---

## 2. Scope

### In scope — V1
- Mobile app: iOS + Android (React Native)
- React web app: tenant onboarding form and tenant management (AND Digital)
- Multi-tenancy: tenant isolation, per-tenant branding, auth provider config, space allocation
- Feature parity with existing app: desk booking, parking booking, events/notes, who's in list, push notifications
- GDPR compliance, security, and production-ready observability

### Out of scope — V1
- Data migration from the existing app — the rebuild is a clean start; no existing Firestore data is carried over
- User-facing web portal for bookings
- Building Admin parking occupancy view (web)
- Billing and subscription management
- Building admin role in the mobile app
- Floor maps and visual space selection
- Recurring bookings
- Calendar integrations
- Hardware integrations
- Dedicated company admin web interface (admin configures via AND Digital web platform)

---

## 3. Features

### 3.1 Authentication & Onboarding

**FR-001 — Per-tenant sign-in provider**
Each tenant has one authentication provider configured (Google, Microsoft, Apple, or email/password). On the sign-in screen, the user first enters their email address. The app resolves the tenant from the email domain and presents the sign-in journey for that tenant's configured provider.

**Constraint — Apple Hide My Email:** Apple Sign-In works only for users who share their real email address with the app. Users who enable Apple's Hide My Email feature receive a relay address (`@privaterelay.appleid.com`) that cannot be matched to a tenant domain. Those users are unsupported in v1.

**FR-002 — Allowlist access control**
Sign-in is restricted to email addresses on the tenant's allowlist, managed by the Company Admin. A user whose email is not on the allowlist is shown a message directing them to contact their company administrator; they cannot proceed further in the app.

**FR-003 — Email/password verification**
Email/password sign-in requires identity verification before access is granted. Verification method (OTP or email link) to be confirmed. [OPEN QUESTION]

**FR-004 — App Store reviewer access**
A demo access mode can be enabled per-environment, allowing App Store reviewers to sign in with a preconfigured email/password credential without a real tenant account. This mode is not visible to end users.

**FR-005 — Post-sign-in routing**
On successful sign-in, the user is routed directly to the booking screen. There are no intermediate onboarding steps.

**FR-006 — Push notification permission prompt**
On first sign-in, the user is prompted to grant push notification permissions before or immediately upon landing on the booking screen.

### 3.2 Desk Booking

**FR-007 — Week calendar**
The booking screen displays a horizontal week view (Mon–Fri). The user can navigate forward or back one week at a time. The selected date is shown prominently above the calendar. Days on which the user has an active booking are visually indicated.

**FR-008 — Space type toggle**
A segmented control (Desk / Parking) switches the entire booking view — available slots, capacity, and Who's In — between desk and parking contexts.

**FR-009 — Time slot tiles**
The desk view shows three independently bookable time slots: **All Day**, **AM**, and **PM**. Each tile displays the number of bookings against the tenant's desk capacity (e.g. 33/36). The user selects a tile to activate the Book button.

**FR-010 — Personal desk booking**
The signed-in user's profile picture, name, and a Book button are shown once a time slot is selected. Tapping Book confirms the booking for that user and slot.

**FR-011 — Per-tenant desk capacity**
Desk capacity is configured per tenant. When bookings for a slot reach capacity, no further personal bookings are accepted for that slot (see FR-012).

**FR-012 — Waitlist**
When a time slot is at capacity, a booking is placed on a reserve (waitlist) list rather than rejected. The user's waitlist position is shown in the Who's In list.

When a cancellation creates an available slot, the next eligible user on the waitlist is automatically booked — they do not need to take any action. A push notification is sent to confirm the automatic booking (see FR-030); the booking stands regardless of whether the notification is successfully delivered.

Slot-type matching rules:
- **AM cancelled** → only AM waitlist entries are eligible to fill it
- **PM cancelled** → only PM waitlist entries are eligible to fill it
- **All Day cancelled** → All Day, AM, and PM waitlist entries are all eligible; the next entry in the waitlist queue is promoted regardless of slot type. An All Day cancellation may be filled by a single All Day entry, a single AM or PM entry, or split across one AM and one PM entry if both are next in the queue.

**FR-013 — Guest desk booking**
Any user can book a desk for a guest ("Booking for someone else?"). Guest bookings are attributed to the host and displayed in the Who's In list under the host's name.

**FR-014 — Desk booking cancellation**
A user can cancel their own desk booking for a given slot and date. Cancellation removes the booking and, where a waitlist exists, advances remaining positions.

### 3.3 Parking Booking

**FR-015 — Parking time slot tiles**
The parking view shows the same three time slots as desk booking: All Day, AM, and PM. Each tile displays bookings against the capacity visible to the user (see FR-018).

**FR-016 — Personal parking booking**
The user books a parking space for a selected slot and date. Once booked, the tile shows a confirmation state ("You've Booked!") with a Cancel button. The user can change their slot by tapping a different tile — no separate edit flow required.

**FR-017 — Tenant-configurable booking window**
Each tenant's Company Admin configures how many days ahead parking bookings can be made (e.g. 7 days). The booking window unlocks one day at a time at 12pm server time: before 12pm, users can book up to N−1 days ahead; at 12pm, the Nth day unlocks. The 12pm unlock time is fixed and not tenant-configurable. All window calculations use server time to prevent device clock manipulation. Dates outside a user's allowed booking window display an informational message with a Refresh button rather than a booking UI.

**FR-018 — Per-tenant groups and parking capacity**
Each tenant defines their own internal groups (e.g. teams, floors, departments). Parking capacity is allocated per group. The capacity and bookings visible to a user reflect their group's allocation for the selected date and slot.

**FR-019 — Guest parking (admin only)**
Only users with the Company Admin role can book guest parking spaces. The guest parking option is not shown to standard users.

**FR-040 — Nightly cross-group parking reallocation**
At 9pm server time each evening, any unbooked parking spaces across all groups within a tenant are pooled and made available to users on the waitlist from any group. The system automatically allocates these spaces to waitlisted users in waitlist order, regardless of the waitlisted user's group membership. A push notification is sent to each user who receives an allocation (see FR-030). This rule exists because groups have different capacity allocations — groups with smaller allocations frequently carry waitlist entries while groups with larger allocations have unused spaces. The 9pm pooling ensures those spaces are not wasted.

### 3.4 Events & Notes

**FR-020 — Daily events banner**
A tappable banner is displayed on the booking screen showing the day's note. The banner label is tenant-configurable (e.g. "Events in the office"). When no note exists for the selected date, the banner displays a prompt to add one.

**FR-021 — Note authoring (any user)**
Any signed-in user can create or edit the day's note for their tenant. There is one note per day per tenant — all users editing on the same day are editing the same note. Saving with text creates or updates the note; saving with an empty field deletes it.

**FR-022 — Concurrent edit warning**
If the note is modified externally while a user has the edit modal open, the user is shown an advisory warning that another user may be editing the note and their changes could be lost. The warning is informational — the user is not blocked from saving. The expected response is to close the modal and try again later.

**FR-023 — isOfficeClosed**
Out of scope for v1. The data model should preserve the field for a future version.

### 3.5 Who's In List

**FR-024 — Live booking list**
Below the time slot tiles, the booking screen displays a live list of all bookings for the selected date and space type. The list updates in real time as bookings are made or cancelled. It switches between "Who's in?" (desk) and "Who's parking?" (parking) based on the active space type toggle. The section headers "Who's in?" and "Who's parking?" are fixed strings and are not tenant-configurable.

**FR-025 — Booking row display**
Each row shows the user's profile picture, name, and time slot. The signed-in user's own row is visually highlighted. Guest booking rows display as "[Host's name]'s Visitor N" with no profile picture. Waitlisted bookings display the user's reserve position number.

**FR-026 — Tenant-configurable member term**
The count badge in the list header uses a tenant-configurable term for members (replacing "ANDis"). Visitors are counted separately and displayed alongside (e.g. "3 Members + 1 visitor").

**FR-027 — Sort order and empty state**
Rows are sorted alphabetically by name. When no bookings exist for the selected date and space type, an empty state message is shown ("Be the first to book a desk/parking space!").

### 3.6 Push Notifications

**FR-028 — Notification token lifecycle**
On sign-in, the app requests push notification permission and registers the device token. The token is refreshed automatically when it changes. On sign-out, the token is removed before the session ends.

**FR-029 — Foreground message display**
Notifications received while the app is in the foreground are displayed as a native alert dialog.

**FR-030 — Waitlist promotion notification**
When the system automatically books a user from the waitlist (FR-012), a push notification is sent to that user confirming their booking.

### 3.7 Web Platform — Tenant Management (AND Digital)

The web platform is a functional admin tool, not a polished product surface. It should be clean and usable but does not require high-fidelity UX design. Where possible, it should follow the mobile app's visual style (colours, typography). Engineering effort should be proportionate to its low frequency of use.

**FR-031 — Tenant provisioning**
AND Digital provisions a new tenant via a web form. The form captures: tenant name, email domain, authentication provider (one of: Google, Microsoft, Apple, email/password), and the email address of the first Company Admin user. Submission creates the tenant record, associates the domain with the tenant, and grants the first Company Admin access.

**FR-032 — Company Admin: user allowlist management**
Company Admins manage their tenant's user allowlist via the web platform — adding and removing individual email addresses to grant or revoke access.

**FR-033 — Tenant suspension (temporary)**
AND Digital can suspend a tenant, for example due to non-payment. Suspension immediately locks out all users of that tenant. Tenant data is preserved. Reinstating the tenant restores full access without data loss.

**FR-034 — Tenant removal (permanent)**
AND Digital can permanently remove a tenant and their associated data. This capability exists in v1. Whether and when it is exercised is at AND Digital's discretion. [OPEN QUESTION: data retention and GDPR obligations on permanent removal — see OQ-002]

### 3.8 Multi-tenancy & White-label Theming

**FR-035 — Tenant data isolation**
Each tenant's data — users, bookings, notes, configuration — is fully isolated. Users of one tenant cannot see or interact with data belonging to another tenant.

**FR-036 — Runtime tenant config loading**
The app is a single binary on the App Store. Tenant branding, configuration, and feature settings are loaded at runtime based on the signed-in user's tenant. No per-tenant builds are produced or distributed.

**FR-037 — Company Admin branding configuration**
Company Admins configure their tenant's branding via the web platform — including colours and logo. Branding is applied across the mobile app at runtime.

**FR-038 — Company Admin operational configuration**
Company Admins configure the following for their tenant via the web platform: parking groups and per-group capacity, booking window rules, member terminology (the term used in the Who's In count), and the events banner label.

**FR-039 — App name**
The app name will be updated from the current AND Digital-specific name. Name TBD. [OPEN QUESTION — OQ-003]

---

## Open Questions

- **OQ-001** — FR-003: What verification method should be used for email/password sign-in — OTP, email link, or user's choice? Owner: TBD. Revisit condition: before architecture begins.
- **OQ-002** — FR-034: What are the data retention obligations on permanent tenant removal? Does GDPR require a retention period before hard delete? Owner: TBD. Revisit condition: before GDPR section is finalised.
- **OQ-003** — FR-039: What is the new app name? Owner: TBD. Revisit condition: before any public-facing copy is written.

---

## Non-Functional Requirements

### NFR-1 — GDPR & Privacy

**Personal data held**
The app stores the following personal data per user: name, email address, tenant and group membership, profile picture URL, and user role. Booking history (dates, time slots, space type) is associated with individual users.

**Data residency**
All data is stored within the EU (Firebase infrastructure, `europe-west1` region) to meet GDPR data residency requirements.

**User removal and data deletion**
When a user is removed from the tenant allowlist, their personal data and associated booking records must be deleted. Deletion is not required to be instant but must occur as part of the removal process.

**Right to erasure**
Erasure requests are handled manually in v1 — there is no self-serve deletion flow. AND Digital or the Company Admin processes requests out of band.

**Tenant offboarding and data deletion**
On permanent tenant removal, all associated tenant data (users, bookings, configuration) must be deletable. Data retention obligations and whether a retention period applies before hard delete to be confirmed (OQ-002).

**Data minimisation**
Only the data listed above is collected. No additional personal data is gathered beyond what is necessary for the booking service.

### NFR-2 — Security

**App integrity**
Firebase AppCheck verifies the integrity of the app binary on every launch. If verification fails, the user is blocked from using the app and shown a prompt to retry. The app is unusable until integrity is confirmed.

**API authentication**
Every request to the backend requires two authentication headers: a Firebase ID token (proving user identity) and an AppCheck token (proving app integrity). Requests missing either header are rejected.

**Tenant isolation enforcement**
Tenant boundaries are enforced server-side. A user authenticated under Tenant A cannot read, create, modify, or delete data belonging to Tenant B — regardless of what the client sends. Tenant isolation is a backend security guarantee, not a client-side UI restriction.

**Role-based access control**
User roles (Company Admin, End User) are enforced server-side. Elevated capabilities — such as guest parking — cannot be accessed by users without the appropriate role, regardless of client-side state.

**Booking window enforcement**
Parking booking window rules are validated using server time to prevent device clock manipulation.

### NFR-3 — Observability & Logging

**Tenant-attributed error reporting**
Crash reports and error events must be attributed to the tenant in which they occurred. When an issue is reported, AND Digital can identify which tenant is affected without manual investigation.

**Crash reporting**
Firebase Crashlytics is used for crash and non-fatal error reporting. Crash events include sufficient context (tenant, user role, feature area) to diagnose and reproduce issues.

**Analytics**
Firebase Analytics tracks usage across the platform. Analytics events are attributed to their tenant to support per-tenant usage insights and platform health monitoring.

**User consent toggle**
A toggle on the login screen allows users to opt out of Crashlytics and Analytics collection. This setting persists across sessions. No diagnostic data is collected when the toggle is off.

### NFR-4 — Support Model

**V1 support channel**
Company Admins contact AND Digital directly for platform support. There is no in-app support mechanism or ticketing system in v1.

**Future state**
A structured support model (ticketing, SLAs, self-serve diagnostics) is out of scope for v1 and will be defined in a future phase.

### NFR-5 — Performance & Reliability

**Booking responsiveness**
Booking and cancellation actions must feel responsive to the user — confirmation of the action should be perceptible without an uncomfortable wait. Users should not need to tap twice or wonder whether their action was received.

**Real-time list currency**
The Who's In list must update without a user-initiated refresh. Users viewing the booking screen while others book or cancel should see those changes reflected automatically.

**Concurrent booking correctness**
Under simultaneous bookings from multiple users in the same tenant — the expected pattern at the morning booking window — the system must remain consistent. Capacity limits must not be exceeded, and waitlist positions must not be lost or duplicated under concurrent writes.

**Offline and degraded connectivity**
When the device has no connectivity, the app must not crash or present silent failures. The last-known state is displayed and booking actions are disabled with a clear message to the user.

**Platform availability**
The product inherits the availability characteristics of its Firebase infrastructure. No separate uptime target is owned by the product team in v1. This is a conscious decision for this release.
