# Vocabulousredo2 — Implementation Tasks

> One stage at a time. Do not proceed to Stage 2+ until Stage 1 is fully validated.

---

## Stage 1: Backend Infrastructure & FSRS Engine

**Goal:** Supabase DB schema applied, `process-review` Edge Function operational, Auth→users alias trigger live, verification script passes.

- [X] Supabase project config (`supabase/config.toml`) created for local dev
- [X] Database schema contract defined in `contracts/database_schema.sql`
- [X] Migration `20240101000000_stage1_init.sql` written covering:
  - `card_type` enum (`recall`, `poll`, `hotspot`, `sequence`)
  - `users` table with COPPA `coppa_alias` (unique), `equipped_cosmetics` JSONB, `role`
  - `concepts` table with `content_payload` JSONB and `card_type`
  - `challenges` table with strict FSRS columns: `state`, `due_at`, `stability`, `difficulty`, `elapsed_days`, `scheduled_days`, `reps`, `lapses`, `last_review_at`
  - `bounty_flicks` table
  - RLS policies for all tables
- [X] COPPA alias trigger implemented:
  - `generate_coppa_alias()` SQL function (adjective+noun, retry on collision)
  - `handle_new_auth_user()` trigger function (auto-inserts `users` row on `auth.users` insert)
  - Trigger wired: `AFTER INSERT ON auth.users`
- [X] Edge Function `process-review` (Deno / ts-fsrs):
  - Accepts `{ student_id, concept_id, rating }` (rating 1–4)
  - Loads existing challenge FSRS state or initialises empty card
  - Runs `scheduler.next()` and maps result to `challenges` columns
  - Upserts on `(student_id, concept_id)` unique constraint
  - Returns full FSRS payload
  - Returns 400 for invalid ratings / missing fields
  - Returns 404 for unknown student or concept
- [X] Verification script `scripts/src/verify-stage1.ts`:
  - Simulates a "Good" (rating=3) review on a new card
  - Asserts `due_at` is in the future and FSRS state fields are populated
  - Runnable with `pnpm --filter @workspace/scripts run verify-stage1`
- [X] Docs `docs/stage1-setup.md` written with env vars, migration steps, deploy steps, and verification instructions

---

## Stage 2: Student Feed & Game Mechanics (DO NOT START)

- [ ] Momentum Multiplier ("Vibe") engine
- [ ] Memory Bank point accumulation
- [ ] Student feed UI (React / Framer Motion)
- [ ] Coyote Time 500 ms buffer logic

---

## Stage 3: Teacher Dashboard & Curriculum Builder (DO NOT START)

- [ ] React Flow curriculum builder
- [ ] Concept creation / publishing flow
- [ ] Class management

---

## Stage 4: Bounty Flicks P2P (DO NOT START)

- [ ] Flick challenge dispatch
- [ ] Defender response flow
- [ ] Cosmetic reward system
