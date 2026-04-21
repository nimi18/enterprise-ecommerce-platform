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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - addressId
 *               - shippingMethod
 *             properties:
 *               addressId:
 *                 type: string
 *                 example: 680f3a6f0c1234567890abcd
 *               shippingMethod:
 *                 type: string
 *                 enum: [standard, express]
 *                 example: standard
 *     responses:
 *       201:
 *         description: Order created successfully
 */
router.post('/', authMiddleware, validate(checkoutSchema), checkoutController);

export default router;