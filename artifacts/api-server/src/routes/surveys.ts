import { Router, type IRouter } from "express";
import { eq, sql, and } from "drizzle-orm";
import {
  db,
  surveysTable,
  questionsTable,
  surveyResponsesTable,
  completionsTable,
  usersTable,
} from "@workspace/db";
import {
  CreateSurveyBody,
  UpdateSurveyBody,
  GetSurveyParams,
  UpdateSurveyParams,
  DeleteSurveyParams,
  ListSurveyQuestionsParams,
  ListSurveyResponsesParams,
  SubmitSurveyResponseParams,
  SubmitSurveyResponseBody,
  GetSurveySummaryParams,
  CompleteSurveyParams,
  CompleteSurveyBody,
  CreateQuestionBody,
  UpdateQuestionParams,
  UpdateQuestionBody,
  DeleteQuestionParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function surveyWithCounts(survey: typeof surveysTable.$inferSelect) {
  const [{ questionCount }] = await db
    .select({ questionCount: sql<number>`count(*)::int` })
    .from(questionsTable)
    .where(eq(questionsTable.surveyId, survey.id));

  const [{ responseCount }] = await db
    .select({ responseCount: sql<number>`count(*)::int` })
    .from(surveyResponsesTable)
    .where(eq(surveyResponsesTable.surveyId, survey.id));

  return {
    ...survey,
    questionCount,
    responseCount,
  };
}

router.get("/surveys", async (_req, res): Promise<void> => {
  const surveys = await db.select().from(surveysTable).orderBy(surveysTable.createdAt);
  const result = await Promise.all(surveys.map(surveyWithCounts));
  res.json(result);
});

router.post("/surveys", async (req, res): Promise<void> => {
  const parsed = CreateSurveyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [survey] = await db.insert(surveysTable).values(parsed.data).returning();
  res.status(201).json({ ...survey, questionCount: 0, responseCount: 0 });
});

router.get("/surveys/:id", async (req, res): Promise<void> => {
  const params = GetSurveyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [survey] = await db.select().from(surveysTable).where(eq(surveysTable.id, params.data.id));
  if (!survey) {
    res.status(404).json({ error: "Survey not found" });
    return;
  }

  res.json(await surveyWithCounts(survey));
});

router.patch("/surveys/:id", async (req, res): Promise<void> => {
  const params = UpdateSurveyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateSurveyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [survey] = await db
    .update(surveysTable)
    .set(parsed.data)
    .where(eq(surveysTable.id, params.data.id))
    .returning();

  if (!survey) {
    res.status(404).json({ error: "Survey not found" });
    return;
  }

  res.json(await surveyWithCounts(survey));
});

router.delete("/surveys/:id", async (req, res): Promise<void> => {
  const params = DeleteSurveyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [survey] = await db.delete(surveysTable).where(eq(surveysTable.id, params.data.id)).returning();
  if (!survey) {
    res.status(404).json({ error: "Survey not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/surveys/:id/complete", async (req, res): Promise<void> => {
  const params = CompleteSurveyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CompleteSurveyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [survey] = await db.select().from(surveysTable).where(eq(surveysTable.id, params.data.id));
  if (!survey) {
    res.status(404).json({ error: "Survey not found" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, parsed.data.userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const existing = await db
    .select()
    .from(completionsTable)
    .where(
      and(
        eq(completionsTable.userId, parsed.data.userId),
        eq(completionsTable.surveyId, params.data.id)
      )
    );

  if (existing.length > 0) {
    res.status(400).json({ error: "Survey already completed" });
    return;
  }

  await db.insert(completionsTable).values({
    userId: parsed.data.userId,
    surveyId: params.data.id,
    pointsEarned: survey.reward,
  });

  const [updatedUser] = await db
    .update(usersTable)
    .set({ points: sql`${usersTable.points} + ${survey.reward}` })
    .where(eq(usersTable.id, parsed.data.userId))
    .returning();

  res.json({
    points: updatedUser.points,
    pointsEarned: survey.reward,
    message: `You earned ${survey.reward} points for completing this survey!`,
  });
});

router.get("/surveys/:id/questions", async (req, res): Promise<void> => {
  const params = ListSurveyQuestionsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const questions = await db
    .select()
    .from(questionsTable)
    .where(eq(questionsTable.surveyId, params.data.id))
    .orderBy(questionsTable.orderIndex);

  res.json(questions);
});

router.get("/surveys/:id/responses", async (req, res): Promise<void> => {
  const params = ListSurveyResponsesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const responses = await db
    .select()
    .from(surveyResponsesTable)
    .where(eq(surveyResponsesTable.surveyId, params.data.id))
    .orderBy(surveyResponsesTable.submittedAt);

  res.json(responses);
});

router.post("/surveys/:id/responses", async (req, res): Promise<void> => {
  const params = SubmitSurveyResponseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = SubmitSurveyResponseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [survey] = await db.select().from(surveysTable).where(eq(surveysTable.id, params.data.id));
  if (!survey) {
    res.status(404).json({ error: "Survey not found" });
    return;
  }

  const [response] = await db
    .insert(surveyResponsesTable)
    .values({
      surveyId: params.data.id,
      respondentName: parsed.data.respondentName ?? null,
      answers: JSON.stringify(parsed.data.answers),
    })
    .returning();

  res.status(201).json(response);
});

router.get("/surveys/:id/summary", async (req, res): Promise<void> => {
  const params = GetSurveySummaryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [survey] = await db.select().from(surveysTable).where(eq(surveysTable.id, params.data.id));
  if (!survey) {
    res.status(404).json({ error: "Survey not found" });
    return;
  }

  const questions = await db
    .select()
    .from(questionsTable)
    .where(eq(questionsTable.surveyId, params.data.id))
    .orderBy(questionsTable.orderIndex);

  const responses = await db
    .select()
    .from(surveyResponsesTable)
    .where(eq(surveyResponsesTable.surveyId, params.data.id));

  const totalResponses = responses.length;

  const questionSummaries = questions.map((question) => {
    const answerBreakdown: Record<string, number> = {};
    let totalAnswers = 0;

    for (const response of responses) {
      let answers: Record<string, string> = {};
      try {
        answers = JSON.parse(response.answers);
      } catch {
        continue;
      }

      const answer = answers[String(question.id)];
      if (answer !== undefined && answer !== "") {
        totalAnswers++;
        if (question.type === "multiple_choice") {
          const choices = answer.split(",").map((c) => c.trim());
          for (const choice of choices) {
            if (choice) {
              answerBreakdown[choice] = (answerBreakdown[choice] ?? 0) + 1;
            }
          }
        } else {
          answerBreakdown[answer] = (answerBreakdown[answer] ?? 0) + 1;
        }
      }
    }

    return {
      questionId: question.id,
      questionText: question.text,
      questionType: question.type,
      answerBreakdown,
      totalAnswers,
    };
  });

  res.json({ surveyId: params.data.id, totalResponses, questions: questionSummaries });
});

router.post("/questions", async (req, res): Promise<void> => {
  const parsed = CreateQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [question] = await db.insert(questionsTable).values(parsed.data).returning();
  res.status(201).json(question);
});

router.patch("/questions/:id", async (req, res): Promise<void> => {
  const params = UpdateQuestionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [question] = await db
    .update(questionsTable)
    .set(parsed.data)
    .where(eq(questionsTable.id, params.data.id))
    .returning();

  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  res.json(question);
});

router.delete("/questions/:id", async (req, res): Promise<void> => {
  const params = DeleteQuestionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [question] = await db.delete(questionsTable).where(eq(questionsTable.id, params.data.id)).returning();
  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
