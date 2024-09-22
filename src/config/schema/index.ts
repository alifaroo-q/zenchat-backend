import * as Joi from 'joi';

/**
 * @description This is the schema for the .env file.
 * And this will check if the .env file has the correct keys and values.
 *
 * Comment out those lines if you don't want to use the .env file.
 * For example: Initially, you don't have the AWS keys, so you can comment out the AWS keys.
 */

export const validationSchema = Joi.object({
  // APP
  TZ: Joi.string().default('UTC'),
  NODE_ENV: Joi.string().default('development'),
  PORT: Joi.number().port().default(3000),
  SALT_LENGHT: Joi.number().default(10),

  // DATABASE
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().port().default(5432).required(),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DATABASE: Joi.string().required(),
  POSTGRES_SSL: Joi.string().default('false').required(),

  // JWT
  JWT_SECRET_KEY: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
});
