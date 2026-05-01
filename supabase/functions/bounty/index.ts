/**
 * Supabase Edge Function: /bounty
 *
 * Handles Bounty Flicks — peer-to-peer concept challenges routed via
 * COPPA-safe aliases. Students never see each other's real names or IDs.
 *
 * POST /bounty/send
 * Body: { challenger_id, defender_alias, concept_id }
 *   → Creates a bounty_flick row, returns bounty ID
 *
 * POST /bounty/respond
 * Body: { bounty_id, defender_id, grade }
 *   → Records defender response, awards rewards
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** Cosmetic dupes that can be awarded to defenders */
const DEFENDER_COSMETIC_POOL = [
  "frame_neon_hex",
  "badge_shooting_star",
  "card_back_galaxy",
  "badge_flame_silver",
];

/** Points awarded to challenger as Tutor Bonus */
const TUTOR_BONUS_POINTS = 15;
/** Bounty expiry window in hours */
const EXPIRY_HOURS = 24;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const url = new URL(req.url);
    const action = url.pathname.split("/").pop(); // "send" or "respond"
    const body = await req.json();

    // ── POST /bounty/send ─────────────────────────────────────────────────
    if (action === "send") {
      const { challenger_id, defender_alias, concept_id } = body;
      if (!challenger_id || !defender_alias || !concept_id) {
        return json({ error: "Missing required fields" }, 400);
      }

      // Resolve defender alias → ID (COPPA: no real names exposed)
      // Normalise to uppercase before querying — aliases are stored uppercase
      const normalisedAlias = String(defender_alias).toUpperCase().trim();
      const { data: defender } = await supabase
        .from("users")
        .select("id")
        .eq("alias", normalisedAlias)
        .maybeSingle();

      if (!defender) {
        return json({ error: `No student found with alias "${defender_alias}"` }, 404);
      }

      if (defender.id === challenger_id) {
        return json({ error: "You cannot send a bounty to yourself" }, 400);
      }

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + EXPIRY_HOURS);

      const { data: flick, error } = await supabase
        .from("bounty_flicks")
        .insert({
          challenger_id,
          defender_id: defender.id,
          concept_id,
          status: "pending",
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Award instant Tutor Bonus to the challenger for sending
      await supabase.rpc("increment_memory_bank_points", {
        p_student_id: challenger_id,
        p_points: TUTOR_BONUS_POINTS,
      });

      return json({ bounty_id: flick.id, expires_at: flick.expires_at, tutor_bonus_awarded: TUTOR_BONUS_POINTS });
    }

    // ── POST /bounty/respond ──────────────────────────────────────────────
    if (action === "respond") {
      const { bounty_id, defender_id, grade } = body;
      if (!bounty_id || !defender_id || grade == null) {
        return json({ error: "Missing required fields" }, 400);
      }

      const { data: bounty, error: fetchErr } = await supabase
        .from("bounty_flicks")
        .select("*")
        .eq("id", bounty_id)
        .eq("defender_id", defender_id)
        .eq("status", "pending")
        .maybeSingle();

      if (fetchErr) throw fetchErr;
      if (!bounty) return json({ error: "Bounty not found or already resolved" }, 404);

      // Check expiry
      if (new Date(bounty.expires_at) < new Date()) {
        await supabase.from("bounty_flicks").update({ status: "expired" }).eq("id", bounty_id);
        return json({ error: "Bounty has expired" }, 410);
      }

      const recalled = grade >= 3; // Good or Easy counts as recalled
      // Deterministic cosmetic selection using a better hash to ensure uniform distribution
      const deterministicIndex = ((bounty_id * 31 + defender_id) >>> 0) % DEFENDER_COSMETIC_POOL.length;
      const cosmetic = recalled ? DEFENDER_COSMETIC_POOL[deterministicIndex] : null;

      await supabase
        .from("bounty_flicks")
        .update({
          status: "completed",
          defender_recalled: recalled,
          defender_reward: cosmetic,
          completed_at: new Date().toISOString(),
        })
        .eq("id", bounty_id);

      return json({
        recalled,
        cosmetic_reward: cosmetic,
        message: recalled
          ? `🎉 You recalled it! Earned cosmetic: ${cosmetic}`
          : "Keep studying — you'll get it next time!",
      });
    }

    return json({ error: "Unknown action" }, 404);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}
