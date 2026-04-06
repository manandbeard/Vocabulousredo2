/**
 * Unit tests for the ts-fsrs scheduling wrapper (lib/fsrs.ts).
 *
 * These tests verify that the core SRS logic produces correct output
 * without needing a database connection.
 */
import { describe, it, expect } from "vitest";
import { State, Rating } from "ts-fsrs";
import {
  gradeToRating,
  stateToString,
  stringToState,
  cardStateToFSRS,
  scheduleReview,
  computeRetrievability,
  scheduler,
} from "../lib/fsrs";

describe("gradeToRating", () => {
  it("maps 1 → Again", () => expect(gradeToRating(1)).toBe(Rating.Again));
  it("maps 2 → Hard", () => expect(gradeToRating(2)).toBe(Rating.Hard));
  it("maps 3 → Good", () => expect(gradeToRating(3)).toBe(Rating.Good));
  it("maps 4 → Easy", () => expect(gradeToRating(4)).toBe(Rating.Easy));
  it("defaults unknown grade to Good", () => expect(gradeToRating(99)).toBe(Rating.Good));
});

describe("stateToString / stringToState round-trip", () => {
  const cases: [State, string][] = [
    [State.New, "New"],
    [State.Learning, "Learning"],
    [State.Review, "Review"],
    [State.Relearning, "Relearning"],
  ];
  it.each(cases)("State.%s → '%s' → State.%s", (state, str) => {
    expect(stateToString(state)).toBe(str);
    expect(stringToState(str)).toBe(state);
  });

  it("unknown string defaults to State.New", () =>
    expect(stringToState("unknown")).toBe(State.New));
});

describe("cardStateToFSRS", () => {
  it("returns a fresh empty card when state is null", () => {
    const card = cardStateToFSRS(null);
    expect(card.state).toBe(State.New);
    expect(card.reps).toBe(0);
    expect(card.lapses).toBe(0);
    expect(card.stability).toBe(0);
  });

  it("reconstructs a Review card from DB state", () => {
    const now = new Date("2024-01-15T12:00:00Z");
    const nextReview = new Date("2024-01-20T12:00:00Z");
    const card = cardStateToFSRS({
      id: 1,
      studentId: 1,
      cardId: 1,
      deckId: 1,
      stability: 8.5,
      difficulty: 6.2,
      fsrsState: "Review",
      lapses: 1,
      scheduledDays: 5,
      reviewCount: 10,
      lastReviewedAt: now,
      nextReviewAt: nextReview,
      updatedAt: now,
    });
    expect(card.state).toBe(State.Review);
    expect(card.stability).toBe(8.5);
    expect(card.difficulty).toBe(6.2);
    expect(card.lapses).toBe(1);
    expect(card.reps).toBe(10);
    expect(card.scheduled_days).toBe(5);
  });
});

describe("scheduleReview", () => {
  const now = new Date("2024-01-15T12:00:00Z");

  it("new card rated Good moves to Learning state", () => {
    const { card } = scheduleReview(null, 3, now);
    // After a Good on a new card, it enters Learning (short-term steps)
    expect([State.Learning, State.Review]).toContain(card.state);
    expect(card.reps).toBeGreaterThan(0);
  });

  it("new card rated Easy can jump to Review state", () => {
    const { card } = scheduleReview(null, 4, now);
    expect([State.Review, State.Learning]).toContain(card.state);
    expect(card.stability).toBeGreaterThan(0);
  });

  it("Again on a Review card increases lapses", () => {
    const reviewState = {
      id: 1,
      studentId: 1,
      cardId: 1,
      deckId: 1,
      stability: 10,
      difficulty: 5,
      fsrsState: "Review",
      lapses: 0,
      scheduledDays: 10,
      reviewCount: 5,
      lastReviewedAt: new Date("2024-01-05T12:00:00Z"),
      nextReviewAt: new Date("2024-01-15T12:00:00Z"),
      updatedAt: now,
    };
    const { card } = scheduleReview(reviewState, 1, now);
    expect(card.lapses).toBeGreaterThan(0);
    expect(card.state).toBe(State.Relearning);
  });

  it("next due date is in the future after Good rating on Review card", () => {
    const reviewState = {
      id: 1,
      studentId: 1,
      cardId: 1,
      deckId: 1,
      stability: 10,
      difficulty: 5,
      fsrsState: "Review",
      lapses: 0,
      scheduledDays: 10,
      reviewCount: 5,
      lastReviewedAt: new Date("2024-01-05T12:00:00Z"),
      nextReviewAt: new Date("2024-01-15T12:00:00Z"),
      updatedAt: now,
    };
    const { card } = scheduleReview(reviewState, 3, now);
    expect(card.due.getTime()).toBeGreaterThan(now.getTime());
    expect(card.scheduled_days).toBeGreaterThan(0);
  });
});

describe("computeRetrievability", () => {
  it("returns null for a card with no review history", () => {
    const result = computeRetrievability(null, new Date());
    expect(result).toBeNull();
  });

  it("returns null when lastReviewedAt is null", () => {
    const result = computeRetrievability(
      {
        stability: 10,
        difficulty: 5,
        fsrsState: "Review",
        lapses: 0,
        scheduledDays: 10,
        reviewCount: 5,
        lastReviewedAt: null,
        nextReviewAt: null,
      },
      new Date(),
    );
    expect(result).toBeNull();
  });

  it("returns a value between 0 and 1 for a recently reviewed card", () => {
    const lastReview = new Date("2024-01-10T12:00:00Z");
    const now = new Date("2024-01-12T12:00:00Z"); // 2 days later
    const nextReview = new Date("2024-01-20T12:00:00Z");

    const result = computeRetrievability(
      {
        stability: 10,
        difficulty: 5,
        fsrsState: "Review",
        lapses: 0,
        scheduledDays: 10,
        reviewCount: 5,
        lastReviewedAt: lastReview,
        nextReviewAt: nextReview,
      },
      now,
    );
    expect(result).not.toBeNull();
    expect(result!).toBeGreaterThan(0);
    expect(result!).toBeLessThanOrEqual(1);
  });

  it("retrievability decreases over time", () => {
    const lastReview = new Date("2024-01-01T12:00:00Z");
    const baseState = {
      stability: 7,
      difficulty: 5,
      fsrsState: "Review",
      lapses: 0,
      scheduledDays: 7,
      reviewCount: 3,
      lastReviewedAt: lastReview,
      nextReviewAt: new Date("2024-01-08T12:00:00Z"),
    };

    const r1 = computeRetrievability(baseState, new Date("2024-01-02T12:00:00Z")); // 1 day
    const r2 = computeRetrievability(baseState, new Date("2024-01-05T12:00:00Z")); // 4 days
    const r3 = computeRetrievability(baseState, new Date("2024-01-15T12:00:00Z")); // 14 days

    expect(r1!).toBeGreaterThan(r2!);
    expect(r2!).toBeGreaterThan(r3!);
  });
});

describe("scheduler configuration", () => {
  it("uses 90% target retention", () => {
    // The scheduler's params should reflect our 90% retention target
    const params = scheduler.parameters;
    expect(params.request_retention).toBe(0.9);
  });

  it("has fuzz enabled", () => {
    const params = scheduler.parameters;
    expect(params.enable_fuzz).toBe(true);
  });
});
