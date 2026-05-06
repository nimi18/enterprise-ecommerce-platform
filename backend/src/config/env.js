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

  AWS_REGION: Joi.string().allow('').optional(),
  AWS_ACCESS_KEY_ID: Joi.string().allow('').optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().allow('').optional(),
  AWS_S3_BUCKET: Joi.string().allow('').optional(),

  CLOUDINARY_CLOUD_NAME: Joi.string().when('NODE_ENV', {
    is: 'test',
    then: Joi.allow('').optional(),
    otherwise: Joi.required(),
  }),

  CLOUDINARY_API_KEY: Joi.string().when('NODE_ENV', {
    is: 'test',
    then: Joi.allow('').optional(),
    otherwise: Joi.required(),
  }),

  CLOUDINARY_API_SECRET: Joi.string().when('NODE_ENV', {
    is: 'test',
    then: Joi.allow('').optional(),
    otherwise: Joi.required(),
  }),
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

  awsRegion: value.AWS_REGION,
  awsAccessKeyId: value.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: value.AWS_SECRET_ACCESS_KEY,
  awsS3Bucket: value.AWS_S3_BUCKET,

  cloudinaryCloudName: value.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: value.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: value.CLOUDINARY_API_SECRET,
};

export default env;