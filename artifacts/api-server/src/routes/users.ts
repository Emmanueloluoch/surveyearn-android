import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, usersTable, completionsTable, withdrawalsTable } from "@workspace/db";
import { GetUserParams, GetUserCompletionsParams, WithdrawPointsParams, ActivateUserParams, ActivateUserBody, UpgradeToVipParams, UpgradeToVipBody } from "@workspace/api-zod";
import { sendMpesaPayout } from "../lib/mpesa";

const ACTIVATION_FEE_KSH = 150;
const VIP_FEE_KSH = 500;
const REFERRAL_REWARD_KSH = 200;

const MINIMUM_WITHDRAWAL_POINTS = 3000;

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
    isActivated: user.isActivated,
    isVip: user.isVip,
    referralCode: user.referralCode ?? null,
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

router.post("/users/:id/activate", async (req, res): Promise<void> => {
  const params = ActivateUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = ActivateUserBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
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

  if (user.isActivated) {
    res.status(400).json({ error: "Account is already activated" });
    return;
  }

  const [updatedUser] = await db
    .update(usersTable)
    .set({
      isActivated: true,
      activationMpesaCode: body.data.mpesaCode,
      points: sql`${usersTable.points} + ${ACTIVATION_FEE_KSH}`,
    })
    .where(eq(usersTable.id, user.id))
    .returning();

  // Credit the referrer KSh 200 if this user was referred and not yet credited
  if (user.referredByUserId && !user.referralCredited) {
    await db
      .update(usersTable)
      .set({ points: sql`${usersTable.points} + ${REFERRAL_REWARD_KSH}` })
      .where(eq(usersTable.id, user.referredByUserId));

    await db
      .update(usersTable)
      .set({ referralCredited: true })
      .where(eq(usersTable.id, user.id));
  }

  res.json({
    isActivated: true,
    points: updatedUser.points,
    message: `Account activated! KSh ${ACTIVATION_FEE_KSH} added to your balance.`,
  });
});

router.post("/users/:id/vip", async (req, res): Promise<void> => {
  const params = UpgradeToVipParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpgradeToVipBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
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

  if (!user.isActivated) {
    res.status(400).json({ error: "Account must be activated before upgrading to VIP" });
    return;
  }

  if (user.isVip) {
    res.status(400).json({ error: "Account is already VIP" });
    return;
  }

  const [updatedUser] = await db
    .update(usersTable)
    .set({
      isVip: true,
      vipMpesaCode: body.data.mpesaCode,
      points: sql`${usersTable.points} + ${VIP_FEE_KSH}`,
    })
    .where(eq(usersTable.id, user.id))
    .returning();

  res.json({
    isVip: true,
    points: updatedUser.points,
    message: `VIP access unlocked! KSh ${VIP_FEE_KSH} added to your balance.`,
  });
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
