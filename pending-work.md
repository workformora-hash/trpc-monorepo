# Pending Work - Typeform-like Product

## 1. Product Identity and Documentation
- [ ] Replace starter README with a real project README for this product.
- [ ] Add complete setup guide (env vars, DB migrate, run web/api, test commands).
- [ ] Add live demo URL, API docs URL, and demo credentials in README.
- [ ] Fix inconsistent naming/branding (`Streamyst`, `FormBuilder`, `Typeform-like`) across API + web.
- [ ] Add architecture + feature matrix in README (what is implemented vs planned).

## 2. Public Product Surface (Typeform-style)
- [ ] Add dedicated public pages for `Explore` (public forms) and `Templates` (not only dashboard tab).
- [ ] Add a first-class API docs link in navbar/footer that points to real Scalar docs URL.
- [ ] Add better public form discovery UX (categories, search, sorting, featured forms).
- [ ] Improve landing-to-signup funnel and clear product messaging.

## 3. Form Builder UX Completion
- [ ] Replace placeholder/fake behaviors in builder tabs with real backend wiring.
- [ ] Workflow tab: fully connect conditional logic rules CRUD to UI interactions.
- [ ] Connect tab: remove fake HubSpot/Zapier states or implement real integrations + OAuth/config.
- [ ] Share tab: add QR code generation and robust copy/share actions.
- [ ] Add field reordering and better drag/drop UX if not already exposed in UI.
- [ ] Add form preview mode before publishing.

## 4. Analytics and Results Accuracy
- [ ] Remove mocked analytics math in UI (for example derived fake totals/completion rates).
- [ ] Use real tracked metrics from backend (`views`, `submissions`, `completion`, per-question stats, geo stats).
- [ ] Add analytics charts and date-range filtering.
- [ ] Add response filtering, pagination, and export UX improvements.

## 5. Templates and Theme Gallery
- [ ] Build full template gallery page with categories and preview.
- [ ] Expose "create from template" flow in creator UX prominently.
- [ ] Add at least 3 strong themed templates with polished question sets and visuals.
- [ ] Add theme gallery with clear visual previews and consistent style tokens.

## 6. Demo Readiness (Hackathon/Judging Critical)
- [ ] Add deterministic seed scripts for users, forms, responses, analytics data.
- [ ] Include demo credentials that always work in deployed environment.
- [ ] Ensure deployed app is judge-friendly (no manual setup required).
- [ ] Add smoke-check steps for demo verification.

## 7. Reliability and Security Hardening
- [ ] Validate rate limiting and anti-spam behavior end-to-end in production-like setup.
- [ ] Add abuse controls for public form endpoints (bot/duplicate protections).
- [ ] Improve error states for invalid/unpublished/expired/password-protected links.
- [ ] Add audit logs and monitoring hooks around submission, auth, and publish flows.

## 8. Deployment and Operations
- [ ] Add production deployment config/docs for both `apps/web` and `apps/api`.
- [ ] Standardize environment variable contracts across packages.
- [ ] Add CI pipeline for typecheck + lint + tests.
- [ ] Add post-deploy sanity checks for API docs, auth, form submission, analytics.

## 9. Testing Gaps to Close
- [ ] Add end-to-end tests for critical journeys:
  - [ ] signup/login
  - [ ] create form -> add fields -> publish
  - [ ] public submission -> thank-you screen
  - [ ] responses + analytics visibility
- [ ] Add frontend component/integration tests for builder and public form flows.
- [ ] Add regression tests for conditional logic, password-protected forms, and visibility modes.

## 10. Product Polish
- [ ] Improve mobile responsiveness for complex dashboard/builder screens.
- [ ] Standardize design tokens and eliminate rough visual inconsistencies.
- [ ] Add empty/loading/error/success states consistently across all major screens.
- [ ] Improve accessibility (labels, contrast, keyboard nav, focus states, ARIA).

---

## High-Priority First Slice (Recommended)
- [ ] Ship real README + demo links/credentials.
- [ ] Launch public Explore/Templates pages.
- [ ] Replace fake analytics with real metrics.
- [ ] Seed demo-ready data and verify deployed flow.
- [ ] Final polish + E2E pass.