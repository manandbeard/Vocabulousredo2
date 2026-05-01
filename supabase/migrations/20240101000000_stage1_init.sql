-- ============================================================
-- Stage 1 — Initial Schema Migration
-- Vocabulousredo2 Supabase PostgreSQL
-- ============================================================
-- Applies: card_type enum, users, concepts, challenges,
--          bounty_flicks tables, COPPA alias generator,
--          auth→users trigger, indexes, and RLS policies.
--
-- Reverse: see the rollback section at the bottom (commented out).
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────────────────────
-- pgcrypto provides gen_random_uuid() on PG < 13; harmless on PG 13+
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Enum: card_type ─────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE card_type AS ENUM ('recall', 'poll', 'hotspot', 'sequence');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ─── Table: users ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id            UUID        UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  coppa_alias        TEXT        NOT NULL UNIQUE,
  display_name       TEXT,
  role               TEXT        NOT NULL DEFAULT 'student'
                                   CHECK (role IN ('student', 'teacher')),
  equipped_cosmetics JSONB       NOT NULL DEFAULT '{}',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: concepts ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.concepts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id      UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title           TEXT        NOT NULL,
  card_type       card_type   NOT NULL DEFAULT 'recall',
  content_payload JSONB       NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: challenges ───────────────────────────────────────────────────────
-- Strict FSRS columns per contract. Column names must not be changed.
CREATE TABLE IF NOT EXISTS public.challenges (
  id             UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID             NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  concept_id     UUID             NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,

  -- FSRS state (ts-fsrs State enum as text)
  state          TEXT             NOT NULL DEFAULT 'New'
                                    CHECK (state IN ('New', 'Learning', 'Review', 'Relearning')),
  due_at         TIMESTAMPTZ      NOT NULL DEFAULT now(),
  stability      DOUBLE PRECISION NOT NULL DEFAULT 0,
  difficulty     DOUBLE PRECISION NOT NULL DEFAULT 0,
  elapsed_days   INTEGER          NOT NULL DEFAULT 0,
  scheduled_days INTEGER          NOT NULL DEFAULT 0,
  reps           INTEGER          NOT NULL DEFAULT 0,
  lapses         INTEGER          NOT NULL DEFAULT 0,
  last_review_at TIMESTAMPTZ,

  created_at     TIMESTAMPTZ      NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ      NOT NULL DEFAULT now(),

  UNIQUE (student_id, concept_id)
);

-- ─── Table: bounty_flicks ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bounty_flicks (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  defender_id   UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  concept_id    UUID        NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  status        TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'accepted', 'completed', 'expired')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
-- Challenges: fast lookup of due cards for a student
CREATE INDEX IF NOT EXISTS idx_challenges_student_due
  ON public.challenges (student_id, due_at ASC);

-- Challenges: fast lookup of all cards for a concept
CREATE INDEX IF NOT EXISTS idx_challenges_concept
  ON public.challenges (concept_id);

-- Concepts: fast lookup by teacher
CREATE INDEX IF NOT EXISTS idx_concepts_teacher
  ON public.concepts (teacher_id);

-- Bounty flicks: fast lookup by defender (incoming challenges)
CREATE INDEX IF NOT EXISTS idx_bounty_flicks_defender
  ON public.bounty_flicks (defender_id, status);

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concepts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bounty_flicks  ENABLE ROW LEVEL SECURITY;

-- users: authenticated users can read their own row; service role bypasses RLS
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = auth_id);

-- concepts: anyone authenticated can read; only teacher owner can write
CREATE POLICY "concepts_select_authenticated" ON public.concepts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "concepts_insert_teacher" ON public.concepts
  FOR INSERT WITH CHECK (
    teacher_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

CREATE POLICY "concepts_update_teacher" ON public.concepts
  FOR UPDATE USING (
    teacher_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

CREATE POLICY "concepts_delete_teacher" ON public.concepts
  FOR DELETE USING (
    teacher_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

-- challenges: students see only their own; service role (Edge Functions) bypasses
CREATE POLICY "challenges_select_own" ON public.challenges
  FOR SELECT USING (
    student_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

CREATE POLICY "challenges_insert_own" ON public.challenges
  FOR INSERT WITH CHECK (
    student_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

CREATE POLICY "challenges_update_own" ON public.challenges
  FOR UPDATE USING (
    student_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

-- bounty_flicks: challenger or defender can see their own flicks
CREATE POLICY "bounty_flicks_select_participant" ON public.bounty_flicks
  FOR SELECT USING (
    challenger_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    OR defender_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

CREATE POLICY "bounty_flicks_insert_challenger" ON public.bounty_flicks
  FOR INSERT WITH CHECK (
    challenger_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

-- ─── updated_at trigger (reusable) ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_concepts_updated_at
  BEFORE UPDATE ON public.concepts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_challenges_updated_at
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_bounty_flicks_updated_at
  BEFORE UPDATE ON public.bounty_flicks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── COPPA alias generator ────────────────────────────────────────────────────
-- Generates a unique "AdjectiveNoun" alias (e.g. "NeonFalcon").
-- Retries on collision; after 50 tries appends a 3-digit suffix.
CREATE OR REPLACE FUNCTION public.generate_coppa_alias()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  adjectives TEXT[] := ARRAY[
    'Amber','Arctic','Astral','Azure','Blaze','Bold','Bright','Breezy','Brave',
    'Calm','Cobalt','Cosmic','Crystal','Cyan','Daring','Dawn','Dusk','Electric',
    'Ember','Emerald','Fierce','Frosty','Gilded','Golden','Grand','Haze',
    'Indigo','Jade','Keen','Lunar','Magma','Mighty','Misty','Neon','Nova',
    'Ocean','Onyx','Opal','Orbit','Prism','Radiant','Rapid','Regal','Royal',
    'Rustic','Sage','Shadow','Silver','Solar','Sonic','Spark','Star','Steel',
    'Storm','Swift','Teal','Thunder','Titan','Turbo','Ultra','Vast','Vivid',
    'Wild','Zeal','Zenith','Zephyr'
  ];
  nouns TEXT[] := ARRAY[
    'Arrow','Axe','Bear','Beetle','Bird','Blaze','Bolt','Bison','Bobcat',
    'Cobra','Comet','Condor','Crane','Crow','Deer','Dingo','Dragon','Drone',
    'Eagle','Egret','Elk','Falcon','Ferret','Finch','Fox','Gecko','Griffin',
    'Hare','Hawk','Heron','Hornet','Hydra','Ibis','Iguana','Jaguar','Kite',
    'Koi','Lemur','Leopard','Liger','Lynx','Magpie','Mamba','Marten','Merlin',
    'Moose','Moth','Narwhal','Newt','Osprey','Otter','Owl','Panda','Panther',
    'Peregrine','Phoenix','Pike','Puma','Python','Raptor','Raven','Rhino',
    'Robin','Salamander','Scorpion','Seahorse','Shark','Snipe','Sparrow',
    'Sphinx','Tiger','Toad','Toucan','Viper','Vulture','Walrus','Weasel',
    'Wolf','Wolverine','Wren','Yak','Zebra'
  ];
  alias    TEXT;
  attempts INT := 0;
BEGIN
  LOOP
    alias := adjectives[1 + (floor(random() * array_length(adjectives, 1)))::int]
          || nouns[1 + (floor(random() * array_length(nouns, 1)))::int];

    IF NOT EXISTS (SELECT 1 FROM public.users WHERE coppa_alias = alias) THEN
      RETURN alias;
    END IF;

    attempts := attempts + 1;

    -- Append a 3-digit random suffix after 50 plain collisions
    IF attempts > 50 THEN
      alias := alias || (100 + (floor(random() * 900))::int)::text;
      RETURN alias;
    END IF;
  END LOOP;
END;
$$;

-- ─── Auth → public.users trigger ─────────────────────────────────────────────
-- Fires when a new auth.users row is inserted (i.e. user registers).
-- Auto-creates the public.users profile row with a unique COPPA alias.
-- SECURITY DEFINER runs as the function owner (postgres), bypassing RLS.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (auth_id, coppa_alias, role)
  VALUES (
    NEW.id,
    public.generate_coppa_alias(),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$;

-- Drop the trigger if it already exists to allow idempotent re-runs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================================
-- ROLLBACK (run manually if you need to undo this migration)
-- ============================================================
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_auth_user();
-- DROP FUNCTION IF EXISTS public.generate_coppa_alias();
-- DROP FUNCTION IF EXISTS public.set_updated_at();
-- DROP TABLE IF EXISTS public.bounty_flicks;
-- DROP TABLE IF EXISTS public.challenges;
-- DROP TABLE IF EXISTS public.concepts;
-- DROP TABLE IF EXISTS public.users;
-- DROP TYPE  IF EXISTS card_type;
