import { db } from "../db/index.ts";
import { expenses } from "../db/schema.ts";
import { defineEndpoint, ensurePasskey, passkeySchema } from "./util.ts";
import { z } from "zod/v4";
import { eq } from "drizzle-orm";

export const editExpenseEndpoint = defineEndpoint({
  inputSchema: passkeySchema.extend({
    id: z.number().int().positive(),
    note: z.string().optional(),
    amount: z.number().positive(),
    group: z.string().min(3),
    created_by: z.string().min(3),
    month: z.string().regex(/^\d{4}-\d{2}$/, { 
      message: "Month must be in format YYYY-MM" 
    }),
  }),
  handler: async (body) => {
    await ensurePasskey(body);
    
    const { id, ...updateData } = body;
    
    const updatedExpense = await db
      .update(expenses)
      .set(updateData)
      .where(eq(expenses.id, id))
      .returning();
    
    if (updatedExpense.length === 0) {
      throw new Response("Expense not found", { status: 404, headers: { "content-type": "text/plain" } });
    }
    
    return updatedExpense[0];
  },
});