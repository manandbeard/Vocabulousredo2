-- Migration: Add user preference and notification fields to users table
-- Applied via: drizzle-kit push --force

ALTER TABLE users ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_goal integer NOT NULL DEFAULT 20;
ALTER TABLE users ADD COLUMN IF NOT EXISTS difficulty_level text NOT NULL DEFAULT 'Intermediate';
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications boolean NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_notifications boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS weekly_digest boolean NOT NULL DEFAULT true;
