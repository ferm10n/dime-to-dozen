/// <reference lib="deno.ns" />
import "@std/dotenv/load";
import { serveDir } from "@std/http/file-server";
import { db } from "./db/index.ts";
import { expenseInsertSchema, expenses } from "./db/schema.ts";
import { z } from "zod/v4";

// const secret = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, "0")).join("");
// console.log("Generated secret:", secret);

function jsonResponse (payload: unknown) {
  return new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  });
}

const passkeySchema = z.object({
  passkey: z.string(),
});

const correctPasskey = Deno.env.get("APP_PASSKEY");
if (!correctPasskey) {
  throw new Error("APP_PASSKEY environment variable is not set");
}

function parseOrDie <T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error("Validation error:", result.error);
    throw new Response("Invalid input", { status: 400, headers: { "content-type": "text/plain" } });
  }
  return result.data;
}

function ensurePasskey (body: unknown) {
  const { passkey } = parseOrDie(passkeySchema, body);
  if (passkey !== correctPasskey) {
    throw new Response("Invalid passkey", { status: 403, headers: { "content-type": "text/plain" } });
  }
}

Deno.serve({
  port: parseInt(Deno.env.get("PORT") || "8000", 10),
}, async (req) => {
  try {
    const pathname = new URL(req.url).pathname;
    if (pathname.startsWith("/api/hello")) {
      return new Response("Hello, World!", {
        headers: { "Content-Type": "text/plain" },
      });
    }
    
    if (pathname === "/api/get-expenses" && req.method === "POST") {
      const body = await req.json();
      await ensurePasskey(body);
      return jsonResponse(await db.select().from(expenses));
    }
    
    if (pathname === "/api/post-expense" && req.method === "POST") {
      const body = await req.json();
      await ensurePasskey(body);
      const expenseInsert = parseOrDie(expenseInsertSchema, body);
      const createdExpense = await db.insert(expenses).values(expenseInsert).returning();
      return jsonResponse(createdExpense);
    }
    
    if (pathname === "/api/get-groups" && req.method === "POST") {
      const body = await req.json();
      await ensurePasskey(body);
      
      // Query to get distinct groups
      const groups = await db
        .select({ group: expenses.group })
        .from(expenses)
        .groupBy(expenses.group)
        .orderBy(expenses.group);
      
      // Extract just the group names for a cleaner response
      return jsonResponse(groups.map(g => g.group));
    }

    return serveDir(req, {
      fsRoot: "dist",
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error("Error handling request:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});
