# Typeform Monorepo

This repository is a Turborepo-based full-stack Typeform-like project with frontend, backend, and shared packages.

## Overview

- `apps/api` - backend service package
- `apps/web` - Next.js frontend application
- `packages/database` - database schema, helpers, and Drizzle setup
- `packages/email` - email templates and email service logic
- `packages/eslint-config` - shared ESLint configuration
- `packages/logger` - shared logging utilities
- `packages/services` - core business logic and Vitest tests
- `packages/trpc` - shared tRPC client/server code
- `packages/typescript-config` - shared TypeScript config presets

## Tech stack

- Node.js + TypeScript
- Turborepo monorepo
- Next.js 16 app router frontend
- Vitest for unit/integration tests in `packages/services`
- Tailwind CSS and Radix UI components in the frontend
- Drizzle ORM for database schema and migrations

## Getting started

Install dependencies from the root:

```bash
pnpm install
```

### Run the frontend

From the repo root:

```bash
pnpm --filter web dev
```

Or from `apps/web`:

```bash
cd apps/web
pnpm dev
```

### Run the backend

From the repo root:

```bash
pnpm --filter api dev
```

Or from `apps/api`:

```bash
cd apps/api
pnpm dev
```

### Run all apps/packages in development

```bash
pnpm dev
```

This uses Turborepo to start the workspace.

## Build

Build everything from the root:

```bash
pnpm build
```

Build a specific package with a filter:

```bash
pnpm exec turbo build --filter=web
pnpm exec turbo build --filter=api
pnpm exec turbo build --filter=@repo/services
```

## Lint and format

```bash
pnpm lint
pnpm format
pnpm check-types
```

## Testing

The repository has tests in `packages/services` that use Vitest.

Run all service tests from the root:

```bash
pnpm --filter @repo/services test
```

Run tests from inside `packages/services`:

```bash
cd packages/services
pnpm test
```

Run a single test file from the root:

```bash
pnpm --filter @repo/services exec vitest run packages/services/form/__tests__/unit/form-state.test.ts
```

### Why tests may fail from other folders

- The root workspace does not define a top-level `test` script for Vitest.
- Use `pnpm --filter @repo/services test` or change into `packages/services`.

## Project structure

```text
/apps
  /api
  /web
/packages
  /database
  /email
  /eslint-config
  /logger
  /services
  /trpc
  /typescript-config
```

## Notes

- The workspace uses `pnpm` as the package manager (`packageManager: pnpm@9.0.0`).
- If you add tests in other packages, be sure to add appropriate package scripts or update the root workspace scripts.
- `apps/web` is the Next.js frontend and may require its own `.env` values for auth, database, and API endpoints.
- `packages/services` contains the Vitest tests and core service logic for forms and user flows.
