import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from 'env.config';
import { DBSchema } from '../schemas';

export const db = drizzle({
  connection: {
    host: env.DATABASE_HOST,
    user: env.DATABASE_USER,
    database: env.DATABASE_NAME,
    password: env.DATABASE_PWD,
    port: env.DATABASE_PORT,
    ssl: env.DATABASE_SSL,
    max: 1,
  },
  schema: DBSchema,
  casing: 'snake_case',
  logger: true,
});

export type db = typeof db;
export default db;
