import { db } from '../db/index.ts';
import { expenses } from '../db/schema.ts';
import { defineEndpoint, ensurePasskey, passkeySchema } from './util.ts';
import { z } from 'zod/v4';
import { eq } from 'drizzle-orm';

export const deleteExpenseEndpoint = defineEndpoint({
  inputSchema: passkeySchema.extend({
    id: z.number().int().positive(),
  }),
  handler: async (body) => {
    await ensurePasskey(body);

    const deletedExpense = await db
      .delete(expenses)
      .where(eq(expenses.id, body.id))
      .returning();

    if (deletedExpense.length === 0) {
      throw new Response('Expense not found', {
        status: 404,
        headers: { 'content-type': 'text/plain' },
      });
    }

    return { success: true, deletedExpense: deletedExpense[0] };
  },
});
