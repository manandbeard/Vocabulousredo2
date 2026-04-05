/**
 * Computes the current study streak from a list of distinct review days.
 *
 * @param reviewDays Array of date strings in 'YYYY-MM-DD' format,
 *                   sorted descending (most recent first).
 * @returns          Number of consecutive days ending today (or yesterday)
 *                   that had at least one review.
 */
export function computeStreak(reviewDays: string[]): number {
  if (reviewDays.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  for (let i = 0; i < reviewDays.length; i++) {
    const reviewDay = new Date(reviewDays[i]);
    const expectedDay = new Date(today);
    expectedDay.setDate(expectedDay.getDate() - i);
    if (reviewDay.toDateString() === expectedDay.toDateString()) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
