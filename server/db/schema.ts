import { pgTable, varchar, serial, timestamp, text, decimal } from "drizzle-orm/pg-core";

export const expensesTable = pgTable('expense', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  group: varchar('group', { length: 255 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  created_by: text('created_by').notNull(),
});
