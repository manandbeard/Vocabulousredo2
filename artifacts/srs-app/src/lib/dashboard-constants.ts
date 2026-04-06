/** Mon–Sun day labels used in weekly engagement / goal bar charts. */
export const DAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;

/**
 * Scene background images used in hero cards.
 * Images must be present in `public/images/`.
 */
export const SCENE_IMAGES = [
  "/images/card-bg-student-focused.png",
  "/images/card-bg-peer-study.png",
  "/images/card-bg-active-learning.png",
  "/images/card-bg-study-desk.png",
  "/images/card-bg-group-session.png",
  "/images/card-bg-deep-reading.png",
] as const;

/** Returns a scene image path for a given index (wraps around). */
export function getSceneImage(index: number): string {
  return SCENE_IMAGES[index % SCENE_IMAGES.length];
}
