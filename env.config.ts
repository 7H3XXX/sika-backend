import { z } from 'zod/v4';
import { config } from 'dotenv';

config({ path: '.env' });

const NodeEnv = z
  .enum(['development', 'production', 'test'])
  .default('development');

export const envSchema = z.object({
  // App Setup and Configurations
  NODE_ENV: NodeEnv,
  PORT: z.coerce.number().default(5000),

  DEV_TEAM_EMAILS: z.string().transform((val) => val.split(',')),

  LOGGER_COLORS: z.stringbool().default(true),
  LOGGER_JSON: z.stringbool().default(false),

  API_DOCS_PATH: z.string().default('v1/docs'),

  // Project Details
  PROJECT_TITLE: z.string().default('Nest App'),
  PROJECT_DESCRIPTION: z.string().default(''),
  PROJECT_VERSION: z.string().default('1.0.0'),

  // SMTP Configs
  SMTP_SERVER: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USERNAME: z.string(),
  SMTP_PASSWORD: z.string(),
  SMTP_SSL: z.stringbool(),

  // DATABASE Configs
  DATABASE_NAME: z.string(),
  DATABASE_USER: z.string(),
  DATABASE_PWD: z.string(),
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.coerce.number().default(5432),
  DATABASE_SSL: z.stringbool().default(false),
  DEFAULT_PAGE_SIZE: z.coerce.number().default(25),

  DATABASE_SEEDING: z.stringbool().default(false),

  // MinIO Configs
  MINIO_HOST: z.string(),
  MINIO_PORT: z.coerce.number(),
  MINIO_SSL: z.stringbool().default(true),
  MINIO_ACCESS_KEY: z.string(),
  MINIO_SECRET_KEY: z.string(),
  MINIO_DEFAULT_BUCKET: z.string(),
  MINIO_DEFAULT_REGION: z.string().default('us-east-1'),

  // JWT Configs
  JWT_SECRET: z.string().default('3a0ef9ac-93ed-4f5e-a4df-838b602a19cf'),
  JWT_EXPIRY: z.string().default('3d'),
});

export type Env = z.infer<typeof envSchema>;
export type NodeEnv = z.infer<typeof NodeEnv>;
export const env = envSchema.parse(process.env);
