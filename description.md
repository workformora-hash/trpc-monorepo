Build a production-style form builder SaaS where users can create dynamic forms, publish shareable form links and collect responses.

You will be given a Turborepo starter repository. Your job is to extend it into a complete Typeform-style product with form creation, public form filling, analytics, email flows and API documentation.

Creators should be able to create forms, add fields, configure validations, choose themes, publish/unpublish forms and share links with respondents. Respondents should be able to fill forms and submit responses without logging in.

Forms should support dynamic schemas with configurable fields, validation rules and required/optional settings. Use Zod for schema validation and tRPC for type-safe APIs. The project must use Turborepo, tRPC, Zod, Drizzle ORM and Scalar as core parts of the stack.

Forms should support two visibility modes:

Public Forms: These forms are published and can be shown on public areas of the product, such as explore pages, template galleries or featured form sections. Anyone can open and submit them.

Unlisted Forms: These forms are published but hidden from public listings. They are not shown in explore pages or galleries. Only people with the direct form link can open and submit them.

The product should also feel like a real SaaS application with:

Landing page

Pricing page

Demo-ready Deployment

API documentation

Sample seeded data

Demo Credentials

The demo should already contain sample forms, themes, responses and analytics so judges can review the product quickly. Forms should support creative themes around movies, anime, games, startups, tech companies, operating systems, events or communities.

Starter Repository
https://github.com/piyushgarg-dev/trpc-monorepo

Functional Requirements
User authentication and protected creator dashboard

Create, edit, publish, unpublish and manage forms

Dynamic fields with validations and required/optional settings

Multiple field types like text, email, number, select, checkbox, rating and date

Public and unlisted form visibility modes

Public forms should be visible in public/explore/template sections of the product

Unlisted forms should not appear publicly and should only be accessible through the direct link

Public form submission without login

Response analytics and response management

Email notification flow for creators/respondents

Landing page and pricing page

API documentation using Scalar

Demo-ready deployment with seeded data and demo credentials

Non-Functional Requirements
Use the provided Turborepo starter structure

Frontend and backend should run as separate apps inside the monorepo

Shared packages for schemas, types, utilities and API clients

Type-safe APIs using tRPC

Validation using Zod

Clean database schema design using Drizzle ORM

Rate limiting and basic spam protection for public APIs

Proper visibility checks for public, unlisted, unpublished and invalid form links

Responsive and usable UI

Proper error handling and loading states

Structured, maintainable and scalable codebase

Clear README with setup instructions, API docs and demo credentials

Bonus Features
Form preview before publishing

Conditional logic between questions

Form expiry or response limit

CSV export for responses

Charts and analytics dashboards

Custom form slugs

QR code sharing

Password-protected forms

Public explore page for public forms

Form templates and theme gallery

Response filtering and pagination

Form clone/archive support

Multi-page form experience

Admin dashboard

Better UX states and polished product experience

Rules & Guidelines
This is a solo hackathon. Team size must be exactly 1.

Participants must use the provided Turborepo starter repository.

The project must use Turborepo, tRPC, Zod, Drizzle ORM and Scalar.

Frontend and backend both are mandatory.

Frontend and backend must run as separate apps inside the monorepo.

Shared code should be managed properly using packages for schemas, types, utilities or API clients.

Authentication for creators is mandatory.

Creators should be able to create, edit, publish, unpublish and manage forms.

Forms must support dynamic fields with validation and required/optional configurations.

Forms must support at least:

short text

long text

email

number

single select

multi select

Additional field types like checkbox, dropdown, rating and date are encouraged.

Zod must be used for form schema validation and response validation.

Public users should be able to submit published forms without logging in.

Forms must support public and unlisted visibility modes.

Public forms should be visible in public-facing areas of the app such as explore pages, template galleries or featured form sections.

Unlisted forms should not appear in public-facing areas and should only be accessible through the direct form link.

Unpublished forms should not accept responses.

Invalid, unpublished or unavailable form links should be handled gracefully.

Creators should be able to view responses and analytics for their forms.

The project must include at least 3 themed sample forms with seeded responses and analytics data.

The application must include:

landing page

pricing page

deployed demo

API documentation

demo credentials

Real payment integration is not required.

The form submission flow should end with a proper confirmation or thank-you screen.

Email notifications for creators/respondents are encouraged.

Rate limiting must be implemented for public response submission APIs.

API documentation using Scalar is required.

Demo credentials and API documentation links must be included in the README.

The deployed demo should be judge-friendly and should not require manual setup to review the project.

Both frontend and backend code must be maintained inside one single GitHub repository.

Final submission must include:

public GitHub repository

deployed project link

demo credentials

API documentation link

proper README

Broken deployments, invalid credentials or inaccessible demos may affect evaluation.

Plagiarized, copied or low-effort AI-generated submissions without understanding or implementation effort will be disqualified.