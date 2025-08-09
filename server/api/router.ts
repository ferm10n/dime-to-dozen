import { z } from "zod/v4";
import { getBudgetEndpoint } from "./get-budget.ts";
import { getExpensesEndpoint } from "./get-expenses.ts";
import { getGroupsEndpoint } from "./get-groups.ts";
import { getMonthGroupsEndpoint } from "./get-month-groups.ts";
import { postExpenseEndpoint } from "./post-expense.ts";
import { copyMonthBudgetEndpoint } from "./copy-month-budget.ts";
import { editBudgetGroupEndpoint } from "./edit-budget-group.ts";
import { editExpenseEndpoint } from "./edit-expense.ts";
import { deleteExpenseEndpoint } from "./delete-expense.ts";
import { ApiEndpointDef } from "./util.ts";

export const router = {
  "/api/get-expenses": getExpensesEndpoint,
  "/api/post-expense": postExpenseEndpoint,
  "/api/edit-expense": editExpenseEndpoint,
  "/api/delete-expense": deleteExpenseEndpoint,
  "/api/get-groups": getGroupsEndpoint,
  "/api/get-budget": getBudgetEndpoint, // not used?
  "/api/get-month-groups": getMonthGroupsEndpoint,
  "/api/copy-month-budget": copyMonthBudgetEndpoint,
  "/api/edit-budget-group": editBudgetGroupEndpoint,
} satisfies {
  [path: string]: ApiEndpointDef<any, any>;
};

export type ApiRouter = {
  [endpoint in keyof typeof router]: typeof router[endpoint] extends
    ApiEndpointDef<infer I, infer O> ? {
      input: z.infer<I>;
      output: O;
    }
    : never;
};
