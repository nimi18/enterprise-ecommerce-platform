import express from 'express';
import {
  getMyOrdersController,
  getOrderByIdController,
} from '../controllers/order.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order APIs
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get my orders
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Orders fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 69e011ac477b65f0b8785732
 *                       orderNumber:
 *                         type: string
 *                         example: ORD-1776292268319-812
 *                       user:
 *                         type: string
 *                         example: 69e0019230a0c9cdca3dce71
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             product:
 *                               type: string
 *                               example: 69e0029130a0c9cdca3dce73
 *                             titleSnapshot:
 *                               type: string
 *                               example: iPhone 15
 *                             skuSnapshot:
 *                               type: string
 *                               example: IPHONE15-001
 *                             imageSnapshot:
 *                               type: string
 *                               example: https://example.com/iphone.jpg
 *                             quantity:
 *                               type: number
 *                               example: 2
 *                             unitPrice:
 *                               type: number
 *                               example: 50000
 *                             lineTotal:
 *                               type: number
 *                               example: 100000
 *                       addressSnapshot:
 *                         type: object
 *                         properties:
 *                           fullName:
 *                             type: string
 *                             example: Nimita
 *                           phone:
 *                             type: string
 *                             example: "9999999999"
 *                           addressLine1:
 *                             type: string
 *                             example: 123 Street
 *                           addressLine2:
 *                             type: string
 *                             example: ""
 *                           city:
 *                             type: string
 *                             example: Delhi
 *                           state:
 *                             type: string
 *                             example: Delhi
 *                           postalCode:
 *                             type: string
 *                             example: "110001"
 *                           country:
 *                             type: string
 *                             example: India
 *                           landmark:
 *                             type: string
 *                             example: ""
 *                           addressType:
 *                             type: string
 *                             example: home
 *                       couponSnapshot:
 *                         nullable: true
 *                         type: object
 *                       subtotal:
 *                         type: number
 *                         example: 100000
 *                       discount:
 *                         type: number
 *                         example: 0
 *                       shippingCharge:
 *                         type: number
 *                         example: 50
 *                       total:
 *                         type: number
 *                         example: 100050
 *                       paymentProvider:
 *                         type: string
 *                         example: stripe
 *                       paymentReference:
 *                         nullable: true
 *                         type: string
 *                         example: cs_test_a1pAvE7D5yLxgqzL...
 *                       paymentStatus:
 *                         type: string
 *                         example: paid
 *                       orderStatus:
 *                         type: string
 *                         example: confirmed
 *                       shippingMethod:
 *                         type: string
 *                         example: standard
 *                       shippingRecord:
 *                         nullable: true
 *                         type: string
 *                       paidAt:
 *                         nullable: true
 *                         type: string
 *                         example: 2026-04-15T22:34:57.694Z
 *                       placedAt:
 *                         type: string
 *                         example: 2026-04-15T22:31:08.326Z
 *                       createdAt:
 *                         type: string
 *                         example: 2026-04-15T22:31:08.331Z
 *                       updatedAt:
 *                         type: string
 *                         example: 2026-04-15T22:34:57.694Z
 */
router.get('/', authMiddleware, getMyOrdersController);

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     summary: Get order by id
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         example: 69e011ac477b65f0b8785732
 *     responses:
 *       200:
 *         description: Order fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Order fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 69e011ac477b65f0b8785732
 *                     orderNumber:
 *                       type: string
 *                       example: ORD-1776292268319-812
 *                     user:
 *                       type: string
 *                       example: 69e0019230a0c9cdca3dce71
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product:
 *                             type: string
 *                             example: 69e0029130a0c9cdca3dce73
 *                           titleSnapshot:
 *                             type: string
 *                             example: iPhone 15
 *                           skuSnapshot:
 *                             type: string
 *                             example: IPHONE15-001
 *                           imageSnapshot:
 *                             type: string
 *                             example: https://example.com/iphone.jpg
 *                           quantity:
 *                             type: number
 *                             example: 4
 *                           unitPrice:
 *                             type: number
 *                             example: 50000
 *                           lineTotal:
 *                             type: number
 *                             example: 200000
 *                     addressSnapshot:
 *                       type: object
 *                       properties:
 *                         fullName:
 *                           type: string
 *                           example: Nimita
 *                         phone:
 *                           type: string
 *                           example: "9999999999"
 *                         addressLine1:
 *                           type: string
 *                           example: 123 Street
 *                         city:
 *                           type: string
 *                           example: Delhi
 *                         state:
 *                           type: string
 *                           example: Delhi
 *                         postalCode:
 *                           type: string
 *                           example: "110001"
 *                         country:
 *                           type: string
 *                           example: India
 *                     couponSnapshot:
 *                       nullable: true
 *                       type: object
 *                     subtotal:
 *                       type: number
 *                       example: 200000
 *                     discount:
 *                       type: number
 *                       example: 0
 *                     shippingCharge:
 *                       type: number
 *                       example: 50
 *                     total:
 *                       type: number
 *                       example: 200050
 *                     paymentProvider:
 *                       type: string
 *                       example: stripe
 *                     paymentReference:
 *                       nullable: true
 *                       type: string
 *                       example: cs_test_a1pAvE7D5yLxgqzL...
 *                     paymentStatus:
 *                       type: string
 *                       example: paid
 *                     orderStatus:
 *                       type: string
 *                       example: confirmed
 *                     shippingMethod:
 *                       type: string
 *                       example: standard
 *                     shippingRecord:
 *                       nullable: true
 *                       type: string
 *                     paidAt:
 *                       nullable: true
 *                       type: string
 *                       example: 2026-04-15T22:34:57.694Z
 *                     placedAt:
 *                       type: string
 *                       example: 2026-04-15T22:31:08.326Z
 *                     createdAt:
 *                       type: string
 *                       example: 2026-04-15T22:31:08.331Z
 *                     updatedAt:
 *                       type: string
 *                       example: 2026-04-15T22:34:57.694Z
 */
router.get('/:orderId', authMiddleware, getOrderByIdController);

export default router;