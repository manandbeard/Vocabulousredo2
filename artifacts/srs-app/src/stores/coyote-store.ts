/**
 * Coyote Time Store
 *
 * Provides a 500 ms logic buffer before an FSRS "lapse" (grade=1) is
 * committed to the server, giving students a chance to undo accidental
 * taps.
 *
 * Inspired by Coyote Time in platformer games — the player runs off a
 * cliff but still has a brief window to jump.
 *
 * Usage:
 *   const { startBuffer, cancelBuffer, isPending } = useCoyoteStore();
 *
 *   // On grade=1 press:
 *   startBuffer(() => submitReview(grade), grade);
 *
 *   // If the student taps "undo" within 500 ms:
 *   cancelBuffer();
 */

import { create } from "zustand";

const COYOTE_MS = 500;

export interface CoyoteState {
  /** Whether a buffered action is in-flight */
  isPending: boolean;
  /** The grade that triggered the buffer (null when idle) */
  pendingGrade: number | null;
  /** Time (ms since epoch) when the buffer started */
  startedAt: number | null;
  /** Remaining ms until the action commits (updated by the UI via a timer) */
  remainingMs: number;

  /** Start a 500 ms buffer; calls `onCommit` if not cancelled in time */
  startBuffer: (onCommit: () => void, grade: number) => void;
  /** Cancel the pending buffered action */
  cancelBuffer: () => void;
}

export const useCoyoteStore = create<CoyoteState>()((set, get) => {
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let tickerId: ReturnType<typeof setInterval> | null = null;

  function clearTimers() {
    if (timerId !== null) { clearTimeout(timerId); timerId = null; }
    if (tickerId !== null) { clearInterval(tickerId); tickerId = null; }
  }

  return {
    isPending: false,
    pendingGrade: null,
    startedAt: null,
    remainingMs: 0,

    startBuffer(onCommit, grade) {
      clearTimers();

      const now = Date.now();
      set({ isPending: true, pendingGrade: grade, startedAt: now, remainingMs: COYOTE_MS });

      // Countdown tick so the UI can show a progress bar
      tickerId = setInterval(() => {
        const elapsed = Date.now() - (get().startedAt ?? now);
        const remaining = Math.max(0, COYOTE_MS - elapsed);
        set({ remainingMs: remaining });
      }, 50);

      timerId = setTimeout(() => {
        clearTimers();
        set({ isPending: false, pendingGrade: null, startedAt: null, remainingMs: 0 });
        onCommit();
      }, COYOTE_MS);
    },

    cancelBuffer() {
      clearTimers();
      set({ isPending: false, pendingGrade: null, startedAt: null, remainingMs: 0 });
    },
  };
});
