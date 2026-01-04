import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { budgetInsertSchema, expenses } from '../db/schema.ts';
import { defineEndpoint, ensurePasskey, passkeySchema } from './util.ts';

export const getExpensesEndpoint = defineEndpoint({
  inputSchema: passkeySchema.extend({
    month: budgetInsertSchema.shape.month.optional(),
    group: budgetInsertSchema.shape.group.optional(),
  }),
  handler: async (body) => {
    await ensurePasskey(body);

    // Build the where conditions array
    const conditions = [];

    // Filter by month if provided
    if (body.month) {
      conditions.push(eq(expenses.month, body.month));
    }

    // Filter by group if provided
    if (body.group) {
      conditions.push(eq(expenses.group, body.group));
    }

    // Apply conditions if any exist
    if (conditions.length > 0) {
      return await db
        .select()
        .from(expenses)
        .where(and(...conditions))
        .orderBy(desc(expenses.created_at));
    }

    // Otherwise return all expenses
    return await db
      .select()
      .from(expenses)
      .orderBy(desc(expenses.created_at));
  },
});
