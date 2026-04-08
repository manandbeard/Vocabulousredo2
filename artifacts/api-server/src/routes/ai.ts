import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, cardsTable, blurtingSessionsTable } from "@workspace/db";
import multer from "multer";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GradeBlurtBody, GenerateCardsBody } from "@workspace/api-zod";
import { z } from "zod";

declare module "pdf-parse" {
  interface PDFData {
    text: string;
    numpages: number;
    info: Record<string, unknown>;
  }
  function pdfParse(buffer: Buffer): Promise<PDFData>;
  export = pdfParse;
}

const router: IRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/pdf", "text/plain"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and .txt files are allowed"));
    }
  },
});

const GeneratedCardSchema = z.object({
  front: z.string(),
  back: z.string(),
  hint: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  cardType: z.enum(["flashcard", "multiple_choice", "brain_dump"]).default("flashcard"),
});

async function generateCardsFromText(
  text: string,
  tags: string[],
  count: number,
  context?: string,
): Promise<z.infer<typeof GeneratedCardSchema>[]> {
  const systemPrompt = `You are an expert educator and flashcard creator. Generate high-quality flashcards from the provided content.
Always respond with a valid JSON array of flashcard objects. Each object must have:
- "front": the question or term (string)
- "back": the answer or definition (string)
- "hint": an optional brief hint (string or null)
- "tags": array of relevant topic tags (string array)
- "cardType": always "flashcard" for now

Focus on key concepts, definitions, and important facts. Make questions clear and concise.`;

  const userPrompt = `Generate ${count} flashcards from the following content.${tags.length > 0 ? ` Tags to apply: ${tags.join(", ")}.` : ""}${context ? ` Additional context: ${context}` : ""}

Content:
${text.slice(0, 8000)}

Respond with ONLY a JSON array, no markdown, no explanation. Example format:
[{"front":"What is X?","back":"X is...","hint":"Think about...","tags":["topic"],"cardType":"flashcard"}]`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "[]";

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  const parsed = JSON.parse(jsonMatch[0]);
  return z.array(GeneratedCardSchema).parse(parsed);
}

router.post("/ai/grade-blurt", async (req, res): Promise<void> => {
  const parsed = GradeBlurtBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { prompt, studentResponse, deckId, studentId, rubric } = parsed.data;

  const cards = await db
    .select({ front: cardsTable.front, back: cardsTable.back })
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId));

  if (cards.length === 0) {
    res.status(400).json({ error: "No cards found for this deck" });
    return;
  }

  const cardContent = cards
    .map((c, i) => `${i + 1}. Q: ${c.front} | A: ${c.back}`)
    .join("\n");

  const systemPrompt = `You are an expert educational evaluator. A student performed a free-recall (blurting) exercise where they wrote down everything they remember about a topic. Your job is to evaluate their response against the key concepts from the deck.

Deck content (questions and answers):
${cardContent}

${rubric ? `Custom rubric: ${rubric}` : ""}

Evaluate the student's response and return a JSON object with:
- score: integer 0-100 representing overall recall quality
- feedback: a concise, encouraging paragraph of overall feedback (2-3 sentences)
- correctConcepts: array of strings listing specific concepts/facts the student correctly recalled
- missedConcepts: array of strings listing key concepts the student missed or got wrong

Be encouraging and specific. Focus on what the student got right first, then gently note what they missed.
Respond ONLY with valid JSON, no other text.`;

  const userMessage = `Topic/Prompt: ${prompt}\n\nStudent's response:\n${studentResponse}`;

  let aiResult: { score: number; feedback: string; correctConcepts: string[]; missedConcepts: string[] };

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in AI response");
    }
    aiResult = JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("AI grading failed:", err);
    res.status(500).json({ error: "AI grading failed" });
    return;
  }

  const [session] = await db
    .insert(blurtingSessionsTable)
    .values({
      studentId,
      deckId,
      prompt,
      studentResponse,
      aiScore: aiResult.score,
      aiFeedback: aiResult.feedback,
      rubric: rubric ?? null,
    })
    .returning();

  res.json({
    score: aiResult.score,
    feedback: aiResult.feedback,
    correctConcepts: aiResult.correctConcepts ?? [],
    missedConcepts: aiResult.missedConcepts ?? [],
    sessionId: session.id,
  });
});

router.post("/ai/generate-cards", async (req, res): Promise<void> => {
  const parsed = GenerateCardsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { terms, context, tags = [], count = 10 } = parsed.data;

  try {
    const cards = await generateCardsFromText(terms, tags, count, context);
    res.json(cards);
  } catch (err) {
    console.error("AI generate-cards error:", err);
    res.status(500).json({ error: "Failed to generate cards" });
  }
});

router.post("/ai/bulk-generate", upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const tags = req.body.tags
    ? req.body.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
    : [];
  const count = parseInt(req.body.count ?? "10", 10);

  let text = "";

  try {
    if (req.file.mimetype === "application/pdf") {
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(req.file.buffer);
      text = data.text;
    } else {
      text = req.file.buffer.toString("utf-8");
    }

    if (!text.trim()) {
      res.status(400).json({ error: "Could not extract text from file" });
      return;
    }

    const cards = await generateCardsFromText(text, tags, count);
    res.json(cards);
  } catch (err) {
    console.error("AI bulk-generate error:", err);
    res.status(500).json({ error: "Failed to generate cards from file" });
  }
});

export default router;
