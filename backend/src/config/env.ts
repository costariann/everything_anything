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
  JWT_ACCESS_SECRET: z.string().default('everythinganything_access_jwt_secret_key_32_chars_long!'),
  JWT_REFRESH_SECRET: z.string().default('everythinganything_refresh_jwt_secret_key_32_chars_long!'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  FIREBASE_STORAGE_BUCKET: z.string().default('everythinganything-fc7ee.firebasestorage.app'),
  FIREBASE_SERVICE_ACCOUNT_PATH: z.string().default('serviceAccountKey.json'),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  CLOUDINARY_URL: z.string().optional().default(''),
  CURRENCY_CODE: z.string().default('GHS'),
  CURRENCY_SYMBOL: z.string().default('GH₵'),
  PAYSTACK_SECRET_KEY: z.string().optional().default(''),
  PAYSTACK_PUBLIC_KEY: z.string().optional().default(''),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment configuration:');
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;

