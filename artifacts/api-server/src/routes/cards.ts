import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, cardsTable } from "@workspace/db";
import {
  ListCardsParams,
  ListCardsResponse,
  CreateCardParams,
  CreateCardBody,
  GetCardParams,
  GetCardResponse,
  UpdateCardParams,
  UpdateCardBody,
  UpdateCardResponse,
  DeleteCardParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/decks/:deckId/cards", async (req, res): Promise<void> => {
  const params = ListCardsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const cards = await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, params.data.deckId))
    .orderBy(cardsTable.createdAt);
  res.json(ListCardsResponse.parse(cards));
});

router.post("/decks/:deckId/cards", async (req, res): Promise<void> => {
  const params = CreateCardParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateCardBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [card] = await db
    .insert(cardsTable)
    .values({ ...parsed.data, deckId: params.data.deckId, tags: parsed.data.tags ?? [] })
    .returning();
  res.status(201).json(GetCardResponse.parse(card));
});

router.get("/cards/:id", async (req, res): Promise<void> => {
  const params = GetCardParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [card] = await db.select().from(cardsTable).where(eq(cardsTable.id, params.data.id));
  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return;
  }
  res.json(GetCardResponse.parse(card));
});

router.patch("/cards/:id", async (req, res): Promise<void> => {
  const params = UpdateCardParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCardBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [card] = await db
    .update(cardsTable)
    .set(parsed.data)
    .where(eq(cardsTable.id, params.data.id))
    .returning();
  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return;
  }
  res.json(UpdateCardResponse.parse(card));
});

router.delete("/cards/:id", async (req, res): Promise<void> => {
  const params = DeleteCardParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [card] = await db.delete(cardsTable).where(eq(cardsTable.id, params.data.id)).returning();
  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
