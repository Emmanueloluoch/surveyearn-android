import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { SignupBody, LoginBody } from "@workspace/api-zod";
import { ensureWelcomeSurvey } from "../lib/welcomeSurvey";
import { generateReferralCode } from "../lib/referralCode";

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

  // Look up referrer if a code was provided
  let referredByUserId: number | null = null;
  if (parsed.data.referralCode) {
    const [referrer] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.referralCode, parsed.data.referralCode.trim().toUpperCase()))
      .limit(1);
    if (referrer) {
      referredByUserId = referrer.id;
    }
  }

  const [welcomeSurveyId, [user]] = await Promise.all([
    ensureWelcomeSurvey(),
    db
      .insert(usersTable)
      .values({
        name: parsed.data.name,
        phone: parsed.data.phone,
        referredByUserId,
      })
      .returning(),
  ]);

  // Generate and store this user's own referral code (based on their new ID)
  const referralCode = generateReferralCode(user.id);
  await db
    .update(usersTable)
    .set({ referralCode })
    .where(eq(usersTable.id, user.id));

  res.status(201).json({
    userId: user.id,
    name: user.name,
    phone: user.phone,
    points: user.points,
    isActivated: user.isActivated,
    isVip: user.isVip,
    welcomeSurveyId,
    referralCode,
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

  // Ensure this user has a referral code stored (backfill for existing users)
  let referralCode = user.referralCode;
  if (!referralCode) {
    referralCode = generateReferralCode(user.id);
    await db
      .update(usersTable)
      .set({ referralCode })
      .where(eq(usersTable.id, user.id));
  }

  const welcomeSurveyId = await ensureWelcomeSurvey();

  res.json({
    userId: user.id,
    name: user.name,
    phone: user.phone,
    points: user.points,
    isActivated: user.isActivated,
    isVip: user.isVip,
    welcomeSurveyId,
    referralCode,
  });
});

export default router;
