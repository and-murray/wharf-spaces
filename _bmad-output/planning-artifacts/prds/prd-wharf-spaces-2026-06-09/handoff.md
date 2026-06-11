# PRD Handoff — Wharf Spaces Rebuild

**Date left off:** 2026-06-10  
**PRD workspace:** `_bmad-output/planning-artifacts/prds/prd-wharf-spaces-2026-06-09/`  
**Files in workspace:** `prd.md`, `.decision-log.md`, `handoff.md` (this file)

---

## How to resume

1. Open Claude Code in this project (`/Users/abeel/Desktop/wharf-spaces`)
2. Run `/bmad-prd`
3. When prompted, choose **Resume** the `prd-wharf-spaces-2026-06-09` workspace
4. Choose **Coaching path** and **Vision + Features** entry point (already decided)
5. Tell Claude: *"I'm picking up a handoff — please read handoff.md in the PRD workspace before we continue"*
6. Pick up at **Features group 1: Authentication & onboarding** (see below)

---

## What's been completed

### Vision section ✅
Written in `prd.md` — covers problem statement, goal, V1 deliverables, user roles, and success criteria. Review it in the file; no changes needed unless something reads wrong.

### Scope section ✅
In-scope and out-of-scope lists confirmed and written in `prd.md`.

### Discovery ✅
All brain dump prompts answered. All key decisions logged in `.decision-log.md`. See **Key decisions summary** below.

---

## What's next — Features section

We agreed on 14 feature groups to walk through in order on the coaching path. None have been started yet.

**Mobile app**
1. Authentication & onboarding (sign-in, tenant routing, app integrity) ← **START HERE**
2. Desk booking (time slots, capacity, waitlist, guest booking)
3. Parking booking (time windows, capacity rules, guest parking)
4. Events & notes (admin-authored, all users read)
5. Who's in list (live view of bookings for the day)
6. Push notifications
7. Company admin capabilities (what can an admin do in the mobile app?)

**Web app**
8. Tenant onboarding form (AND Digital)
9. Parking occupancy view (Building Admin)

**Platform / cross-cutting**
10. Multi-tenancy & white-label theming
11. GDPR, privacy & data governance
12. Security
13. Observability & logging
14. Support model

---

## Key decisions summary

The full audit trail is in `.decision-log.md`. Below is the critical context to hold in mind while writing features.

### Product
- **What it is:** A mobile workspace booking app (iOS + Android) being rebuilt from scratch. Currently AND Digital only; the rebuild introduces multi-tenancy for the first time.
- **V1 also includes:** A lightweight React web app with two role-separated screens (AND Digital onboarding form + Building Admin parking view). Not a full admin portal — simple authenticated screens.
- **Rebuild rationale:** Deprecated package foundation (NativeBase headline); AND-specific hardcoding throughout; multi-tenancy impossible to add without rewrite.

### Scope boundaries
- **In scope v1:** Mobile app (iOS + Android), React web app (two screens), multi-tenancy, feature parity with existing app, GDPR/security/observability
- **Out of scope v1:** User-facing web booking portal, billing, floor maps, recurring bookings, calendar integration, hardware integration, dedicated company admin web interface

### Platform & tenancy
- **Single app binary** — one app on the App Store; tenant branding/config loaded at runtime. No per-tenant builds.
- **AND Digital is the platform operator** — approves new tenants, controls email domain allowlists. This is done via the onboarding form web app, not Firebase console.
- **Self-serve philosophy** — keep AND Digital's ongoing maintenance burden as low as possible.
- **V1 deadline:** End of August 2026 (2026-08-31)
- **Team:** 5 developers + 2 product people, mixed disciplines

### User roles (4 roles, v1)
| Role | Surface | Notes |
|------|---------|-------|
| End User | Mobile app | Books desks/parking for self or guests |
| Company Admin | Mobile app | Manages spaces, branding, user roles for their org |
| AND Digital (Platform Operator) | Web app | Onboards tenants; controls domain allowlists |
| Building Admin | Web app only | Views parking occupancy by date (name + company); no tenant config access |

- **Future phase (not v1):** Building Admin mobile app access; fuller company admin web interface

### Auth
- Per-tenant config: Google, Microsoft, Apple (iOS), email/password
- AND Digital controls which email domains are allowed per tenant (not the company admin)
- Current app is Google + hardcoded `@and.digital` domain — this all becomes tenant-configurable

### Design
- New mobile app should match existing screens as closely as possible
- Screenshots in `/docs/screenshots/`: `desk.png`, `desk_select.png`, `park_booked.png`
- Some additional screens will need design (login, events modal, guest booking, waitlist state, etc.)
- Tenant-specific strings ("ANDis", "Events in the clubhouse", "Booking for someone else?") become configurable — layouts and interaction patterns carry over

### NFR concerns (each needs its own requirements section)
- GDPR / privacy / data governance (holding external business data)
- Security (AppCheck, API auth, role-based access)
- Observability / logging (production-ready diagnostics for multi-tenant SaaS)
- Support model (how tenant companies get help — not yet decided, needs discussion)
- Performance / reliability (SaaS baseline)

---

## Important context from project-context.md

The full file is at `_bmad-output/project-context.md`. Key points to hold when writing features:

- **Existing features (carry forward):** Desk booking (AM/PM/All Day + waitlist + guest), Parking booking (time-window rules, per-business-unit capacity, London server time anti-manipulation), Events/Notes (admin-authored, one per day), Who's In list (real-time, sorted, reserve positions shown), Push notifications (FCM), App integrity (Firebase AppCheck)
- **Multi-tenancy gaps in current app that the rebuild must fix:** Google `hostedDomain` hardcoded to `and.digital`; "ANDi" terminology; `BusinessUnit` enum hardcoded; parking capacity keys tied to current BU names; all branding hardcoded
- **Data models:** User, Booking, Note — structures are in `project-context.md` and should inform FR definitions
- **Tech stack (for addendum, not PRD):** React Native, Firebase (Firestore, Auth, Functions, Remote Config, AppCheck, FCM), Redux Toolkit, React Navigation, Fastlane CI/CD — new repo upgrades all packages to latest

---

## Suggested approach for the Features session

For each feature group:
1. Ask Ashley's colleague to confirm or add to what's already known (don't just write from the project-context)
2. Use open-ended prompts: "Tell me how [feature] should work for [user role]" — don't present multiple-choice options
3. Write FRs as capabilities, not implementation — tech choices go in `addendum.md`
4. Use globally numbered stable IDs: FR-001, FR-002, etc. (start from 001 — none written yet)
5. For any decision made, log it to `.decision-log.md` immediately

Good luck!
