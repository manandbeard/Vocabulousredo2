/**
 * Momentum Multiplier Store ("Vibe" system)
 *
 * Consecutive-day streaks map to soft tiers — missing a day causes a
 * tier *downgrade*, not a hard reset ("Coyote Time" philosophy at the
 * meta-level). Points earned are never removed (see memory-bank-store).
 *
 * Tiers:
 *   Spark  (✨) — days 1-2  → 1.0× multiplier
 *   Aura   (🔮) — days 3-5  → 1.2× multiplier
 *   Crown  (👑) — days 6+   → 1.5× multiplier
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type VibeTier = "spark" | "aura" | "crown";

export interface MomentumState {
  /** Number of consecutive study days */
  streakDays: number;
  /** ISO date string of the last day study was recorded (YYYY-MM-DD) */
  lastStudyDate: string | null;
  /** Current tier label */
  tier: VibeTier;
  /** Point multiplier for the current tier */
  multiplier: 1.0 | 1.2 | 1.5;

  /** Call once per session to record today's study activity */
  recordStudyDay: () => void;
  /** Hydrate streak from server data (e.g. after login) */
  hydrateStreak: (streakDays: number, lastStudyDate: string | null) => void;
}

function getTier(days: number): VibeTier {
  if (days >= 6) return "crown";
  if (days >= 3) return "aura";
  return "spark";
}

function getMultiplier(tier: VibeTier): 1.0 | 1.2 | 1.5 {
  if (tier === "crown") return 1.5;
  if (tier === "aura") return 1.2;
  return 1.0;
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useMomentumStore = create<MomentumState>()(
  persist(
    (set, get) => ({
      streakDays: 0,
      lastStudyDate: null,
      tier: "spark",
      multiplier: 1.0,

      recordStudyDay() {
        const today = todayString();
        const { lastStudyDate, streakDays } = get();

        if (lastStudyDate === today) return; // already recorded today

        let newStreak: number;
        if (lastStudyDate === null) {
          newStreak = 1;
        } else {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().slice(0, 10);

          if (lastStudyDate === yesterdayStr) {
            // Consecutive day — extend streak
            newStreak = streakDays + 1;
          } else {
            // Gap detected → soft downgrade: lose one tier worth of days
            // This is the "soft reset" — not a hard reset to zero
            const tierBreakpoints: Record<VibeTier, number> = {
              crown: 5, // drops from Crown to Aura threshold
              aura: 2,  // drops from Aura to Spark threshold
              spark: 1, // already at bottom — reset to 1
            };
            const currentTier = getTier(streakDays);
            newStreak = tierBreakpoints[currentTier];
          }
        }

        const tier = getTier(newStreak);
        set({
          streakDays: newStreak,
          lastStudyDate: today,
          tier,
          multiplier: getMultiplier(tier),
        });
      },

      hydrateStreak(streakDays, lastStudyDate) {
        const tier = getTier(streakDays);
        set({
          streakDays,
          lastStudyDate,
          tier,
          multiplier: getMultiplier(tier),
        });
      },
    }),
    {
      name: "vocabulous-momentum",
    },
  ),
);

/** Human-readable label + emoji for a tier */
export const TIER_META: Record<VibeTier, { label: string; emoji: string; color: string }> = {
  spark: { label: "Spark", emoji: "✨", color: "text-yellow-500" },
  aura:  { label: "Aura",  emoji: "🔮", color: "text-purple-500" },
  crown: { label: "Crown", emoji: "👑", color: "text-amber-500" },
};
