import { z } from "zod/v4";
import { getBudgetEndpoint } from "./get-budget.ts";
import { getExpensesEndpoint } from "./get-expenses.ts";
import { getGroupsEndpoint } from "./get-groups.ts";
import { getMonthGroupsEndpoint } from "./get-month-groups.ts";
import { postExpenseEndpoint } from "./post-expense.ts";
import { copyMonthBudgetEndpoint } from "./copy-month-budget.ts";
import { ApiEndpointDef } from "./util.ts";

export const router = {
  '/api/get-expenses': getExpensesEndpoint,
  '/api/post-expense': postExpenseEndpoint,
  '/api/get-groups': getGroupsEndpoint,
  '/api/get-budget': getBudgetEndpoint, // not used?
  '/api/get-month-groups': getMonthGroupsEndpoint,
  '/api/copy-month-budget': copyMonthBudgetEndpoint,
} satisfies {
    [path: string]: ApiEndpointDef<any, any>;
}

export type ApiRouter = {
[endpoint in keyof typeof router]: typeof router[endpoint] extends ApiEndpointDef<infer I, infer O>
  ? {
    input: z.infer<I>;
    output: O;
  }
  : never;
}