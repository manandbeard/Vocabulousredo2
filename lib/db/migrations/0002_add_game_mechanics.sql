-- Migration: Add Vocabulous game mechanics tables
-- Adds: concepts, challenges, bounty_flicks tables
-- Updates: users table with COPPA alias, equipped_cosmetics, memory bank

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. Update users table
-- ──────────────────────────────────────────────────────────────────────────────

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS alias              TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS memory_bank_points INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS memory_bank_spent  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS equipped_cosmetics JSONB   NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS users_alias_idx ON users (alias);

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. Concepts table (rich mixed-media cards)
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS concepts (
  id              SERIAL PRIMARY KEY,
  created_by      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  content_payload JSONB NOT NULL DEFAULT '{}',
  card_type       TEXT NOT NULL DEFAULT 'recall'
                    CHECK (card_type IN ('recall', 'poll', 'hotspot', 'sequence')),
  tags            TEXT[] NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS concepts_created_by_idx ON concepts (created_by);
CREATE INDEX IF NOT EXISTS concepts_card_type_idx  ON concepts (card_type);

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. Challenges table (per-student FSRS state — mirrors ts-fsrs Card model)
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS challenges (
  id             SERIAL PRIMARY KEY,
  student_id     INTEGER NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
  concept_id     INTEGER NOT NULL REFERENCES concepts(id)  ON DELETE CASCADE,
  state          TEXT NOT NULL DEFAULT 'New'
                   CHECK (state IN ('New', 'Learning', 'Review', 'Relearning')),
  due_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stability      REAL NOT NULL DEFAULT 0,
  difficulty     REAL NOT NULL DEFAULT 0,
  elapsed_days   REAL NOT NULL DEFAULT 0,
  scheduled_days REAL NOT NULL DEFAULT 0,
  reps           INTEGER NOT NULL DEFAULT 0,
  lapses         INTEGER NOT NULL DEFAULT 0,
  last_review_at TIMESTAMPTZ,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS challenges_student_due_idx     ON challenges (student_id, due_at);
CREATE INDEX IF NOT EXISTS challenges_student_concept_idx ON challenges (student_id, concept_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. Bounty Flicks table (peer-to-peer concept challenges)
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bounty_flicks (
  id                      SERIAL PRIMARY KEY,
  challenger_id           INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  defender_id             INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  concept_id              INTEGER NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  status                  TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'accepted', 'completed', 'expired')),
  defender_recalled       BOOLEAN,
  defender_reward         TEXT,
  challenger_bonus_points INTEGER NOT NULL DEFAULT 0,
  expires_at              TIMESTAMPTZ NOT NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at            TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS bounty_flicks_defender_status_idx ON bounty_flicks (defender_id, status);
CREATE INDEX IF NOT EXISTS bounty_flicks_challenger_idx       ON bounty_flicks (challenger_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- 5. Helper RPC: increment_memory_bank_points (used by Edge Functions)
-- ──────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_memory_bank_points(
  p_student_id INTEGER,
  p_points     INTEGER
) RETURNS VOID
LANGUAGE SQL
AS $$
  UPDATE users
     SET memory_bank_points = memory_bank_points + p_points
   WHERE id = p_student_id;
$$;
