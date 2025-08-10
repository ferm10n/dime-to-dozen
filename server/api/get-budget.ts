import { and, eq, SQLWrapper } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { budgetInsertSchema, budgets } from '../db/schema.ts';
import { defineEndpoint, ensurePasskey, passkeySchema } from './util.ts';

export const getBudgetEndpoint = defineEndpoint({
  inputSchema: passkeySchema.extend({
    month: budgetInsertSchema.shape.month.optional(),
    group: budgetInsertSchema.shape.group.optional(),
  }),
  handler: async (body) => {
    await ensurePasskey(body);

    // If a month is specified, filter by that month
    if (body.month) {
      const filters: SQLWrapper[] = [];
      filters.push(eq(budgets.month, body.month));
      if (body.group) {
        filters.push(eq(budgets.group, body.group));
      }

      const budgetsForMonth = await db
        .select()
        .from(budgets)
        .where(and(...filters))
        .orderBy(budgets.group);

      return budgetsForMonth;
    }

    // If no month specified, return all budgets
    // TODO I think these returns can be combined
    const allBudgets = await db
      .select()
      .from(budgets)
      .orderBy(budgets.month, budgets.group);

    return allBudgets;
  },
});
