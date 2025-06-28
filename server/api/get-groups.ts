import { db } from "../db/index.ts";
import { groups } from "../db/schema.ts";
import { defineEndpoint, ensurePasskey, passkeySchema } from "./util.ts";

export const getGroupsEndpoint = defineEndpoint({
  inputSchema: passkeySchema,
  handler: async (body) => {
    await ensurePasskey(body);
    
    const groupsResult = await db
      .select({ group: groups.group })
      .from(groups)
      .orderBy(groups.group);
    
    return groupsResult.map(g => g.group);
  },
});
