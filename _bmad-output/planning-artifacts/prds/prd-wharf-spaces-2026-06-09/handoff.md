# PRD Handoff — Wharf Spaces Rebuild

**Status: EPICS IN PROGRESS — Epic 1 written as of 2026-06-16**
**PRD workspace:** `_bmad-output/planning-artifacts/prds/prd-wharf-spaces-2026-06-09/`
**Files:** `prd.md` (status: final), `addendum.md`, `.decision-log.md` (DL-001–DL-054), `review-rubric.md`, `handoff.md`

---

## What was completed

### PRD (sessions 1–4, 2026-06-09 to 2026-06-15)

All 6 finalize steps completed across sessions 3–4 (2026-06-12 and 2026-06-15).

Key decisions in final session (2026-06-15):
- Email/password removed from v1 auth providers (DL-048)
- GDPR: immediate hard delete acceptable on tenant removal (DL-049)
- App name: ParkANDPerch, pending marketing sign-off (DL-050)
- Users must be assigned to a group when added to allowlist (DL-051)
- Default group auto-created on tenant provisioning (DL-052)
- Google OAuth elevated scopes dropped — allowlist model makes them unnecessary (DL-053)

### Architecture (session 5, 2026-06-16)

Architecture document completed and validated. Saved to:
**`_bmad-output/planning-artifacts/architecture.md`** (status: complete)

Key architectural decisions made:
- **Firestore tenancy model:** Subcollections per tenant (`tenants/{tenantId}/bookings`, etc.) — structural isolation, simpler GDPR deletion
- **Tenant ID in custom claims:** `{ tenantId, role }` set by `createUser` Function; read by all Functions and Security Rules — no per-request Firestore lookup
- **Tenant domain resolution:** Pre-auth Cloud Function `resolveProvider` (AppCheck-protected); `domains/` collection not readable by clients
- **Waitlist promotion trigger:** Firestore `onDocumentDeleted` (decoupled from cancellation — cancellation always succeeds regardless of promotion result)
- **Nightly reallocation job:** Cloud Scheduler → Pub/Sub → `runNightlyReallocation` Function (21:00 Europe/London)
- **Microsoft auth:** Firebase OIDC provider + `signInWithCredential` — no MSAL library needed
- **Theme token system:** React Context + StyleSheet factory (`useTheme()` hook); no hardcoded hex values anywhere
- **Two Firebase projects:** `parkandperch-dev` and `parkandperch-prod`
- **Web admin:** Vite + React + TypeScript + React Router v7 → Firebase Hosting
- **Status:** READY FOR IMPLEMENTATION (40/40 FRs covered, all 5 NFRs covered, no critical gaps)

### Epics & Stories (session 5, 2026-06-16)

Epics document started. Saved to:
**`_bmad-output/planning-artifacts/epics.md`** (status: in progress — Epic 1 of 5 written)

5 epics approved:
- **Epic 1: Project Foundation & Infrastructure** — ✅ 6 stories written
- **Epic 2: Tenant-Aware Authentication** — FRs: FR-001–003, FR-005, FR-035, FR-036
- **Epic 3: Desk Booking & Core Booking Experience** — FRs: FR-006–014, FR-020–022, FR-024–030
- **Epic 4: Parking Booking** — FRs: FR-015–019, FR-040
- **Epic 5: Web Platform — Tenant Management** — FRs: FR-031–034, FR-037–039

---

## What's next

Continue **`bmad-create-epics-and-stories`** — the workflow will detect the existing `epics.md` and resume at Epic 2.

Epics 2–5 still need stories written (~32 stories remaining across 4 epics).

After all stories are written → **`bmad-check-implementation-readiness`** to validate PRD + Architecture + Epics are aligned before implementation begins.
