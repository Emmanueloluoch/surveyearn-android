/**
 * Compatibility endpoints matching the original SurveyPesa KE script.js API contract.
 *
 * Original script uses:
 *   POST /signup   { name, phone }          → { success, userId, name, phone, points }
 *   POST /login    { phone }                → { success, userId, name, phone, points }
 *   GET  /surveys                           → [...surveys]   (already exists)
 *   POST /submit   { userId, surveyId }     → { success, points }
 *   POST /withdraw { userId }               → { success, message, points }
 *
 * Set API = "<your-replit-url>/api" in script.js to use these routes.
 */

import { Router, type IRouter } from "express";
import { eq, sql, and } from "drizzle-orm";
import { db, usersTable, surveysTable, completionsTable, withdrawalsTable } from "@workspace/db";
import { sendMpesaPayout } from "../lib/mpesa";

const router: IRouter = Router();

// POST /signup
router.post("/signup", async (req, res): Promise<void> => {
  const { name, phone } = req.body ?? {};
  if (!name || !phone) {
    res.status(400).json({ success: false, error: "name and phone are required" });
    return;
  }

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.phone, String(phone)));

  if (existing.length > 0) {
    res.status(400).json({ success: false, error: "Phone number already registered" });
    return;
  }

  const [user] = await db
    .insert(usersTable)
    .values({ name: String(name), phone: String(phone) })
    .returning();

  res.status(201).json({
    success: true,
    userId: user.id,
    name: user.name,
    phone: user.phone,
    points: user.points,
  });
});

// POST /login
router.post("/login", async (req, res): Promise<void> => {
  const { phone } = req.body ?? {};
  if (!phone) {
    res.status(400).json({ success: false, error: "phone is required" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.phone, String(phone)));

  if (!user) {
    res.status(404).json({ success: false, error: "User not found. Please sign up first." });
    return;
  }

  res.json({
    success: true,
    userId: user.id,
    name: user.name,
    phone: user.phone,
    points: user.points,
  });
});

// POST /submit  { userId, surveyId }
router.post("/submit", async (req, res): Promise<void> => {
  const { userId, surveyId } = req.body ?? {};
  if (!userId || !surveyId) {
    res.status(400).json({ success: false, error: "userId and surveyId are required" });
    return;
  }

  const [survey] = await db
    .select()
    .from(surveysTable)
    .where(eq(surveysTable.id, Number(surveyId)));

  if (!survey) {
    res.status(404).json({ success: false, error: "Survey not found" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, Number(userId)));

  if (!user) {
    res.status(404).json({ success: false, error: "User not found" });
    return;
  }

  const existing = await db
    .select()
    .from(completionsTable)
    .where(
      and(
        eq(completionsTable.userId, Number(userId)),
        eq(completionsTable.surveyId, Number(surveyId))
      )
    );

  if (existing.length > 0) {
    res.status(400).json({ success: false, error: "Survey already completed" });
    return;
  }

  await db.insert(completionsTable).values({
    userId: Number(userId),
    surveyId: Number(surveyId),
    pointsEarned: survey.reward,
  });

  const [updatedUser] = await db
    .update(usersTable)
    .set({ points: sql`${usersTable.points} + ${survey.reward}` })
    .where(eq(usersTable.id, Number(userId)))
    .returning();

  res.json({
    success: true,
    points: updatedUser.points,
    pointsEarned: survey.reward,
    message: `You earned ${survey.reward} points!`,
  });
});

// POST /withdraw  { userId }
router.post("/withdraw", async (req, res): Promise<void> => {
  const { userId } = req.body ?? {};
  if (!userId) {
    res.status(400).json({ success: false, error: "userId is required" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, Number(userId)));

  if (!user) {
    res.status(404).json({ success: false, error: "User not found" });
    return;
  }

  if (user.points < 100) {
    res.status(400).json({
      success: false,
      error: `Minimum 100 points required to withdraw. You have ${user.points} points.`,
    });
    return;
  }

  const pointsToRedeem = user.points;
  const payout = await sendMpesaPayout(user.phone, pointsToRedeem);

  await db.insert(withdrawalsTable).values({
    userId: user.id,
    pointsRedeemed: pointsToRedeem,
  });

  const [updatedUser] = await db
    .update(usersTable)
    .set({ points: sql`${usersTable.points} - ${pointsToRedeem}` })
    .where(eq(usersTable.id, user.id))
    .returning();

  res.json({
    success: true,
    message: payout.message,
    points: updatedUser.points,
  });
});

export default router;
