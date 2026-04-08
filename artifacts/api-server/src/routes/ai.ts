import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, cardsTable, blurtingSessionsTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GradeBlurtBody } from "@workspace/api-zod";

const router: IRouter = Router();

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

export default router;
