# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lock Genius is a secure password manager built with Next.js 14 App Router, TypeScript, PostgreSQL/Prisma, and NextAuth.js for GitHub OAuth authentication.

## Commands

### Development
```bash
pnpm dev          # Start dev server (runs prisma generate first)
pnpm build        # Production build with Prisma generation and db push
pnpm lint         # Run ESLint
pnpm lint:fix     # Auto-fix ESLint issues
pnpm format:write # Format code with Prettier
pnpm typecheck    # TypeScript type checking
```

### Testing
```bash
pnpm test              # Run Jest tests
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Run tests with coverage report
```

### Database
```bash
pnpm db:setup    # Generate Prisma client and push schema
pnpm db:reset    # Force reset database (deletes all data)
pnpm db:studio   # Open Prisma Studio
pnpm docker:up   # Start PostgreSQL via Docker
pnpm docker:down # Stop Docker services
```

## Architecture

### Directory Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/app/api/v1/` - Versioned API endpoints (health, passwords)
- `src/app/api/auth/` - NextAuth.js authentication routes
- `src/components/ui/` - shadcn/ui base components with Radix UI primitives
- `src/components/magicui/` - Magic UI animated components
- `src/services/` - API service layer with typed request/response interfaces
- `src/common/api.ts` - Axios instance configured with base URL `/api/v1`
- `src/hooks/` - Custom React hooks (clipboard, mounted, password storage)
- `src/lib/` - Utilities including Prisma client, `cn()` helper, fonts
- `src/env.mjs` - T3 Env for type-safe environment variables with Zod validation

### Key Patterns

**API Routes**: Use Next.js Route Handlers in `src/app/api/v1/` with versioned structure.

**Service Layer**: Services in `src/services/` export typed functions that call the Axios instance:
```typescript
// password.service.ts calls api.post('/passwords/generate', params)
```

**Components**: Use CVA (class-variance-authority) for variants, Radix UI for accessibility, and `cn()` from `@/lib/utils` for class merging.

**Forms**: Use React Hook Form with Zod resolver for validation. Mark form components with `'use client'`.

**Authentication**: NextAuth.js with GitHub OAuth provider and Prisma adapter. Session data accessed via `useSession()` hook.

### Database Schema (Prisma)
- `User` - Core user model linked to NextAuth
- `Account`, `Session`, `VerificationToken` - NextAuth required models
- `Password` - Stored passwords with generation metadata (length, character set flags)

### Environment Variables
Required in `.env`:
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_GITHUB_ID` - GitHub OAuth client ID
- `AUTH_GITHUB_SECRET` - GitHub OAuth client secret
- `NEXT_PUBLIC_API_URL` (optional) - API base URL override

## Tech Stack
- Next.js 14 with App Router and Turbopack
- TypeScript with strict mode
- PostgreSQL + Prisma ORM
- NextAuth.js for authentication
- Tailwind CSS v4 + shadcn/ui + Radix UI
- React Hook Form + Zod for forms
- Jest + React Testing Library for tests
- pnpm as package manager

## Import Conventions
Use `@/` path alias for imports from `src/`:
```typescript
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import api from '@/common/api';
```
