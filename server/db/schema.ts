import { pgTable, varchar, serial, timestamp, text, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from 'drizzle-zod';

export const expenses = pgTable('expense', {
  id: serial('id').primaryKey(),
  note: text('note'),
  amount: real('amount').notNull(),
  group: varchar('group', { length: 255 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  created_by: text('created_by').notNull(),
});

export const expenseInsertSchema = createInsertSchema(expenses, {
  created_by: schema => schema.min(3),
  group: schema => schema.min(3),
  note: schema => schema.optional(), // Made optional
});