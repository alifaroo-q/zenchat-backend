import { z } from 'zod';

/**
 * @description This is the schema for the .env file.
 * And this will check if the .env file has the correct keys and values.
 *
 * Comment out those lines if you don't want to use the .env file.
 * For example: Initially, you don't have the AWS keys, so you can comment out the AWS keys.
 */
export const validationSchema = z.object({
  // APP

  TZ: z.string().default('UTC'),
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(3000),
  SALT_LENGHT: z.coerce.number().default(10),

  // DATABASE
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_USER: z.string().default('postgres'),
  POSTGRES_PASSWORD: z.string().default('postgres'),
  POSTGRES_DATABASE: z.string().default('postgres'),
  POSTGRES_SSL: z.string().default('false'),

  // JWT
  USER_SECRET_KEY: z.string().default('user_secret'),
  USER_EXPIRES_IN: z.string().default('1d'),
});

export type Config = z.infer<typeof validationSchema>;
