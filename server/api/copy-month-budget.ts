import { db } from '../db/index.ts';
import { budgets, budgetInsertSchema } from '../db/schema.ts';
import { defineEndpoint, ensurePasskey, passkeySchema } from './util.ts';
import { eq, and, inArray } from 'drizzle-orm';
import { z } from 'zod/v4';

export const copyMonthBudgetEndpoint = defineEndpoint({
  inputSchema: passkeySchema.extend({
    fromMonth: budgetInsertSchema.shape.month,
    toMonth: budgetInsertSchema.shape.month,
    groups: z.array(budgetInsertSchema.shape.group),
  }),
  handler: async (body) => {
    await ensurePasskey(body);
    const { fromMonth, toMonth, groups } = body;
    // Get budgets for the selected groups in fromMonth
    const fromBudgets = await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.month, fromMonth), inArray(budgets.group, groups)));
    // Get existing budgets for toMonth for these groups
    const toBudgets = await db
      .select({ group: budgets.group })
      .from(budgets)
      .where(and(eq(budgets.month, toMonth), inArray(budgets.group, groups)));
    const toGroups = new Set(toBudgets.map(b => b.group));
    // Filter out groups that already exist in toMonth
    const toInsert = fromBudgets.filter(b => !toGroups.has(b.group));
    // Insert new budgets for toMonth
    for (const b of toInsert) {
      await db.insert(budgets).values({
        month: toMonth,
        group: b.group,
        amount: b.amount,
      }).onConflictDoNothing();
    }
    return { success: true, copied: toInsert.length };
  },
});
