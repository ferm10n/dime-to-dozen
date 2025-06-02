import { pgTable, varchar, serial, timestamp, text, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from 'drizzle-zod';
import { z } from "zod/v4";

export const expenses = pgTable('expense', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  group: varchar('group', { length: 255 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  created_by: text('created_by').notNull(),
});
export const expenseInsertSchema = createInsertSchema(expenses, {
  created_by: schema => schema.min(3),
  group: schema => schema.min(3),
  name: schema => schema.min(3),
  amount: () => z.number().transform((val) => parseFloat(val.toFixed(2))),
});