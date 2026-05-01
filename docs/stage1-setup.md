# Stage 1 Setup Guide — Backend Infrastructure & FSRS Engine

This document covers everything needed to get Stage 1 running locally and deploy it to a Supabase project.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 20 | https://nodejs.org |
| pnpm | ≥ 9 | `npm i -g pnpm` |
| Supabase CLI | ≥ 1.200 | `npm i -g supabase` |
| Docker Desktop | any | https://www.docker.com (required for local Supabase) |
| Deno | ≥ 1.40 | https://deno.land (for Edge Function local testing) |

---

## Environment Variables

### Local development (`.env.local` — not committed)

```
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=<from supabase status>
SUPABASE_SERVICE_ROLE_KEY=<from supabase status>
```

### Production (set in Supabase Dashboard → Settings → Edge Functions)

```
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<project anon key>
SUPABASE_SERVICE_ROLE_KEY=<project service role key>
```

> **Note:** `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically injected into Edge Functions by the Supabase runtime. You only need to set them manually for local `supabase functions serve` testing.

---

## 1. Start local Supabase stack

```bash
# From the repository root
supabase start
```

This starts PostgreSQL (port 54322), the API (54321), Studio (54323), and the Edge Function runtime.

After start, run:

```bash
supabase status
```

Copy the `API URL`, `anon key`, and `service_role key` into your `.env.local`.

---

## 2. Apply migrations

```bash
supabase db push
# or for local dev:
supabase migration up
```

This runs `supabase/migrations/20240101000000_stage1_init.sql` which creates:

- `card_type` enum (`recall | poll | hotspot | sequence`)
- `users` table (COPPA aliases, equipped_cosmetics, role)
- `concepts` table (teacher-authored cards with content_payload JSONB)
- `challenges` table (per-student FSRS state with strict column set)
- `bounty_flicks` table (P2P challenge records)
- COPPA alias generator function (`generate_coppa_alias`)
- Auth → users trigger (`on_auth_user_created`)
- Row Level Security policies on all tables
- `updated_at` trigger on all tables

---

## 3. Deploy / Serve the Edge Function

### Local serve (hot-reload)

```bash
supabase functions serve process-review --env-file .env.local
```

### Deploy to production

```bash
supabase functions deploy process-review
```

### Function endpoint

```
POST /functions/v1/process-review
```

**Request body:**

```json
{
  "student_id": "<uuid>",
  "concept_id": "<uuid>",
  "rating": 3
}
```

`rating` values: `1` = Again, `2` = Hard, `3` = Good, `4` = Easy

**Success response (200):**

```json
{
  "success": true,
  "challenge": { "id": "...", "student_id": "...", "concept_id": "...", ... },
  "fsrs": {
    "state": "Learning",
    "due_at": "2024-01-11T10:00:00.000Z",
    "stability": 2.9,
    "difficulty": 5.1,
    "elapsed_days": 0,
    "scheduled_days": 1,
    "reps": 1,
    "lapses": 0,
    "last_review_at": "2024-01-10T10:00:00.000Z"
  }
}
```

**Error responses:**

| Code | Cause |
|------|-------|
| 400 | Missing/invalid `student_id`, `concept_id`, or `rating` |
| 404 | Student or concept not found |
| 405 | Non-POST request |
| 500 | DB error or missing env vars |

---

## 4. COPPA Alias Flow

When a user registers via Supabase Auth, the `on_auth_user_created` trigger fires automatically:

1. `handle_new_auth_user()` is called with the new `auth.users` row.
2. It calls `generate_coppa_alias()` which picks a random `AdjectiveNoun` pair (e.g. `NeonFalcon`, `CosmicWolf`).
3. If the alias already exists, it retries up to 50 times; on continued collision it appends a 3-digit suffix.
4. A new `public.users` row is inserted with `auth_id`, the generated alias, and the role from `raw_user_meta_data` (defaults to `'student'`).

No personally-identifiable information (name, email) is stored in the `coppa_alias` field.

---

## 5. Run Stage 1 Verification

### Local algorithm check (no Supabase needed)

```bash
pnpm install
pnpm --filter @workspace/scripts run verify-stage1
```

This verifies:
- FSRS "Good" review on a new card produces `due_at` in the future
- All required `challenges` column values are populated
- `reps` increments to 1, `lapses` stays 0, `stability` > 0

### Live DB check (requires local Supabase running)

```bash
export SUPABASE_URL=http://127.0.0.1:54321
export SUPABASE_SERVICE_ROLE_KEY=<from supabase status>
pnpm --filter @workspace/scripts run verify-stage1
```

This additionally:
- Inserts test teacher and student rows
- Upserts a challenge via the service role client
- Verifies stored `due_at` is in the future and `reps=1`
- Cleans up all test data

Expected output:
```
══════════════════════════════════════════════
  Stage 1 Verification — Local FSRS Checks
══════════════════════════════════════════════

FSRS scheduling result for a Good review on a new card:
{ state: 'Learning', due: '...', stability: 2.9, ... }

Assertions:
  ✓ due_at is in the future
  ✓ reps incremented to 1 after first review
  ✓ lapses is 0 for a Good review
  ✓ stability > 0
  ✓ difficulty > 0
  ✓ state transitions away from New
  ✓ scheduled_days >= 1
  ...

══════════════════════════════════════════════
  Results: 17 passed, 0 failed
══════════════════════════════════════════════
```

---

## 6. File Reference

| Path | Purpose |
|------|---------|
| `supabase/config.toml` | Supabase local dev configuration |
| `supabase/migrations/20240101000000_stage1_init.sql` | Stage 1 DB migration |
| `supabase/functions/process-review/index.ts` | FSRS review Edge Function (Deno) |
| `contracts/database_schema.sql` | Authoritative schema contract |
| `scripts/src/verify-stage1.ts` | Stage 1 verification script |
| `.shotgun/tasks.md` | Stage task tracking |

---

## 7. Stopping local Supabase

```bash
supabase stop
```

To reset the local DB and re-run migrations from scratch:

```bash
supabase db reset
```
