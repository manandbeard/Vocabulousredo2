/**
 * Memory Bank Store
 *
 * Earned points are APPEND-ONLY — they never decay or get removed.
 * This prevents "loss-aversion burnout": students can see their total
 * accumulated effort even if their streak drops.
 *
 * Points are used to unlock Profile Cosmetics in the /student/profile shop.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface MemoryBankState {
  /** Total lifetime points — never decreases */
  totalPoints: number;
  /** Points spent on cosmetics — used to compute spendable balance */
  spentPoints: number;
  /** Ordered history of point awards */
  history: PointEvent[];

  /** Add points (e.g. after a review session) */
  awardPoints: (amount: number, reason: string, multiplier?: number) => void;
  /** Spend points on a cosmetic unlock */
  spendPoints: (amount: number, itemId: string) => boolean;
  /** Hydrate from server on login */
  hydratePoints: (total: number, spent: number) => void;
}

export interface PointEvent {
  id: string;
  amount: number;
  multipliedAmount: number;
  multiplier: number;
  reason: string;
  timestamp: string;
}

export const useMemoryBankStore = create<MemoryBankState>()(
  persist(
    (set, get) => ({
      totalPoints: 0,
      spentPoints: 0,
      history: [],

      awardPoints(amount, reason, multiplier = 1.0) {
        const multipliedAmount = Math.round(amount * multiplier);
        const event: PointEvent = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          amount,
          multipliedAmount,
          multiplier,
          reason,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          totalPoints: state.totalPoints + multipliedAmount,
          history: [event, ...state.history].slice(0, 100), // keep last 100
        }));
      },

      spendPoints(amount, _itemId) {
        const { totalPoints, spentPoints } = get();
        const spendable = totalPoints - spentPoints;
        if (spendable < amount) return false; // not enough
        set({ spentPoints: spentPoints + amount });
        return true;
      },

      hydratePoints(total, spent) {
        set({ totalPoints: total, spentPoints: spent });
      },
    }),
    {
      name: "vocabulous-memory-bank",
      // Only persist the aggregate totals; history is ephemeral session data
      partialize: (state) => ({
        totalPoints: state.totalPoints,
        spentPoints: state.spentPoints,
        history: state.history.slice(0, 20),
      }),
    },
  ),
);

/** Points awarded per review grade */
export const GRADE_POINTS: Record<number, number> = {
  1: 1,  // Again
  2: 3,  // Hard
  3: 5,  // Good
  4: 8,  // Easy
};
