import { getBudgetEndpoint } from "./get-budget.ts";
import { getExpensesEndpoint } from "./get-expenses.ts";
import { getGroupsEndpoint } from "./get-groups.ts";
import { getMonthGroupsEndpoint } from "./get-month-groups.ts";
import { postExpenseEndpoint } from "./post-expense.ts";
import { ApiEndpointDef } from "./util.ts";

export const router = {
    '/api/get-expenses': getExpensesEndpoint,
    '/api/post-expense': postExpenseEndpoint,
    '/api/get-groups': getGroupsEndpoint,
    '/api/get-budget': getBudgetEndpoint, // not used?
    '/api/get-month-groups': getMonthGroupsEndpoint,
} satisfies {
    [path: string]: ApiEndpointDef<any, any>;
}
