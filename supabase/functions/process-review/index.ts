/**
 * process-review — Supabase Edge Function (Deno)
 *
 * Receives a review event for a student/concept pair, runs the FSRS
 * scheduling algorithm (ts-fsrs), and upserts the updated state into
 * the `challenges` table.
 *
 * POST /functions/v1/process-review
 * Body: { student_id: string, concept_id: string, rating: 1|2|3|4 }
 *   rating: 1=Again, 2=Hard, 3=Good, 4=Easy
 *
 * Returns 200 with { success: true, challenge: {...}, fsrs: {...} }
 * Returns 400 for invalid input, 404 for unknown student/concept,
 *         500 for server/DB errors.
 *
 * Environment variables (injected by Supabase runtime):
 *   SUPABASE_URL              — project URL
 *   SUPABASE_SERVICE_ROLE_KEY — service role key (bypasses RLS)
 */

// Supabase JS client
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ts-fsrs v5 — spaced repetition algorithm
import {
  createEmptyCard,
  fsrs,
  Rating,
  State,
  type Card,
} from "npm:ts-fsrs@5";

// ─── FSRS scheduler ──────────────────────────────────────────────────────────

const scheduler = fsrs({
  request_retention: 0.9,
  enable_fuzz: false, // deterministic for testing; set true in production
  enable_short_term: true,
});

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReviewRequest {
  student_id: string;
  concept_id: string;
  /** 1=Again, 2=Hard, 3=Good, 4=Easy */
  rating: number;
}

interface ChallengeRow {
  id: string;
  student_id: string;
  concept_id: string;
  state: string;
  due_at: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  last_review_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ratingToGrade(rating: number): Rating {
  switch (rating) {
    case 1:
      return Rating.Again;
    case 2:
      return Rating.Hard;
    case 3:
      return Rating.Good;
    case 4:
      return Rating.Easy;
    default:
      throw new Error(`Invalid rating: ${rating}. Must be 1 (Again), 2 (Hard), 3 (Good), or 4 (Easy).`);
  }
}

function stateToString(state: State): string {
  switch (state) {
    case State.New:
      return "New";
    case State.Learning:
      return "Learning";
    case State.Review:
      return "Review";
    case State.Relearning:
      return "Relearning";
    default:
      return "New";
  }
}

function stringToState(s: string | null | undefined): State {
  switch (s) {
    case "Learning":
      return State.Learning;
    case "Review":
      return State.Review;
    case "Relearning":
      return State.Relearning;
    default:
      return State.New;
  }
}

/**
 * Reconstruct a ts-fsrs Card from an existing challenges row.
 * Returns a fresh empty card if the row is null/undefined (first review).
 */
function challengeRowToCard(row: ChallengeRow | null | undefined): Card {
  if (!row || row.reps === 0) {
    return createEmptyCard();
  }

  return {
    due: new Date(row.due_at),
    stability: row.stability,
    difficulty: row.difficulty,
    elapsed_days: row.elapsed_days,
    scheduled_days: row.scheduled_days,
    reps: row.reps,
    lapses: row.lapses,
    state: stringToState(row.state),
    last_review: row.last_review_at ? new Date(row.last_review_at) : undefined,
    learning_steps: 0,
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ─── Handler ─────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Only POST is supported
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed. Use POST." }, 405);
  }

  // Parse request body
  let body: ReviewRequest;
  try {
    body = (await req.json()) as ReviewRequest;
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const { student_id, concept_id, rating } = body;

  // ── Input validation ───────────────────────────────────────────────────────

  if (!student_id || typeof student_id !== "string" || student_id.trim() === "") {
    return jsonResponse({ error: "Missing or invalid field: student_id (UUID string required)." }, 400);
  }

  if (!concept_id || typeof concept_id !== "string" || concept_id.trim() === "") {
    return jsonResponse({ error: "Missing or invalid field: concept_id (UUID string required)." }, 400);
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 4) {
    return jsonResponse(
      { error: "Invalid field: rating must be an integer 1 (Again), 2 (Hard), 3 (Good), or 4 (Easy)." },
      400,
    );
  }

  // ── Supabase client (service role — bypasses RLS) ──────────────────────────

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
    return jsonResponse({ error: "Server misconfiguration." }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // ── Verify student exists ──────────────────────────────────────────────────

  const { data: student, error: studentErr } = await supabase
    .from("users")
    .select("id")
    .eq("id", student_id)
    .maybeSingle();

  if (studentErr) {
    console.error("Error fetching student:", studentErr);
    return jsonResponse({ error: "Database error while looking up student." }, 500);
  }

  if (!student) {
    return jsonResponse({ error: `Student not found: ${student_id}` }, 404);
  }

  // ── Verify concept exists ──────────────────────────────────────────────────

  const { data: concept, error: conceptErr } = await supabase
    .from("concepts")
    .select("id")
    .eq("id", concept_id)
    .maybeSingle();

  if (conceptErr) {
    console.error("Error fetching concept:", conceptErr);
    return jsonResponse({ error: "Database error while looking up concept." }, 500);
  }

  if (!concept) {
    return jsonResponse({ error: `Concept not found: ${concept_id}` }, 404);
  }

  // ── Load existing challenge state (if any) ─────────────────────────────────

  const { data: existing, error: fetchErr } = await supabase
    .from("challenges")
    .select("*")
    .eq("student_id", student_id)
    .eq("concept_id", concept_id)
    .maybeSingle();

  if (fetchErr) {
    console.error("Error fetching challenge:", fetchErr);
    return jsonResponse({ error: "Database error while loading challenge state." }, 500);
  }

  // ── Run FSRS scheduling ────────────────────────────────────────────────────

  const card = challengeRowToCard(existing as ChallengeRow | null);
  const grade = ratingToGrade(rating);
  const now = new Date();
  const { card: updatedCard } = scheduler.next(card, now, grade);

  // ── Build upsert payload ───────────────────────────────────────────────────

  const upsertPayload = {
    student_id,
    concept_id,
    state: stateToString(updatedCard.state),
    due_at: updatedCard.due.toISOString(),
    stability: updatedCard.stability,
    difficulty: updatedCard.difficulty,
    elapsed_days: updatedCard.elapsed_days,
    scheduled_days: updatedCard.scheduled_days,
    reps: updatedCard.reps,
    lapses: updatedCard.lapses,
    last_review_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  // ── Upsert into challenges ─────────────────────────────────────────────────

  const { data: upserted, error: upsertErr } = await supabase
    .from("challenges")
    .upsert(upsertPayload, { onConflict: "student_id,concept_id" })
    .select()
    .single();

  if (upsertErr || !upserted) {
    console.error("Error upserting challenge:", upsertErr);
    return jsonResponse(
      { error: "Failed to persist review.", details: upsertErr?.message },
      500,
    );
  }

  // ── Return result ──────────────────────────────────────────────────────────

  return jsonResponse({
    success: true,
    challenge: upserted,
    fsrs: {
      state: upsertPayload.state,
      due_at: upsertPayload.due_at,
      stability: upsertPayload.stability,
      difficulty: upsertPayload.difficulty,
      elapsed_days: upsertPayload.elapsed_days,
      scheduled_days: upsertPayload.scheduled_days,
      reps: upsertPayload.reps,
      lapses: upsertPayload.lapses,
      last_review_at: upsertPayload.last_review_at,
    },
  });
});
