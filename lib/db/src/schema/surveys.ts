import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const surveysTable = pgTable("surveys", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  reward: integer("reward").notNull().default(0),
  externalUrl: text("external_url"),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSurveySchema = createInsertSchema(surveysTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSurvey = z.infer<typeof insertSurveySchema>;
export type Survey = typeof surveysTable.$inferSelect;

export const questionsTable = pgTable("questions", {
  id: serial("id").primaryKey(),
  surveyId: integer("survey_id").notNull().references(() => surveysTable.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  type: text("type").notNull().default("text"),
  options: text("options"),
  orderIndex: integer("order_index").notNull().default(0),
  required: boolean("required").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertQuestionSchema = createInsertSchema(questionsTable).omit({ id: true, createdAt: true });
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questionsTable.$inferSelect;

export const surveyResponsesTable = pgTable("survey_responses", {
  id: serial("id").primaryKey(),
  surveyId: integer("survey_id").notNull().references(() => surveysTable.id, { onDelete: "cascade" }),
  respondentName: text("respondent_name"),
  answers: text("answers").notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSurveyResponseSchema = createInsertSchema(surveyResponsesTable).omit({ id: true, submittedAt: true });
export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;
export type SurveyResponse = typeof surveyResponsesTable.$inferSelect;

export const completionsTable = pgTable("completions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  surveyId: integer("survey_id").notNull().references(() => surveysTable.id, { onDelete: "cascade" }),
  pointsEarned: integer("points_earned").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Completion = typeof completionsTable.$inferSelect;
