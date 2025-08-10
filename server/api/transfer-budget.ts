import { db } from '../db/index.ts';
import { budgetInsertSchema, budgets } from '../db/schema.ts';
import { defineEndpoint, ensurePasskey, passkeySchema } from './util.ts';
import { z } from 'zod/v4';

const transferSchema = z.object({
  groupId: z.string().min(1),
  amount: z.number().min(0),
});

export const transferBudgetEndpoint = defineEndpoint({
  inputSchema: passkeySchema.extend({
    month: budgetInsertSchema.shape.month,
    fromGroup: budgetInsertSchema.shape.group,
    transfers: z.array(transferSchema).min(1),
  }),
  handler: async (body) => {
    await ensurePasskey(body);
    const { month, fromGroup, transfers } = body;

    // Calculate total transfer amount
    const totalTransferAmount = transfers.reduce(
      (sum, transfer) => sum + transfer.amount,
      0,
    );

    // Use a transaction to ensure all updates succeed or fail together
    await db.transaction(async (tx) => {
      // Update the from group by subtracting the total transfer amount
      await tx.insert(budgets).values({
        month,
        group: fromGroup,
        amount: -totalTransferAmount, // This will be added to existing amount in upsert
      }).onConflictDoUpdate({
        target: [budgets.group, budgets.month],
        set: {
          amount: budgets.amount - totalTransferAmount,
        },
      });

      // Update each destination group by adding the transfer amount
      for (const transfer of transfers) {
        await tx.insert(budgets).values({
          month,
          group: transfer.groupId,
          amount: transfer.amount,
        }).onConflictDoUpdate({
          target: [budgets.group, budgets.month],
          set: {
            amount: budgets.amount + transfer.amount,
          },
        });
      }
    });

    return { success: true };
  },
});
