---
title: "Wharf Spaces — Rebuild PRD Addendum"
status: draft
created: 2026-06-12
updated: 2026-06-15
companion_to: prd.md
---

# Wharf Spaces — Rebuild PRD Addendum

This file preserves depth that belongs in downstream documents (architecture, solution design, UX spec) or earned a place in the record but does not fit the PRD itself. It is a companion to `prd.md`, not a replacement.

---

## A-001 — Google OAuth Scopes (resolved: drop both)

**For:** Architecture / backend spec

Google Sign-In in the existing app requires two OAuth scopes beyond the default:

- `contacts.readonly` — used to look up user contacts during sign-in
- `user.organization.read` — used to read the user's Google Workspace organisation membership

**Decision:** Both scopes are dropped in the rebuild. The allowlist model (FR-002) replaces the need for contact or organisation lookup — access is determined by the Company Admin's allowlist, not by the user's Google contacts or org membership. Requesting these scopes in the rebuild is unnecessary and would require additional App Store and Play Store justification with no benefit.

**Source:** `project-context.md`

---

## A-002 — Field name: `isClubhouseClosed` → `isOfficeClosed`

**For:** Architecture / data migration spec

The existing app and Firestore data model use the field name `isClubhouseClosed` on the Note document. The PRD uses `isOfficeClosed` (FR-023) — this is the intended name for the rebuild, reflecting the removal of AND Digital-specific terminology.

The architect should account for this rename when planning the data migration or Firestore schema for the rebuild. If existing Note documents are migrated rather than recreated, a field rename migration step is required.

**Source:** `project-context.md`

---

## A-003 — Product voice and inline copy

**For:** UX spec / design

The existing app has a distinctive conversational tone that should be carried into the rebuild as a conscious design decision, not accidentally dropped. Examples observed in screenshots:

- **Booking confirmation state:** "You've Booked!" — celebratory, not functional
- **Inline edit hint (parking booked state):** "To edit the time of your booking, just press the new time slot that you would like to change it to." — instructional, conversational, avoids modal flows
- **Empty state copy:** "Be the first to book a desk/parking space!" — encouraging, not neutral

FR-016 captures the booked state and slot-switching behaviour, but not the tone or the inline hint pattern. The UX designer should use the existing screenshots (`/docs/screenshots/`) as the reference for copy tone and inline instructional patterns across all booking states.

**Source:** `docs/screenshots/park_booked.png`, `docs/screenshots/desk.png`, `docs/screenshots/desk_select.png`
