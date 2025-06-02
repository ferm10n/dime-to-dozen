/// <reference lib="deno.ns" />
import "@std/dotenv/load";
import { serveDir } from "@std/http/file-server";
import { db } from "./db/index.ts";
import { expenses } from "./db/schema.ts";

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

Deno.serve({
  port: parseInt(Deno.env.get("PORT") || "8000", 10),
}, async (req) => {
  const pathname = new URL(req.url).pathname;
  if (pathname.startsWith("/api/hello")) {
    return new Response("Hello, World!", {
      headers: { "Content-Type": "text/plain" },
    });
  } else if (pathname.startsWith("/api/expenses")) {
    if (req.method === "GET") {
      return jsonResponse(await db.select().from(expenses));
    } else if (req.method === "POST") {
      const body = await req.json();
      const { name, amount, group, created_by } = body;
      if (!name || !amount || !group || !created_by) {
        return new Response("Invalid input", { status: 400 });
      }
      const createdExpense = await db.insert(expenses).values({
        name,
        amount,
        group,
        created_by,
      }).returning();
      return jsonResponse(createdExpense);
    }
  }

  return serveDir(req, {
    fsRoot: "dist",
  });
});
