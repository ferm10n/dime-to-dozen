import { desc } from "drizzle-orm";
import { db } from "../db/index.ts";
import { expenses } from "../db/schema.ts";
import { defineEndpoint, ensurePasskey, passkeySchema } from "./util.ts";

export const getExpensesEndpoint = defineEndpoint({
  inputSchema: passkeySchema,
  handler: async (body) => {
    await ensurePasskey(body);
    return await db
      .select()
      .from(expenses)
      .orderBy(desc(expenses.created_at));
  },
})