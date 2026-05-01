-- ============================================================
-- Vocabulousredo2 — Database Schema Contract (Stage 1)
-- ============================================================
-- This file is the authoritative schema contract.
-- The actual migration lives in supabase/migrations/.
-- Keep this in sync when schema evolves across stages.
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────────────────────
-- pgcrypto / pg_crypto provides gen_random_uuid() (PG < 13 fallback)
-- In PG 13+ gen_random_uuid() is built-in; the extension is a no-op there.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Enums ───────────────────────────────────────────────────────────────────

CREATE TYPE card_type AS ENUM ('recall', 'poll', 'hotspot', 'sequence');

-- ─── users ───────────────────────────────────────────────────────────────────
-- One row per registered user (student or teacher).
-- auth_id links to Supabase auth.users; populated automatically by trigger.
-- coppa_alias is the COPPA-safe public display name (e.g. "NeonFalcon").
-- equipped_cosmetics stores active profile cosmetics as JSON.

CREATE TABLE users (
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

-- ─── concepts ────────────────────────────────────────────────────────────────
-- Teacher-authored learning cards. content_payload holds the mixed-media
-- card content (question, answer, image URLs, hotspot data, etc.).

CREATE TABLE concepts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT        NOT NULL,
  card_type       card_type   NOT NULL DEFAULT 'recall',
  content_payload JSONB       NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── challenges ──────────────────────────────────────────────────────────────
-- Tracks each student's FSRS state for a specific concept.
-- Strict FSRS columns required per contract (do not alter column names).

CREATE TABLE challenges (
  id             UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID             NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  concept_id     UUID             NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,

  -- FSRS state fields (mapped 1-to-1 from ts-fsrs Card type)
  state          TEXT             NOT NULL DEFAULT 'New'
                                    CHECK (state IN ('New','Learning','Review','Relearning')),
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

-- ─── bounty_flicks ───────────────────────────────────────────────────────────
-- Peer-to-peer challenge records. Challenger flicks a concept to a Defender.

CREATE TABLE bounty_flicks (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  defender_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  concept_id    UUID        NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  status        TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','accepted','completed','expired')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── COPPA alias generator ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_coppa_alias() RETURNS TEXT
LANGUAGE plpgsql AS $$
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

    -- After 50 plain collisions, append a 3-digit suffix for uniqueness
    IF attempts > 50 THEN
      alias := alias || (100 + floor(random() * 900)::int)::text;
      RETURN alias;
    END IF;
  END LOOP;
END;
$$;

-- ─── Auth → users trigger ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (auth_id, coppa_alias, role)
  VALUES (
    NEW.id,
    generate_coppa_alias(),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_auth_user();
