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
| **Building Admin** | Web app | Views a list of people parked on a given date across all tenants; no access to tenant config |

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
- React web app: tenant onboarding form (AND Digital) + parking occupancy view (Building Admin)
- Multi-tenancy: tenant isolation, per-tenant branding, auth provider config, space allocation
- Feature parity with existing app: desk booking, parking booking, events/notes, who's in list, push notifications
- GDPR compliance, security, and production-ready observability

### Out of scope — V1
- User-facing web portal for bookings
- Billing and subscription management
- Building admin role in the mobile app
- Floor maps and visual space selection
- Recurring bookings
- Calendar integrations
- Hardware integrations
- Dedicated company admin web interface (admin manages via mobile app only in v1)

---

## 3. Features

_Section in progress — populated during coaching path session._

---

## Open Questions

_Populated during Discovery and Finalize._

---

## Non-Functional Requirements

_Section in progress._
