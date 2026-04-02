import { pgTable, text, timestamp, integer, jsonb, varchar, uuid, boolean } from 'drizzle-orm/pg-core';

export const surveys = pgTable('surveys', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).notNull().default('draft'), // draft | active | closed
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const questions = pgTable('questions', {
  id: varchar('id', { length: 20 }).notNull(), // e.g. "CAM-01"
  surveyId: uuid('survey_id').notNull().references(() => surveys.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 20 }).notNull(), // likert | open_ended | demographic
  dimension: varchar('dimension', { length: 30 }),
  subPillar: varchar('sub_pillar', { length: 50 }),
  en: text('en').notNull(),
  my: text('my').notNull(),
  options: jsonb('options'), // for demographic select fields
  sortOrder: integer('sort_order').notNull().default(0),
});

export const tokens = pgTable('tokens', {
  token: varchar('token', { length: 64 }).primaryKey(),
  surveyId: uuid('survey_id').notNull().references(() => surveys.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending | submitted
  createdAt: timestamp('created_at').notNull().defaultNow(),
  submittedAt: timestamp('submitted_at'),
});

export const responses = pgTable('responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  surveyId: uuid('survey_id').notNull().references(() => surveys.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 64 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  answers: jsonb('answers').notNull(), // Record<string, string>
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
});

export const departments = pgTable('departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  nameMy: text('name_my').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const smtpSettings = pgTable('smtp_settings', {
  id: integer('id').primaryKey().default(1), // singleton row
  host: text('host').notNull(),
  port: varchar('port', { length: 10 }).notNull().default('587'),
  username: text('username').notNull(),
  password: text('password').notNull(),
  fromAddress: varchar('from_address', { length: 255 }).notNull(),
  fromName: varchar('from_name', { length: 255 }).notNull(),
});
