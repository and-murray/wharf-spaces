# PRD Handoff — Wharf Spaces Rebuild

**Date left off:** 2026-06-11
**PRD workspace:** `_bmad-output/planning-artifacts/prds/prd-wharf-spaces-2026-06-09/`
**Files in workspace:** `prd.md`, `.decision-log.md`, `handoff.md` (this file)

---

## How to resume

1. Open Claude Code in this project
2. Run `/bmad-prd`
3. When prompted, choose **Resume** the `prd-wharf-spaces-2026-06-09` workspace
4. Tell Claude: *"I'm picking up a handoff — please read handoff.md in the PRD workspace before we continue"*
5. Pick up at **Finalize** (see next steps below — all feature groups are complete)

---

## What's been completed

### Vision section ✅
Written in `prd.md` — problem statement, goal, V1 deliverables, user roles, success criteria.

### Scope section ✅
In-scope and out-of-scope lists confirmed. **Note:** Building Admin parking occupancy view moved to out of scope during this session (was previously in scope).

### All feature groups ✅ (FR-001 through FR-039)

| Group | Section | FRs | Status |
|-------|---------|-----|--------|
| 1 | Authentication & Onboarding | FR-001 – FR-006 | ✅ |
| 2 | Desk Booking | FR-007 – FR-014 | ✅ |
| 3 | Parking Booking | FR-015 – FR-019 | ✅ |
| 4 | Events & Notes | FR-020 – FR-023 | ✅ |
| 5 | Who's In List | FR-024 – FR-027 | ✅ |
| 6 | Push Notifications | FR-028 – FR-030 | ✅ |
| 7 | Company Admin Mobile | — | Collapsed into FR-019 (guest parking only) |
| 8 | Web Platform — Tenant Management | FR-031 – FR-034 | ✅ |
| 9 | Building Admin Parking View | — | Out of scope v1 |
| 10 | Multi-tenancy & White-label Theming | FR-035 – FR-039 | ✅ |

### NFR sections ✅

| Section | Status |
|---------|--------|
| NFR-1 GDPR & Privacy | ✅ |
| NFR-2 Security | ✅ |
| NFR-3 Observability & Logging | ✅ |
| NFR-4 Support Model | ✅ |

### Open questions (3 outstanding)

- **OQ-001** — Email/password verification method (OTP or email link). Revisit before architecture.
- **OQ-002** — Data retention obligations on permanent tenant removal (GDPR). Revisit before GDPR section finalised.
- **OQ-003** — New app name (replacing AND Digital-specific name). Revisit before public-facing copy.

---

## What's next — Finalize

All feature content is written. The next session should run through the **Finalize** sequence in order:

1. **Decision log audit** — walk `.decision-log.md` with the user; confirm each decision is captured in `prd.md` or noted for the addendum. DL-001 through DL-035 are all logged.

2. **Input reconciliation** — check `prd.md` against the original inputs (project-context.md, screenshots in `/docs/screenshots/`) for any gaps or qualitative ideas that were silently dropped.

3. **Reviewer pass** — run the PRD quality rubric against `prd.md`. Surface critical and high findings; resolve before polish.

4. **Triage open items** — work through OQ-001, OQ-002, OQ-003. Determine which are phase-blockers (would make the PRD unsafe for architecture/epics) and which can be deferred with an owner and revisit condition.

5. **Polish** — structural review then prose pass on `prd.md`.

6. **Close** — set `prd.md` frontmatter `status: final`, record finalisation to `.decision-log.md`, share artifact paths. Common next step after finalize: `bmad-create-architecture` or `bmad-create-epics-and-stories`.

---

## Key decisions summary (updated 2026-06-11)

The full audit trail is in `.decision-log.md` (DL-001 through DL-035). Below is the critical context needed to continue.

### Product
- Mobile workspace booking app (iOS + Android) rebuilt from scratch with multi-tenancy from day one
- V1 also includes a React web app for AND Digital tenant management (onboarding, suspension, removal)
- Building Admin parking occupancy view is **out of scope v1**

### Scope
- **In scope v1:** Mobile app, web platform (AND Digital tenant management), multi-tenancy, feature parity, GDPR/security/observability
- **Out of scope v1:** Building Admin parking view, user-facing web booking portal, billing, floor maps, recurring bookings, calendar/hardware integrations

### Platform & tenancy
- Single app binary — branding and config loaded at runtime per tenant
- AND Digital provisions tenants (domain, auth provider, first admin) via web platform
- Company Admin configures their own branding, groups, capacity, booking rules, and user allowlist via web platform
- Company Admin mobile capability: guest parking only (no dedicated admin mobile UI)

### User roles (v1)
| Role | Surface | Notes |
|------|---------|-------|
| End User | Mobile app | Books desks/parking for self or guests |
| Company Admin | Mobile app + web | Guest parking on mobile; full config on web |
| AND Digital (Platform Operator) | Web app | Provisions and manages tenants |
| Building Admin | Out of scope v1 | — |

### Auth & access
- Per-tenant auth provider config (Google, Microsoft, Apple, email/password)
- Individual allowlist model — Company Admin adds users by email via web platform
- Users not on allowlist: "please contact your company administrator" — cannot proceed
- Email/password requires verification (method TBD — OQ-001)
- Demo login mode exists for App Store reviewers (not visible to end users)
- First sign-in → straight to booking screen + push notification permission prompt

### Key feature decisions
- **Waitlist auto-books:** When a cancellation opens capacity, the next waitlisted user is automatically booked and notified
- **Events/notes:** Any user can create/edit the shared daily note (not admin-only); one note per day per tenant
- **isOfficeClosed:** Field preserved in data model, not surfaced in v1 UI
- **Parking booking window rules:** Tenant-configurable (not AND Digital-hardcoded)
- **Parking capacity:** Per-tenant groups with per-group allocations (replaces hardcoded BusinessUnit enum)
- **Who's In member term:** Tenant-configurable (replaces "ANDis"); section headers ("Who's in?" / "Who's parking?") are fixed strings

### GDPR & privacy
- User removal triggers data deletion (personal data + booking history)
- Right to erasure handled manually by AND Digital/Company Admin in v1
- Permanent tenant removal capability exists in v1; data retention obligations TBD (OQ-002)

### Configurable tenant strings (carried through all feature groups)
| Current string | In rebuild |
|----------------|-----------|
| "Events in the clubhouse" | Tenant-configurable (default: "Events in the office") |
| "ANDis" | Tenant-configurable member term |
| App name | TBD — OQ-003 |
| "Who's in?" / "Who's parking?" | Fixed strings (not configurable) |

---

## Important context from project-context.md

Full file at `_bmad-output/project-context.md`. Key points:

- **Existing features (carry forward):** Desk booking (AM/PM/All Day + waitlist + guest), Parking booking (time-window rules, per-BU capacity, London server time anti-manipulation), Events/Notes, Who's In list (real-time, sorted, reserve positions shown), Push notifications (FCM), App integrity (Firebase AppCheck)
- **Tech stack (for addendum, not PRD):** React Native, Firebase (Firestore, Auth, Functions, Remote Config, AppCheck, FCM), Redux Toolkit, React Navigation, Fastlane CI/CD
- **Screenshots:** `/docs/screenshots/desk.png`, `desk_select.png`, `park_booked.png`