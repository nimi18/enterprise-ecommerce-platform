import express from 'express';
import { checkoutController } from '../controllers/checkout.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { checkoutSchema } from '../validators/checkout.validator.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Checkout
 *   description: Checkout APIs
 */

/**
 * @swagger
 * /checkout:
 *   post:
 *     summary: Checkout and create order
 *     tags: [Checkout]
 *     security:
 *       - BearerAuth: []
 */
router.post('/', authMiddleware, validate(checkoutSchema), checkoutController);

export default router;