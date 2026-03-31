import { Router } from "express";
import { execSync } from "child_process";

const router = Router();

const REPO_ROOT = execSync("git rev-parse --show-toplevel").toString().trim();

const SKIP_PATTERNS = [
  /^visual edit$/i,
  /^published your app$/i,
  /^separate text/i,
];

function shouldSkip(subject: string): boolean {
  return SKIP_PATTERNS.some((p) => p.test(subject.trim()));
}

interface ChangelogEntry {
  id: string;
  commitHash: string;
  title: string;
  description: string;
  date: string;
  status: "shipped";
  tags: string[];
}

function inferTags(subject: string): string[] {
  const lower = subject.toLowerCase();
  const tags: string[] = [];
  if (lower.includes("fix") || lower.includes("bug") || lower.includes("error")) tags.push("bugfix");
  if (lower.includes("add") || lower.includes("create") || lower.includes("new") || lower.includes("build")) tags.push("feature");
  if (lower.includes("update") || lower.includes("refactor") || lower.includes("improve") || lower.includes("change")) tags.push("improvement");
  if (lower.includes("design") || lower.includes("ui") || lower.includes("style") || lower.includes("theme") || lower.includes("color") || lower.includes("layout")) tags.push("design");
  if (lower.includes("api") || lower.includes("route") || lower.includes("endpoint") || lower.includes("server") || lower.includes("backend")) tags.push("backend");
  if (lower.includes("analytics") || lower.includes("dashboard") || lower.includes("data")) tags.push("analytics");
  if (lower.includes("pitch") || lower.includes("slide") || lower.includes("deck")) tags.push("pitch-deck");
  if (tags.length === 0) tags.push("update");
  return tags;
}

let cache: ChangelogEntry[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60_000;

function loadFromGit(): ChangelogEntry[] {
  const raw = execSync(
    `git log --pretty=format:"%H|%aI|%s|%b|||END|||" HEAD`,
    { cwd: REPO_ROOT, maxBuffer: 4 * 1024 * 1024 }
  ).toString();

  const blocks = raw.split("|||END|||").map((b) => b.trim()).filter(Boolean);

  const entries: ChangelogEntry[] = [];

  for (const block of blocks) {
    const firstPipe = block.indexOf("|");
    const secondPipe = block.indexOf("|", firstPipe + 1);
    const thirdPipe = block.indexOf("|", secondPipe + 1);

    if (firstPipe === -1 || secondPipe === -1 || thirdPipe === -1) continue;

    const hash = block.slice(0, firstPipe);
    const date = block.slice(firstPipe + 1, secondPipe);
    const subject = block.slice(secondPipe + 1, thirdPipe);
    const bodyRaw = block.slice(thirdPipe + 1).trim();

    if (shouldSkip(subject)) continue;

    const bodyLines = bodyRaw
      .split("\n")
      .map((l) => l.trim())
      .filter(
        (l) =>
          l &&
          !l.startsWith("Replit-") &&
          !l.startsWith("Co-authored-by:") &&
          !l.startsWith("Signed-off-by:")
      );

    const description =
      bodyLines.length > 0
        ? bodyLines.slice(0, 3).join(" ")
        : subject;

    entries.push({
      id: hash.slice(0, 8),
      commitHash: hash,
      title: subject,
      description,
      date,
      status: "shipped",
      tags: inferTags(subject),
    });
  }

  return entries;
}

router.get("/", (_req, res) => {
  try {
    const now = Date.now();
    if (cache && now - cacheTimestamp < CACHE_TTL) {
      return res.json(cache);
    }

    const entries = loadFromGit();
    cache = entries;
    cacheTimestamp = now;

    res.json(entries);
  } catch (err) {
    console.error("Changelog git error:", err);
    res.status(500).json({ error: "Failed to load changelog from git history" });
  }
});

export default router;
