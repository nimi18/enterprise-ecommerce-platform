import express from 'express';
import { createCheckoutSessionController } from '../controllers/payment.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment APIs
 */

/**
 * @swagger
 * /payments/checkout/{orderId}:
 *   post:
 *     summary: Create Stripe checkout session
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         example: 680f3a6f0c1234567890abcd
 *     responses:
 *       200:
 *         description: Checkout session created successfully
 */
router.post(
  '/checkout/:orderId',
  authMiddleware,
  createCheckoutSessionController
);

export default router;