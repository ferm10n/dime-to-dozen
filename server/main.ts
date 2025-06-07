/// <reference lib="deno.ns" />
import "@std/dotenv/load";
import { serveDir } from "@std/http/file-server";
import { db } from "./db/index.ts";
import { expenseInsertSchema, expenses, budgets, budgetInsertSchema, groups } from "./db/schema.ts";
import { z } from "zod/v4";
import { and, eq, SQLWrapper, sql, sum, desc } from "drizzle-orm";

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

// Reuse the month schema from budgetInsertSchema
const budgetMonthSchema = z.object({
  passkey: z.string(),
  month: budgetInsertSchema.shape.month,
  group: budgetInsertSchema.shape.group.optional(),
});


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
      return jsonResponse(await db
        .select()
        .from(expenses)
        .orderBy(desc(expenses.created_at)
      ));
    }
    
    if (pathname === "/api/post-expense" && req.method === "POST") {
      const body = await req.json();
      await ensurePasskey(body);
      
      // Check if month is provided, or generate it from current date
      if (!body.month) {
        const now = new Date();
        // Format as YYYY-MM
        const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        body.month = month;
      }
      
      const expenseInsert = parseOrDie(expenseInsertSchema, body);

      // ensure the group exists before inserting the expense
      await db
        .insert(groups)
        .values({ group: expenseInsert.group })
        .onConflictDoNothing();

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

    // New endpoint to get budgets for a specific month
    if (pathname === "/api/get-budget" && req.method === "POST") {
      const body = await req.json();
      await ensurePasskey(body);
      
      // If a month is specified, filter by that month
      if ("month" in body) {
        const { month, group } = parseOrDie(budgetMonthSchema, body);

        const filters: SQLWrapper[] = [];
        filters.push(eq(budgets.month, month));
        if (group) {
          filters.push(eq(budgets.group, group));
        }

        const budgetsForMonth = await db
          .select()
          .from(budgets)
          .where(and(...filters))
          .orderBy(budgets.group);
          
        return jsonResponse(budgetsForMonth);
      }
      
      // If no month specified, return all budgets
      const allBudgets = await db
        .select()
        .from(budgets)
        .orderBy(budgets.month, budgets.group);
        
      return jsonResponse(allBudgets);
    }

    const monthGroupSchema = z.object({
      passkey: z.string(),
      month: budgetInsertSchema.shape.month,
      group: budgetInsertSchema.shape.group.optional(),
    });
    if (pathname === "/api/get-month-groups" && req.method === "POST") {
        const body = await req.json();
        await ensurePasskey(body);
        
        const { month, group } = parseOrDie(monthGroupSchema, body);

        // Compose filters for optional group
        const groupFilter = group ? eq(groups.group, group) : undefined;

        // Query all groups, left join with expenses and budgets for the given month
        
        // First, get a subquery for total expenses per group
        const expensesSubquery = db
          .select({
            group: expenses.group,
            totalSpent: sum(expenses.amount).as("total_spent")
          })
          .from(expenses)
          .where(eq(expenses.month, month))
          .groupBy(expenses.group)
          .as("expenses_totals");
          
        // Then a subquery for budgets per group
        const budgetsSubquery = db
          .select({
            group: budgets.group,
            totalBudgeted: sum(budgets.amount).as("total_budgeted")
          })
          .from(budgets)
          .where(eq(budgets.month, month))
          .groupBy(budgets.group)
          .as("budgets_totals");
        
        const results = await db
          .select({
            group: groups.group,
            spent: sql`COALESCE(${expensesSubquery.totalSpent}, 0) as "spent"`,
            budgeted: sql`COALESCE(${budgetsSubquery.totalBudgeted}, 0) as "budgeted"`,
          })
          .from(groups)
          .leftJoin(
            expensesSubquery,
            eq(groups.group, expensesSubquery.group)
          )
          .leftJoin(
            budgetsSubquery,
            eq(groups.group, budgetsSubquery.group)
          )
          .where(groupFilter)
          .orderBy(groups.group);

        return jsonResponse(results);
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
