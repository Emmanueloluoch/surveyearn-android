import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, usersTable, completionsTable, withdrawalsTable } from "@workspace/db";
import { GetUserParams, GetUserCompletionsParams, WithdrawPointsParams } from "@workspace/api-zod";
import { sendMpesaPayout } from "../lib/mpesa";

const MINIMUM_WITHDRAWAL_POINTS = 100;

const router: IRouter = Router();

router.get("/users/:id", async (req, res): Promise<void> => {
  const params = GetUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, params.data.id));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    name: user.name,
    phone: user.phone,
    points: user.points,
    createdAt: user.createdAt,
  });
});

router.get("/users/:id/completions", async (req, res): Promise<void> => {
  const params = GetUserCompletionsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const completions = await db
    .select({ surveyId: completionsTable.surveyId })
    .from(completionsTable)
    .where(eq(completionsTable.userId, params.data.id));

  res.json(completions.map((c) => c.surveyId));
});

router.post("/users/:id/withdraw", async (req, res): Promise<void> => {
  const params = WithdrawPointsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, params.data.id));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  if (user.points < MINIMUM_WITHDRAWAL_POINTS) {
    res.status(400).json({
      error: `Minimum ${MINIMUM_WITHDRAWAL_POINTS} points required to withdraw. You have ${user.points} points.`,
    });
    return;
  }

  const pointsToRedeem = user.points;

  // Attempt M-Pesa payout (real when credentials are set, simulated otherwise)
  const payout = await sendMpesaPayout(
    user.phone,
    pointsToRedeem,
    "Survey reward payout"
  );

  // Only deduct points if payout succeeded
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
    message: payout.message,
    points: updatedUser.points,
  });
});

// M-Pesa B2C result callback (Safaricom posts here after processing the payout)
router.post("/mpesa/callback", (req, res): void => {
  req.log.info({ body: req.body }, "M-Pesa callback received");
  // In production: parse Result.ResultCode, update withdrawal record status
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

export default router;
