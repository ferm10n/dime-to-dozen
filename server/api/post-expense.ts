import { db } from '../db/index.ts';
import { expenseInsertSchema, expenses, groups } from '../db/schema.ts';
import { defineEndpoint, ensurePasskey, passkeySchema } from './util.ts';

export const postExpenseEndpoint = defineEndpoint({
  inputSchema: passkeySchema.extend({
    ...expenseInsertSchema.shape,
    month: expenseInsertSchema.shape.month.default(() => {
      const now = new Date();
      return `${now.getFullYear()}-${
        String(now.getMonth() + 1).padStart(2, '0')
      }`;
    }),
  }),
  handler: async (body) => {
    await ensurePasskey(body);

    // ensure the group exists before inserting the expense
    await db
      .insert(groups)
      .values({ group: body.group })
      .onConflictDoNothing();

    const createdExpense = await db.insert(expenses).values(body).returning();
    return createdExpense;
  },
});
