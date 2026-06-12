---
title: "PRD Quality Review — Wharf Spaces Rebuild"
created: 2026-06-12
reviewer: automated rubric
---

# PRD Quality Review — Wharf Spaces Rebuild

## Overall verdict

The PRD has a clear thesis, a well-bounded scope, and a credible feature set. Its structural weaknesses cluster in one place: done-ness clarity. Roughly a third of the FRs read as intent statements ("the system must remain consistent," "must feel responsive") rather than implementable contracts, which will generate avoidable back-and-forth during story creation. Fix the done-ness gaps and resolve the two open questions that gate architecture, and this is ready to feed downstream work.

---

## 1. Decision-readiness — adequate

The problem statement is honest and specific: deprecated dependencies, hardcoded tenant data, inability to scale. The goal is stated in terms a stakeholder can evaluate ("shippable to multiple companies"). Success criteria are behavioural and grounded — multiple tenants onboarded, reduced firefighting, self-serve onboarding. These hold up.

The Users table introduces a Building Admin role that is immediately struck out of scope, which is useful — a decision-maker can see the boundary was considered and deliberately deferred. The V1 Out of Scope list is substantive and ordered in a way that implies a release sequence, which aids prioritisation conversations.

Two things weaken decision-readiness. First, the open questions (OQ-001, OQ-002, OQ-003) carry "Owner: TBD" for all three — there is no named person accountable for resolving them before the revisit conditions are met. This means it is possible to start architecture without OQ-001 being resolved, and nobody is on the hook. Second, the success criteria have no measurability threshold: "materially reduced maintenance overhead" and "self-serve enough" are directional but not falsifiable. A decision-maker cannot use these to determine whether V1 shipped successfully vs. just shipped.

### Findings

- **high** Missing owner on all three open questions (§ Open Questions) — OQ-001, OQ-002, OQ-003 all list "Owner: TBD." Without a named owner, the revisit conditions become aspirational rather than committed. *Fix:* Name an owner for each; at minimum, OQ-001 must be resolved before architecture begins.
- **medium** Success criteria are not falsifiable (§ 1 Vision / Success) — "materially reduced" and "self-serve enough" cannot be evaluated post-launch. *Fix:* Add a measurable proxy for each criterion (e.g. "fewer than N manual Firebase interventions per month" or "new tenant can be onboarded without AND Digital engineering involvement").

---

## 2. Substance over theater — strong

The PRD earns its content. There is no boilerplate that exists only to fill a section. The NFRs, in particular, demonstrate genuine thought: NFR-2 separates AppCheck integrity from user identity authentication and names the two-header enforcement pattern explicitly; NFR-5 calls out the concurrent booking correctness problem as the expected morning-window load pattern rather than leaving it as generic "high availability." The decision to consciously accept Firebase's native availability rather than own an uptime SLA is documented and justified.

The addendum's role is correctly understood — it holds depth that belongs in downstream documents and clearly labels each entry with its intended audience. This is a rare and useful discipline.

The one area where substance thins is FR-023 (`isOfficeClosed`). The feature is listed, noted as out of scope, and instructed to be preserved in the data model — but the instruction is given to the wrong document. A data model preservation instruction belongs in the architecture spec (which the addendum correctly addresses in A-002), not the PRD. In the PRD it reads like a half-formed thought.

### Findings

- **low** FR-023 is a data model instruction in a requirements document (§ 3.4 Events & Notes) — the PRD says "the data model should preserve the field." That is an architecture instruction. The PRD only needs to say the feature is deferred; the model note belongs in the addendum or architecture doc. *Fix:* Trim FR-023 to one sentence: "isOfficeClosed is out of scope for v1." Move the model preservation note to A-002 or the architecture spec.

---

## 3. Strategic coherence — strong

The PRD has a thesis: multi-tenancy and white-label theming, built in from day one, using Firebase as the platform primitive. Every feature section is in service of this thesis. The multi-tenancy thread runs consistently from FR-001 (per-tenant sign-in providers) through FR-011 (per-tenant capacity), FR-017 (tenant-configurable booking window rules), FR-018 (per-tenant groups), FR-037 and FR-038 (admin config). There are no features that appear to be included because they existed before without a coherent connection to the V1 goal.

The Building Admin deferral is strategically coherent and the rationale is implicit: parking occupancy data visibility is a cross-tenant concern that requires the multi-tenant foundation to be solid first. The fact that the User table explains the role exists but is deferred prevents a downstream "why isn't this in scope?" question.

The one coherence note: the addendum (A-001) surfaces the Google OAuth scopes question — whether `contacts.readonly` and `user.organization.read` are still needed given the shift to the allowlist model. This is not just an architecture question; it is a strategic one. If these scopes can be dropped, the allowlist model is substantively simpler to justify to app stores. This question arguably belongs as an open question in the PRD body, not just a note for architects.

### Findings

- **medium** OAuth scope review omitted from PRD-level open questions (§ addendum A-001) — whether the allowlist model makes the two elevated Google OAuth scopes redundant affects what AND Digital needs to justify to the App Store. This is a product-level decision, not just an architecture detail. *Fix:* Add OQ-004 to the Open Questions section flagging that these scopes must be reviewed before App Store submission prep begins.

---

## 4. Done-ness clarity — thin

This is the weakest dimension and the one story creation leans on hardest. The majority of FRs describe what the system will do at a feature level but do not describe what a working implementation looks like in enough detail to write acceptance criteria. Specific problems:

**NFR-5 — Performance & Reliability** is the most egregious example. "Must feel responsive," "perceptible without an uncomfortable wait," and "must update without a user-initiated refresh" are product intent statements, not implementable requirements. An engineer implementing against these has no threshold to code to and no objective test to run. Under what conditions? What is the timeout budget? What is "real-time" — polling interval, Firestore listener, or something else?

**FR-012 — Waitlist** is partially specified but incomplete as a contract. It says the next user on the waitlist is "automatically booked" when a cancellation creates a slot. It does not specify: what happens when a booking is cancelled and there are multiple waitlisted users from different slots (AM user cancels, waitlist has an All Day and a PM — who is promoted?); what happens if the automatically promoted user's device is unreachable for notification; whether the waitlist promotion is transactional (what happens on partial failure).

**FR-040 — Nightly cross-group parking reallocation** partially addresses this for the nightly process (9pm server time is specified, allocation order by waitlist order is specified) but the same partial-failure question applies: what is the expected behaviour if the job runs and 3 of 5 allocated users cannot receive notifications?

**FR-022 — Concurrent edit warning** says the user is shown a warning "before their save is applied" if the note is modified externally. It does not say what the warning contains (overwrite anyway / discard changes), whether it is a blocking dialog or a toast, or what "externally modified" means as a detectable condition. This will be designed by accident.

**FR-017 — Tenant-configurable booking window rules** says "how far ahead users can book, and any time-of-day cutoffs" are configurable. It does not define the configuration schema (number of days ahead? specific date? rolling window?), minimum or maximum bounds, or how conflicts between window rules and existing bookings are resolved when an admin changes the window retroactively.

**FR-031 — Tenant provisioning** says the form captures "domain name, authentication provider configuration, and the email address of the first Company Admin." "Authentication provider configuration" is doing a lot of work — does this mean selecting a provider from a list? Providing OAuth client credentials? Configuring allowed email domains? This is the core multi-tenancy setup action and it is underspecified.

**FR-035 — Tenant data isolation** says data is "fully isolated" — this is a requirement, not a specification. How isolation is enforced (Firestore security rules, Cloud Functions server-side validation, collection-per-tenant vs. document-level tenant field) is architecture, but the PRD should state the isolation promise precisely enough that an architect can verify their design satisfies it. "Cannot see or interact with" is directional, not testable.

### Findings

- **critical** NFR-5 performance thresholds are untestable (§ NFR-5 Performance & Reliability) — "feel responsive," "perceptible without an uncomfortable wait," and "must update without a user-initiated refresh" cannot be implemented to or tested against. *Fix:* Replace with threshold statements: a booking or cancellation action must complete (success or failure response rendered) within X seconds under normal conditions; Who's In list must reflect changes within Y seconds of the triggering booking event; define "normal conditions" (e.g. single-region, cellular or Wi-Fi, <50 concurrent users per tenant).
- **critical** FR-012 waitlist promotion logic is incomplete (§ 3.2 Desk Booking) — cross-slot cancellation behaviour (All Day vs. AM/PM) and partial-failure handling (notification failure on promotion) are unspecified. *Fix:* Add: which slot types are eligible for promotion when a booking is cancelled (exact matching or any overlapping slot); what the system does if notification delivery fails (booking still occurs; notification is best-effort); whether promotion is atomic.
- **high** FR-031 authentication provider configuration is underspecified (§ 3.7 Web Platform) — "authentication provider configuration" in the provisioning form is the core multi-tenancy setup action and could mean three different things. *Fix:* Enumerate exactly what AND Digital enters per provider: which providers can be selected; what credentials (if any) must be supplied; whether email domain restriction is set here or separately.
- **high** FR-022 concurrent edit warning is underspecified (§ 3.4 Events & Notes) — the warning's options and blocking vs. non-blocking nature are unspecified. A UX designer cannot design this screen. *Fix:* Specify: the warning presents two options (overwrite / discard); it is a blocking modal dialog; the conflict detection mechanism is a server-side last-modified timestamp check.
- **high** FR-017 booking window configuration schema is absent (§ 3.3 Parking Booking) — "how far ahead users can book, and any time-of-day cutoffs" is a description of intent, not a configurable parameter set. *Fix:* Define the configuration model: rolling-days-ahead count (integer, e.g. 7 days); daily cutoff time (HH:MM, server timezone); what happens to existing bookings if an admin reduces the window retroactively.
- **medium** FR-040 notification failure behaviour on nightly reallocation (§ 3.3 Parking Booking) — the nightly job is well-specified as to timing and order, but notification failure is not addressed. *Fix:* Confirm notification is best-effort (booking proceeds regardless of delivery); the allocated user can see their booking in-app on next open.
- **medium** FR-035 isolation promise is non-testable as written (§ 3.8 Multi-tenancy) — "cannot see or interact with" is the right intent but not the right form for a security requirement. *Fix:* Restate as: a request authenticated with a Tenant A user token must return a 403 (or equivalent) when accessing any Tenant B data path, verified by security test.

---

## 5. Scope honesty — strong

The Out of Scope list is explicit and substantive. The Building Admin deferral is called out in the Users table with an explicit note, which means it cannot be missed by a reader who only scans section headers. Recurring bookings, calendar integrations, floor maps, billing — these are the obvious "what about..." questions and they are all named.

The FR-023 (`isOfficeClosed`) treatment models good scope honesty — the feature is deferred but visible, with an instruction to preserve the hook for the next version.

One gap: there is no explicit statement about what happens to existing AND Digital data (bookings, notes, user records) during the rebuild. Is this a migration or a fresh start? If AND Digital users are migrated, there are data model implications; if it is a clean start, existing bookings are lost. For a rebuild (not a new product), this is a meaningful scoping decision. The addendum notes the `isClubhouseClosed` field rename but this is a detail within a larger unaddressed question.

### Findings

- **high** Migration vs. fresh-start not addressed (§ 2 Scope) — for a rebuild of a live internal app with existing users and booking history, the absence of any statement about data migration is a meaningful omission. *Fix:* Add a single explicit statement to Scope: either "Existing AND Digital data is migrated to the new multi-tenant data model as part of V1" or "V1 launches with clean data; historical bookings are not migrated." This gates architecture decisions.
- **low** Scope list does not address reporting/export (§ 2 Scope) — there is no mention of data export, usage reporting, or admin dashboards. Given the NFR-3 analytics instrumentation, a Company Admin might reasonably expect a usage view. Explicitly calling this out of scope prevents the question from arising during story creation. *Fix:* Add "Analytics dashboards and data export (Company Admin and Platform Operator)" to the Out of Scope list.

---

## 6. Downstream usability — adequate

**Architecture** can source-extract cleanly from the security (NFR-2) and GDPR (NFR-1) sections. The Firebase primitives (AppCheck, Crashlytics, Analytics, Firestore, Cloud Functions by implication) are named. The addendum correctly surfaces the two architecture-relevant questions (OAuth scopes, field rename) and labels them clearly. The nightly reallocation job (FR-040) implies a Cloud Function or Cloud Scheduler trigger — this is derivable.

**UX** can extract the booking interaction model (FR-007 through FR-016), Who's In display (FR-024 through FR-027), and notification permission flow (FR-006, FR-028). The addendum's A-003 is an explicit and useful pointer to copy tone and the screenshot references. However, several screens that a UX designer needs to produce are absent from the PRD: the note editing modal (FR-021 names it but does not describe it), the allowlist management interface (FR-032), and the tenant provisioning form (FR-031). For UX these are significant gaps.

**Story creation** is the most constrained downstream consumer. As noted in dimension 4, NFR-5 and several FRs lack acceptance-level detail. Story creation can use the FR IDs as reference anchors (the ID scheme is consistent and complete), but will need to invent acceptance criteria for roughly 30% of the FRs rather than derive them — which means the first sprint review will surface misalignments.

### Findings

- **high** Web platform UX inputs are too thin for UX design (§ 3.7 Web Platform) — FR-031 through FR-034 describe the web platform in two-to-three sentences each. A UX designer cannot produce wireframes for the provisioning form, the allowlist management view, or the suspension/removal flows without significant guesswork. *Fix:* Expand FR-031 and FR-032 to describe the primary user action sequence (not full wireframes — just: what does the operator see on the provisioning form; what does the allowlist view look like in bulk vs. individual modes; what is the confirmation pattern for suspension vs. permanent deletion).
- **medium** Note editing modal not described (§ 3.4 Events & Notes) — FR-020 references a "tappable banner" and FR-021 references an "edit modal" and "saving with text / saving with empty field" but the modal is never described. UX will design this from scratch. *Fix:* Add a brief description of the edit modal: it is a full-screen or sheet overlay with a text input field, a Save and a Cancel action; saving with empty text deletes the note with a confirmation prompt or immediately (specify).
- **low** FR-025 guest booking row format is specified but the host attribution display for desk vs. parking is not distinguished — the format "[Host's name]'s Visitor N" applies to desk (FR-013) but FR-019 (admin-only guest parking) uses the same format by implication without stating it. *Fix:* Confirm guest parking rows follow the same display format as guest desk rows, or specify if different.

---

## 7. Shape fit — strong

The PRD is a capability specification, not a user-journey specification, and this is the right shape for an internal tool with three distinct roles where features are understood by capability rather than workflow. The section structure (Authentication, Desk, Parking, Events, Who's In, Notifications, Web Platform, Multi-tenancy) maps cleanly to epics and is a natural source for story creation.

The addendum is the right shape for its role — it is clearly a companion document, not a dumping ground, and each entry is labelled with its intended downstream audience. This pattern should be maintained as architecture and UX questions surface additional depth.

The NFR structure is appropriate. Placing GDPR and Security as NFR-1 and NFR-2 signals priority correctly for a multi-tenant product. The deliberate acceptance of Firebase availability (NFR-5) rather than a product-owned SLA is a shape decision that reflects genuine maturity.

No shape findings.

---

## Mechanical notes

**ID continuity:** FR-001 through FR-039 are sequential. FR-040 (nightly reallocation) appears in section 3.3 after FR-019 in document order — this is not an error but may cause confusion when FRs are referenced out of order. Future additions should continue from FR-041.

**Glossary drift risk:** The PRD uses "tenant" and "company" interchangeably in some places (e.g., FR-033 "AND Digital can suspend a tenant" vs. FR-037 "Company Admins configure their tenant's branding"). This is unlikely to cause real confusion but should be settled before the architecture spec is written. Recommend: "tenant" for the platform concept (data isolation unit); "company" for the business entity.

**Open question cross-referencing:** OQ-001 through OQ-003 are referenced inline in the FRs (FR-003, FR-034, FR-039 respectively). FR-040 does not have a corresponding open question for the notification failure behaviour question identified above — if that is added, it should be OQ-004 or noted in FR-040 inline.

**Addendum linkage:** The addendum does not contain a link back to the PRD and the PRD does not reference the addendum. For tooling that processes these files independently (e.g. a story generator reading `prd.md` only), the addendum contents may be missed. *Recommendation:* Add a "See also: addendum.md" note to the PRD's closing section, and add "Companion to: prd.md" in the addendum frontmatter.
