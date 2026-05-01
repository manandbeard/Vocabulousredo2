/**
 * Supabase Edge Function: /review
 *
 * Accepts a review submission, runs ts-fsrs to compute the next due_at,
 * and upserts the challenges row. Also handles soft Momentum tier
 * downgrade logic and Memory Bank point awards.
 *
 * POST /review
 * Body: {
 *   student_id: number,
 *   concept_id: number,
 *   grade: 1 | 2 | 3 | 4,   // 1=Again, 2=Hard, 3=Good, 4=Easy
 *   elapsed_days: number
 * }
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  type Card,
} from "npm:ts-fsrs@5";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** Points awarded per review grade (Memory Bank) */
const GRADE_POINTS: Record<number, number> = { 1: 1, 2: 3, 3: 5, 4: 8 };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { student_id, concept_id, grade, elapsed_days = 0 } = await req.json();

    if (!student_id || !concept_id || !grade) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Load existing challenge state (if any)
    const { data: existing } = await supabase
      .from("challenges")
      .select("*")
      .eq("student_id", student_id)
      .eq("concept_id", concept_id)
      .maybeSingle();

    // Build a ts-fsrs Card from the stored state
    const now = new Date();
    let card: Card = existing
      ? {
          due: new Date(existing.due_at),
          stability: existing.stability,
          difficulty: existing.difficulty,
          elapsed_days: existing.elapsed_days,
          scheduled_days: existing.scheduled_days,
          reps: existing.reps,
          lapses: existing.lapses,
          state: existing.state as Parameters<typeof fsrs>[0]["state"],
          last_review: existing.last_review_at ? new Date(existing.last_review_at) : now,
        }
      : createEmptyCard(now);

    // Run the FSRS-5 scheduler
    const f = fsrs(generatorParameters());
    const result = f.next(card, now, grade as Rating);
    const scheduledCard = result.card;

    // Upsert the challenge row
    const upsertData = {
      student_id,
      concept_id,
      state: scheduledCard.state,
      due_at: scheduledCard.due.toISOString(),
      stability: scheduledCard.stability,
      difficulty: scheduledCard.difficulty,
      elapsed_days: elapsed_days,
      scheduled_days: scheduledCard.scheduled_days,
      reps: scheduledCard.reps,
      lapses: scheduledCard.lapses,
      last_review_at: now.toISOString(),
    };

    const { error: upsertError } = existing
      ? await supabase.from("challenges").update(upsertData).eq("id", existing.id)
      : await supabase.from("challenges").insert(upsertData);

    if (upsertError) throw upsertError;

    // Award Memory Bank points (append-only)
    const points = GRADE_POINTS[grade] ?? 1;
    await supabase.rpc("increment_memory_bank_points", {
      p_student_id: student_id,
      p_points: points,
    });

    // Update streak on the user row
    await supabase
      .from("users")
      .update({ last_study_date: now.toISOString() })
      .eq("id", student_id);

    return new Response(
      JSON.stringify({
        due_at: scheduledCard.due.toISOString(),
        stability: scheduledCard.stability,
        difficulty: scheduledCard.difficulty,
        reps: scheduledCard.reps,
        lapses: scheduledCard.lapses,
        state: scheduledCard.state,
        points_awarded: points,
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
