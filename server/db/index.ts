import { drizzle } from 'drizzle-orm/node-postgres';
const databaseUrl = Deno.env.get('DATABASE_URL');
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}
export const db = drizzle(databaseUrl);
