# Workspace

## Overview

MetaSRS Learning Platform — a full-stack SRS (Spaced Repetition System) web app for teachers and students. Teachers can create classes, manage decks of flashcards, and view analytics on student retention. Students can study due cards and track their learning progress.

## Auth

Role-based auth is handled client-side via localStorage. No external auth provider.
- Select "Sign in" → `/login` — pick Student or Teacher role, submits to redirect to the correct dashboard
- Select "Sign up" → `/signup` — pick role, creates account (client-side), redirects to dashboard
- Role stored in `localStorage` key `vocabulous_role`
- `useRole()` hook (in `src/hooks/use-role.tsx`) provides `{ role, setRole, userId }` via React context (`RoleProvider`)
- Mock IDs: Teacher = 1, Student = 2

## Demo Accounts

- Teacher: click "Sign in" → select Teacher role → submit
- Student: click "Sign in" → select Student role → submit

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `lib/integrations-openai-ai-server` (`@workspace/integrations-openai-ai-server`)

OpenAI AI integration via Replit AI Integrations proxy. Used by the AI card generation routes in `artifacts/api-server/src/routes/ai.ts`. Provides `openai` client pre-configured with `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY`.

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

## Teacher Features

### Student Heatmap (`/teacher/heatmap`)
- Full-width table of all students enrolled in any of the teacher's classes
- Columns: Name/Email, Classes, Avg Retention, Due Today, Last Active, Streak, Risk Badge
- Search bar (by name/email), class filter dropdown, risk level filter dropdown
- Risk badges: On Track (green), Slipping (amber), At Risk (red)
- Risk computed from: `alerts` table records + retention thresholds + inactivity
- Clicking a student row navigates to `/teacher/students/:id`
- API: `GET /api/analytics/teacher/:teacherId/students`

### Student Detail (`/teacher/students/:id`)
- Four sections: student header (name, avatar initials, classes, streak, retention, last active)
- At-risk alerts panel (from `alerts` table + computed flags)
- 30-day retention trend line chart (SVG, actual review data)
- Deck progress bento grid (mastery %, cards mastered/learning/due, retention per deck)
- Recent review history table (last 20 reviews with card, deck, grade, recalled, timestamp)
- API: `GET /api/analytics/students/:studentId/detail?teacherId=:teacherId`

## Teacher Deploy Content

`/teacher/content` — Teacher content management page with 3 tabs (controlled by `?tab=` query param):

1. **Create Content** (`?tab=create`, default):
   - Manual card creation form (deck, card type, front, back, hint, tags, importance)
   - AI card generation panel (terms, context, tags, count → preview list with Accept/Reject per card)
   - Bulk upload panel (drag-drop PDF/.txt → AI-extracted card preview)

2. **Word Bank** (`?tab=wordbank`):
   - Searchable table of all teacher's cards
   - Filters: class, tag, status (active/archived/all)
   - Per-row: edit inline, archive, delete
   - Batch select + batch archive/delete

3. **Class Creation** (`?tab=classes`):
   - Class creation form with icon (emoji picker grid) and color scheme (swatches)
   - Preview card showing class appearance
   - Google Classroom import placeholder (coming in v2)
   - Lists existing classes with quick nav to detail page

## AI Endpoints

- `POST /api/ai/generate-cards` — generates flashcards from terms/context using GPT-5.2
- `POST /api/ai/bulk-generate` — accepts multipart PDF/.txt upload, extracts text, generates cards

## Card Schema Notes

Cards have a `status` column with values `active | archived | deleted`. Use `PATCH /api/cards/:id/status` to change status. The old `DELETE /api/cards/:id` physically removes rows.
