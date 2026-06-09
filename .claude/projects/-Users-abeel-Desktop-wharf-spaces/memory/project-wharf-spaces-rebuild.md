---
name: project-wharf-spaces-rebuild
description: Context for the Wharf Spaces multi-tenant rebuild — what was built, key decisions made, and docs produced
metadata:
  type: project
---

Wharf Spaces is a React Native desk/parking booking app originally built solely for AND Digital. A multi-tenant/white-label rebuild is underway targeting a new repository.

**Why:** Enable other building occupants (and potentially external orgs) to use the same product with their own branding, data isolation, and config — without a code change per tenant.

**How to apply:** When working on the new repo, the three docs in `_bmad-output/planning-artifacts/` are the primary requirements. The existing `docs/` files (epics-and-stories.md, ui-spec.md, design-tokens.md) are context for the new repo too.

## Requirements Docs Produced (2026-06-05)

All in `_bmad-output/planning-artifacts/`:
- `product-brief.md` — problem, vision, personas, scope, success metrics
- `prd.md` — full functional and non-functional requirements with IDs
- `architecture-overview.md` — TenantConfig schema, Firestore data model, auth flow, key decisions

## Key Architectural Decisions Locked In

- **Build-time tenancy** via `TENANT_ID` env var — each tenant gets their own binary
- **Single Firebase project** — Firestore rules enforce isolation via `tenantId` custom claim
- **NativeBase removed** — custom component library themed from TenantConfig
- **Google Sign-In only** in v1
- **Bank holiday blocking removed** — UK-specific; admins manage closures via Notes
- **No per-tenant member label** — all tenants use generic "members" in Who's In count pill
- **`TenantConfig.welcomeHeading`** replaces hardcoded "Ey up!" (tenants set their own)
- **`role` field never client-writable** — Cloud Function sets it on first sign-in

## AND Digital Hardcodings to Clean Up in New Repo

- `epics-and-stories.md` Story 9.2 still references "ANDi/ANDis" — update to "members"
- `ui-spec.md` Story 4.5 still has "Ey up!" — update to use `TenantConfig.welcomeHeading`
- `MurrayButton` component name → generic `Button`
- Firebase project IDs `murray-apps-dev` / `murray-apps` → tenant-specific
