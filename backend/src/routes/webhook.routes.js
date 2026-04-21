import express from 'express';
import { stripeWebhookController } from '../controllers/webhook.controller.js';

const router = express.Router();

router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhookController
);

export default router;