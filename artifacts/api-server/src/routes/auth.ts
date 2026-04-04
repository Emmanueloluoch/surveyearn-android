import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { SignupBody, LoginBody } from "@workspace/api-zod";
import { ensureWelcomeSurvey } from "../lib/welcomeSurvey";

const router: IRouter = Router();

router.post("/auth/signup", async (req, res): Promise<void> => {
  const parsed = SignupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.phone, parsed.data.phone));

  if (existing.length > 0) {
    res.status(400).json({ error: "Phone number already registered" });
    return;
  }

  const [welcomeSurveyId, [user]] = await Promise.all([
    ensureWelcomeSurvey(),
    db
      .insert(usersTable)
      .values({ name: parsed.data.name, phone: parsed.data.phone })
      .returning(),
  ]);

  res.status(201).json({
    userId: user.id,
    name: user.name,
    phone: user.phone,
    points: user.points,
    isActivated: user.isActivated,
    welcomeSurveyId,
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.phone, parsed.data.phone));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    userId: user.id,
    name: user.name,
    phone: user.phone,
    points: user.points,
    isActivated: user.isActivated,
    welcomeSurveyId: null,
  });
});

export default router;
