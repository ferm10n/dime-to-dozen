
import { db } from './index.ts';
import { groups, budgets, expenses } from './schema.ts';


function getMonthString(date: Date): string {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

const now = new Date();
const currMonth = getMonthString(now);
const prevDate = new Date(now);
prevDate.setMonth(now.getMonth() - 1);
const prevMonth = getMonthString(prevDate);
const nextDate = new Date(now);
nextDate.setMonth(now.getMonth() + 1);
const nextMonth = getMonthString(nextDate);

async function seed() {
	// Sample groups
	const groupNames = [
		'Groceries',
		'Utilities',
		'Dining Out',
		'Entertainment',
		'Travel',
		'Miscellaneous',
	];

	// Insert groups
	for (const group of groupNames) {
		await db.insert(groups).values({ group }).onConflictDoNothing();
	}

	// Sample months
	const months = [prevMonth, currMonth, nextMonth];

	// Sample users
	const users = ['alice', 'bob', 'carol'];

	// Insert budgets for each group and month
	for (const month of months) {
		for (const group of groupNames) {
			// Vary budget amounts for realism
			const amount = 100 + Math.floor(Math.random() * 400);
			await db.insert(budgets).values({ group, month, amount }).onConflictDoNothing();
		}
	}

	// Insert expenses for each group, month, and user
	let expenseId = 1;
	for (const month of months) {
		for (const group of groupNames) {
			for (const user of users) {
				// Each user makes 1-2 expenses per group per month
				const numExpenses = 1 + Math.floor(Math.random() * 2);
				for (let i = 0; i < numExpenses; i++) {
					const amount = 10 + Math.random() * 90;
					const note = `Sample expense ${expenseId} for ${group}`;
					await db.insert(expenses).values({
						note,
						amount: Math.round(amount * 100) / 100,
						group,
						created_by: user,
						month,
					});
					expenseId++;
				}
			}
		}
	}

	// Edge case: group with no budget for a month
	await db.insert(groups).values({ group: 'NoBudgetGroup' }).onConflictDoNothing();
	await db.insert(expenses).values({
		note: 'Expense in group with no budget',
		amount: 42.42,
		group: 'NoBudgetGroup',
		created_by: 'alice',
		month: currMonth,
	});

	// Edge case: group with budget but no expenses
	await db.insert(groups).values({ group: 'NoExpenseGroup' }).onConflictDoNothing();
	await db.insert(budgets).values({
		group: 'NoExpenseGroup',
		month: currMonth,
		amount: 123.45,
	}).onConflictDoNothing();

	// Edge case: group with budget and expenses in only one month
	await db.insert(groups).values({ group: 'OneMonthGroup' }).onConflictDoNothing();
	await db.insert(budgets).values({
		group: 'OneMonthGroup',
		month: prevMonth,
		amount: 200,
	}).onConflictDoNothing();
	await db.insert(expenses).values({
		note: 'Only expense in OneMonthGroup',
		amount: 50,
		group: 'OneMonthGroup',
		created_by: 'bob',
		month: prevMonth,
	});

	console.log('Sample data inserted.');
	Deno.exit(0);
}

if (import.meta.main) {
	seed().catch((err) => {
		console.error('Error inserting sample data:', err);
		Deno.exit(1);
	});
}
