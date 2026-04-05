import app from "./app";
import { logger } from "./lib/logger";
import { ensureWelcomeSurvey } from "./lib/welcomeSurvey";
import { ensureTopicSurveys } from "./lib/ensureSurveys";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  try {
    const welcomeSurveyId = await ensureWelcomeSurvey();
    logger.info({ welcomeSurveyId }, "Welcome bonus survey ready");
  } catch (e) {
    logger.error({ err: e }, "Failed to ensure welcome survey on startup");
  }

  try {
    await ensureTopicSurveys();
  } catch (e) {
    logger.error({ err: e }, "Failed to ensure topic surveys on startup");
  }
});
