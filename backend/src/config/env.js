import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),

  PORT: Joi.number().default(8000),

  MONGODB_URI: Joi.string().when('NODE_ENV', {
    is: 'test',
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),

  JWT_SECRET: Joi.string().required(),

  JWT_EXPIRES_IN: Joi.string().default('7d'),

  FRONTEND_URL: Joi.string().default('http://localhost:5173'),
  BACKEND_URL: Joi.string().default('http://127.0.0.1:8000'),

  STRIPE_SECRET_KEY: Joi.string().required(),
  STRIPE_WEBHOOK_SECRET: Joi.string().allow('').optional(),

  EMAIL_USER: Joi.string().allow('').optional(),
  EMAIL_PASS: Joi.string().allow('').optional(),
}).unknown();

const { error, value } = envSchema.validate(process.env, {
  abortEarly: false,
});

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

const env = {
  nodeEnv: value.NODE_ENV,
  port: value.PORT,
  mongoUri: value.MONGODB_URI,
  jwtSecret: value.JWT_SECRET,
  jwtExpiresIn: value.JWT_EXPIRES_IN,
  frontendUrl: value.FRONTEND_URL,
  backendUrl: value.BACKEND_URL,
  stripeSecretKey: value.STRIPE_SECRET_KEY,
  stripeWebhookSecret: value.STRIPE_WEBHOOK_SECRET,
  emailUser: value.EMAIL_USER,
  emailPass: value.EMAIL_PASS,
};

export default env;