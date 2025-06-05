import { pgTable, varchar, serial, timestamp, text, real, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from 'drizzle-zod';

export const expenses = pgTable('expense', {
  id: serial('id').primaryKey(),
  note: text('note').default(''),
  amount: real('amount').notNull(),
  group: varchar('group', { length: 255 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  created_by: text('created_by').notNull(),
});

export const budgets = pgTable('budget', {
  id: serial('id').primaryKey(),
  group: varchar('group', { length: 255 }).notNull(),
  amount: real('amount').notNull(),
  month: varchar('month', { length: 7 }).notNull(), // Format: "YYYY-MM"
}, table => [
  unique().on(table.group, table.month),
  index('month_idx').on(table.month),
]);

export const expenseInsertSchema = createInsertSchema(expenses, {
  created_by: schema => schema.min(3),
  group: schema => schema.min(3),
  note: schema => schema.optional(),
});

export const budgetInsertSchema = createInsertSchema(budgets, {
  group: schema => schema.min(3),
  month: schema => schema.regex(/^\d{4}-\d{2}$/, { message: "Month must be in format YYYY-MM" }),
});