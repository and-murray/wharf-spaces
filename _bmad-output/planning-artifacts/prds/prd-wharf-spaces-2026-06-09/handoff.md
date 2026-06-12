# PRD Handoff — Wharf Spaces Rebuild

**Date left off:** 2026-06-12
**PRD workspace:** `_bmad-output/planning-artifacts/prds/prd-wharf-spaces-2026-06-09/`
**Files in workspace:** `prd.md`, `addendum.md`, `.decision-log.md`, `review-rubric.md`, `handoff.md` (this file)

---

## How to resume

1. Open Claude Code in this project
2. Run `/bmad-prd`
3. Choose **Resume** the `prd-wharf-spaces-2026-06-09` workspace
4. Tell Claude: *"I'm picking up a handoff — please read handoff.md in the PRD workspace before we continue"*
5. Pick up at **step 4 — Triage open items** (see below — OQ-001 is first)

---

## What's been completed

### Finalize sequence progress

| Step | Status |
|------|--------|
| 1. Decision log audit | ✅ Complete |
| 2. Input reconciliation | ✅ Complete |
| 3. Reviewer pass | ✅ Complete |
| 4. Triage open items | ⏳ Not started — pick up here |
| 5. Polish | ⏸️ Not started |
| 6. Close | ⏸️ Not started |

---

## What we did today (2026-06-12)

### Step 1 — Decision log audit
Audited DL-001–DL-035 against `prd.md`. Four issues found and resolved:
- Building Admin row in Users table annotated as out of scope v1
- NFR-5 Performance & Reliability section added (user-perceived language, no specific numbers — intentional decision)
- FR-024 updated to explicitly state "Who's in?" / "Who's parking?" are fixed strings, not tenant-configurable
- Duplicate OQ-001 removed from Open Questions section

### Step 2 — Input reconciliation
Ran a subagent against `project-context.md` and screenshots. Five gaps found:
- **FR-040 added** — nightly cross-group parking reallocation at 9pm (was entirely absent from the PRD)
- **FR-018 corrected** — removed misleading "tenant's configured rules for pooling" language
- **FR-012 expanded** — slot-matching rules on cancellation fully specified; booking promotion confirmed to stand regardless of notification delivery
- **`addendum.md` created** — captures Google OAuth scopes (A-001), isClubhouseClosed → isOfficeClosed rename (A-002), and product voice / inline copy intent (A-003)
- User auto-creation on sign-in (existing app pattern) confirmed as intentionally replaced by allowlist model — logged as DL-041

### Step 3 — Reviewer pass
Rubric run against `prd.md`. Full findings in `review-rubric.md`. All critical and high findings resolved:
- **FR-001 rewritten** — one provider per tenant (not "one or more"); domain-based tenant discovery described; Apple Hide My Email documented as known v1 constraint
- **FR-031 updated** — provisioning form fields now specified (Tenant Name, Email Domain, Provider, First Admin email)
- **FR-022 updated** — concurrent edit warning clarified as advisory only, not blocking
- **FR-017 updated** — booking window parameter defined: N days (Company Admin configurable); 12pm unlock rule is fixed
- **Scope section** — clean start confirmed; data migration explicitly out of scope
- **Section 3.7 preamble added** — web platform is a basic functional tool, low design priority
- 5 medium + 4 low findings remain in `review-rubric.md` — not blockers, address during polish

---

## What's next — Step 4: Triage open items

Three open questions remain. Work through them in order:

### OQ-001 — Email/password verification method *(phase-blocker)*
FR-003: OTP or email link for email/password sign-in verification?
- **Why it's a blocker:** Architecture cannot finalise the auth flow without this.
- **Owner:** TBD — needs a decision before architecture begins.

### OQ-002 — GDPR data retention on permanent tenant removal *(potential blocker)*
FR-034 / NFR-1: Does GDPR require a retention period before hard-deleting a permanently removed tenant's data?
- **Why it matters:** Affects whether the hard-delete capability in v1 can be used immediately, and whether a retention/delay mechanism is needed.
- **Owner:** TBD — may require legal input.

### OQ-003 — New app name *(non-blocker)*
FR-039: What is the new app name replacing the current AND Digital-specific name?
- **Why it's deferred:** Doesn't gate architecture or development, but must be resolved before public-facing copy (App Store listing, onboarding screens) is written.
- **Owner:** TBD.

After triage, run **Step 5 — Polish** then **Step 6 — Close**.

---

## Key decisions summary (updated 2026-06-12)

Full audit trail in `.decision-log.md` (DL-001 through DL-047). Below is the critical context needed to continue.

### Auth
- One auth provider per tenant (Google, Microsoft, Apple, or email/password)
- Sign-in flow: user enters email → app resolves tenant from email domain → presents that provider's sign-in journey
- Allowlist model: users must be added by Company Admin before they can sign in
- Apple Hide My Email users are unsupported in v1 (relay address breaks domain lookup) — accepted constraint
- Email/password verification method (OTP vs. email link) — **OQ-001, unresolved**

### Parking booking
- Booking window: Company Admin configures N days ahead; 12pm server-time unlock rule is fixed
- Groups: per-tenant, Company Admin configures group names and per-group parking allocation
- Cross-group reallocation: at 9pm server time, unbooked spaces across all groups pool and auto-allocate to waitlisted users from any group (equal priority, next in queue)
- Waitlist slot-matching: AM cancel → AM waitlist only; PM cancel → PM waitlist only; All Day cancel → All Day/AM/PM all eligible, can split AM+PM
- Booking promotion stands regardless of notification delivery

### Platform & data
- Clean start — no migration from existing Firestore data
- Tenant isolation enforced server-side (not client-side)
- Web platform is a basic functional tool — minimal design investment

### Open questions (3)
- **OQ-001** — Email/password verification method. Blocker for architecture.
- **OQ-002** — GDPR data retention on permanent tenant removal. Potential blocker.
- **OQ-003** — New app name. Non-blocker; needed before public-facing copy.
