import { z } from 'zod';

export const EnvSchema = z.object({
  HOST: z.string(),
  NODE_ENV: z
    .enum(['development', 'production', 'test', 'provision'])
    .default('development'),
  PORT: z
    .string()
    .default('8000')
    .transform((data) => +data),
  ALLOW_CORS_URL: z.string().url(),
  ACCESS_TOKEN_SECRET: z.string().min(10).max(128),
  ACCESS_TOKEN_EXPIRATION: z.string().min(1).max(60),
  REFRESH_TOKEN_SECRET: z.string().min(10).max(128),
  REFRESH_TOKEN_EXPIRATION: z.string().min(1).max(365),
  DATABASE_URL: z.string(),
});

export type Env = z.infer<typeof EnvSchema>;

export const validateEnv = (config: Record<string, unknown>): Env => {
  const validate = EnvSchema.safeParse(config);
  if (!validate.success) {
    throw new Error(validate.error.message);
  }
  return validate.data;
};
