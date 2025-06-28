import { eq, sql, sum } from "drizzle-orm";
import { db } from "../db/index.ts";
import { budgetInsertSchema, budgets, expenses, groups } from "../db/schema.ts";
import { defineEndpoint, ensurePasskey, passkeySchema } from "./util.ts";

export const getMonthGroupsEndpoint = defineEndpoint({
  inputSchema: passkeySchema.extend({
    month: budgetInsertSchema.shape.month,
    group: budgetInsertSchema.shape.group.optional(),
  }),
  handler: async (body) => {
    await ensurePasskey(body);
    
    const { month, group } = body;

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
        spent: sql<number>`COALESCE(${expensesSubquery.totalSpent}, 0) as "spent"`,
        budgeted: sql<number>`COALESCE(${budgetsSubquery.totalBudgeted}, 0) as "budgeted"`,
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

    return results;
  },
});
