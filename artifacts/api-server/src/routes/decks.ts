import { Router, type IRouter } from "express";
import { eq, sql, and } from "drizzle-orm";
import { db, decksTable, cardsTable } from "@workspace/db";
import {
  ListDecksQueryParams,
  ListDecksResponse,
  CreateDeckBody,
  GetDeckParams,
  GetDeckResponse,
  UpdateDeckParams,
  UpdateDeckBody,
  UpdateDeckResponse,
  DeleteDeckParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/decks", async (req, res): Promise<void> => {
  const query = ListDecksQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions = [];
  if (query.data.classId) conditions.push(eq(decksTable.classId, query.data.classId));
  if (query.data.teacherId) conditions.push(eq(decksTable.teacherId, query.data.teacherId));

  const decks = await db
    .select({
      id: decksTable.id,
      name: decksTable.name,
      description: decksTable.description,
      classId: decksTable.classId,
      teacherId: decksTable.teacherId,
      createdAt: decksTable.createdAt,
      updatedAt: decksTable.updatedAt,
      cardCount: sql<number>`cast(count(${cardsTable.id}) as int)`,
    })
    .from(decksTable)
    .leftJoin(cardsTable, eq(decksTable.id, cardsTable.deckId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(decksTable.id)
    .orderBy(decksTable.createdAt);

  res.json(ListDecksResponse.parse(decks));
});

router.post("/decks", async (req, res): Promise<void> => {
  const parsed = CreateDeckBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [deck] = await db.insert(decksTable).values(parsed.data).returning();
  res.status(201).json(GetDeckResponse.parse({ ...deck, cardCount: 0 }));
});

router.get("/decks/:id", async (req, res): Promise<void> => {
  const params = GetDeckParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deck] = await db
    .select({
      id: decksTable.id,
      name: decksTable.name,
      description: decksTable.description,
      classId: decksTable.classId,
      teacherId: decksTable.teacherId,
      createdAt: decksTable.createdAt,
      updatedAt: decksTable.updatedAt,
      cardCount: sql<number>`cast(count(${cardsTable.id}) as int)`,
    })
    .from(decksTable)
    .leftJoin(cardsTable, eq(decksTable.id, cardsTable.deckId))
    .where(eq(decksTable.id, params.data.id))
    .groupBy(decksTable.id);

  if (!deck) {
    res.status(404).json({ error: "Deck not found" });
    return;
  }
  res.json(GetDeckResponse.parse(deck));
});

router.patch("/decks/:id", async (req, res): Promise<void> => {
  const params = UpdateDeckParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateDeckBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [deck] = await db
    .update(decksTable)
    .set(parsed.data)
    .where(eq(decksTable.id, params.data.id))
    .returning();
  if (!deck) {
    res.status(404).json({ error: "Deck not found" });
    return;
  }
  res.json(UpdateDeckResponse.parse({ ...deck, cardCount: 0 }));
});

router.delete("/decks/:id", async (req, res): Promise<void> => {
  const params = DeleteDeckParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deck] = await db.delete(decksTable).where(eq(decksTable.id, params.data.id)).returning();
  if (!deck) {
    res.status(404).json({ error: "Deck not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
