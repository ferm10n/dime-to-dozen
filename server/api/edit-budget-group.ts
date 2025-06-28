import { db } from '../db/index.ts';
import { budgets, budgetInsertSchema } from '../db/schema.ts';
import { defineEndpoint, ensurePasskey, passkeySchema } from './util.ts';

export const editBudgetGroupEndpoint = defineEndpoint({
  inputSchema: passkeySchema.extend({
    month: budgetInsertSchema.shape.month,
    group: budgetInsertSchema.shape.group,
    amount: budgetInsertSchema.shape.amount,
  }),
  handler: async (body) => {
    await ensurePasskey(body);
    const { month, group, amount } = body;
    // Upsert the budget for the group/month
    await db.insert(budgets).values({ month, group, amount })
      .onConflictDoUpdate({
        target: [budgets.group, budgets.month],
        set: { amount },
      });
    return { success: true };
  },
});
