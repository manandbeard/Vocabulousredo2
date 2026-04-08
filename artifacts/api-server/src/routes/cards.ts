import { Router, type IRouter } from "express";
import { eq, and, inArray, sql } from "drizzle-orm";
import { db, cardsTable, decksTable } from "@workspace/db";
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
  ListAllCardsQueryParams,
  UpdateCardStatusParams,
  UpdateCardStatusBody,
  AssignCardParams,
  AssignCardBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/cards", async (req, res): Promise<void> => {
  const params = ListAllCardsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { teacherId, classId, tag, status } = params.data;

  let deckIds: number[] | null = null;

  if (teacherId || classId) {
    const deckConditions = [];
    if (teacherId) {
      deckConditions.push(eq(decksTable.teacherId, teacherId));
    }
    if (classId) {
      deckConditions.push(eq(decksTable.classId, classId));
    }
    const decks = await db
      .select({ id: decksTable.id })
      .from(decksTable)
      .where(deckConditions.length === 1 ? deckConditions[0] : and(...deckConditions));
    deckIds = decks.map((d) => d.id);
    if (deckIds.length === 0) {
      res.json([]);
      return;
    }
  }

  const conditions = [];

  if (status) {
    conditions.push(eq(cardsTable.status, status as "active" | "archived" | "deleted"));
  } else {
    conditions.push(sql`${cardsTable.status} in ('active', 'archived')`);
  }

  if (deckIds !== null) {
    conditions.push(inArray(cardsTable.deckId, deckIds));
  }

  if (tag) {
    conditions.push(sql`${cardsTable.tags} @> ARRAY[${tag}]::text[]`);
  }

  const cards = await db
    .select()
    .from(cardsTable)
    .where(and(...conditions))
    .orderBy(cardsTable.createdAt);
  res.json(cards);
});

router.get("/decks/:deckId/cards", async (req, res): Promise<void> => {
  const params = ListCardsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const cards = await db
    .select()
    .from(cardsTable)
    .where(and(eq(cardsTable.deckId, params.data.deckId), inArray(cardsTable.status, ["active"] as const)))
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

router.patch("/cards/:id/status", async (req, res): Promise<void> => {
  const params = UpdateCardStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCardStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [card] = await db
    .update(cardsTable)
    .set({ status: parsed.data.status as "active" | "archived" | "deleted" })
    .where(eq(cardsTable.id, params.data.id))
    .returning();
  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return;
  }
  res.json(card);
});

router.patch("/cards/:id/assign", async (req, res): Promise<void> => {
  const params = AssignCardParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = AssignCardBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [card] = await db
    .update(cardsTable)
    .set({ deckId: parsed.data.deckId })
    .where(eq(cardsTable.id, params.data.id))
    .returning();
  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return;
  }
  res.json(card);
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
