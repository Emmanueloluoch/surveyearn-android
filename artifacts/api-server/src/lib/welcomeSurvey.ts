import { eq } from "drizzle-orm";
import { db, surveysTable, questionsTable } from "@workspace/db";
import { logger } from "./logger";

const WELCOME_SURVEY_TITLE = "Welcome Bonus Survey";
const WELCOME_REWARD = 1000;

let cachedWelcomeSurveyId: number | null = null;

const WELCOME_QUESTIONS = [
  {
    text: "How did you hear about SurveyEarn?",
    type: "single_choice" as const,
    options: JSON.stringify(["Friend or family", "Social media", "Google search", "Online ad", "Other"]),
    orderIndex: 0,
  },
  {
    text: "What is your age group?",
    type: "single_choice" as const,
    options: JSON.stringify(["18–24", "25–34", "35–44", "45–54", "55 or older"]),
    orderIndex: 1,
  },
  {
    text: "What is your current occupation?",
    type: "single_choice" as const,
    options: JSON.stringify(["Student", "Employed (full-time)", "Employed (part-time)", "Self-employed / Business owner", "Unemployed / Between jobs"]),
    orderIndex: 2,
  },
  {
    text: "Which county do you currently live in?",
    type: "text" as const,
    options: null,
    orderIndex: 3,
  },
  {
    text: "How often do you use M-Pesa?",
    type: "single_choice" as const,
    options: JSON.stringify(["Several times a day", "Once a day", "A few times a week", "Occasionally", "Rarely"]),
    orderIndex: 4,
  },
  {
    text: "Which product categories interest you most?",
    type: "multiple_choice" as const,
    options: JSON.stringify(["Food & Beverages", "Fashion & Beauty", "Electronics & Tech", "Health & Wellness", "Financial Services", "Transport & Mobility"]),
    orderIndex: 5,
  },
  {
    text: "What motivates you most to share your opinions?",
    type: "single_choice" as const,
    options: JSON.stringify(["Earning money", "Helping improve products & services", "Both equally", "Just curious"]),
    orderIndex: 6,
  },
];

export async function ensureWelcomeSurvey(): Promise<number> {
  if (cachedWelcomeSurveyId !== null) {
    return cachedWelcomeSurveyId;
  }

  const [existing] = await db
    .select({ id: surveysTable.id })
    .from(surveysTable)
    .where(eq(surveysTable.title, WELCOME_SURVEY_TITLE))
    .limit(1);

  if (existing) {
    cachedWelcomeSurveyId = existing.id;
    return existing.id;
  }

  logger.info("Creating welcome bonus survey");

  const [survey] = await db
    .insert(surveysTable)
    .values({
      title: WELCOME_SURVEY_TITLE,
      description: "Tell us a bit about yourself and unlock your KSh 1,000 welcome bonus!",
      reward: WELCOME_REWARD,
      isPublished: true,
    })
    .returning({ id: surveysTable.id });

  await db.insert(questionsTable).values(
    WELCOME_QUESTIONS.map((q) => ({ ...q, surveyId: survey.id, required: true }))
  );

  logger.info({ surveyId: survey.id }, "Welcome bonus survey created");
  cachedWelcomeSurveyId = survey.id;
  return survey.id;
}
