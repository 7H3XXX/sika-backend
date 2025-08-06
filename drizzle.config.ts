import { defineConfig } from 'drizzle-kit';
import { env } from 'env.config';

export default defineConfig({
  schema: './src/**/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  casing: 'snake_case',
  dbCredentials: {
    host: env.DATABASE_HOST,
    user: env.DATABASE_USER,
    database: env.DATABASE_NAME,
    password: env.DATABASE_PWD,
    port: env.DATABASE_PORT,
    ssl: env.DATABASE_SSL,
  },
});
