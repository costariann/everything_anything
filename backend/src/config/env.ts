import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment-specific file if present, searching both cwd and parent dirs
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
dotenv.config({ path: path.resolve(process.cwd(), '..', envFile) });
dotenv.config({ path: path.resolve(__dirname, '../../..', envFile) });
dotenv.config(); // fallback to .env if present

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/everythinganything_dev'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment configuration:');
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;

