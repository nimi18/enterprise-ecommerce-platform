import express from 'express';
import {
  cancelMyOrderController,
  getMyOrdersController,
  getOrderByIdController,
} from '../controllers/order.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  cancelOrderSchema,
  customerOrderListQuerySchema,
} from '../validators/order.validator.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Customer order APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         product:
 *           type: string
 *           example: 69e0029130a0c9cdca3dce73
 *         titleSnapshot:
 *           type: string
 *           example: iPhone 15
 *         skuSnapshot:
 *           type: string
 *           example: IPHONE15-001
 *         imageSnapshot:
 *           type: string
 *           example: https://example.com/iphone.jpg
 *         quantity:
 *           type: number
 *           example: 2
 *         unitPrice:
 *           type: number
 *           example: 50000
 *         lineTotal:
 *           type: number
 *           example: 100000
 *
 *     OrderAddressSnapshot:
 *       type: object
 *       properties:
 *         fullName:
 *           type: string
 *           example: Nimita Malhotra
 *         phone:
 *           type: string
 *           example: "9999999999"
 *         addressLine1:
 *           type: string
 *           example: 123 Street
 *         addressLine2:
 *           type: string
 *           example: Near Metro
 *         city:
 *           type: string
 *           example: Delhi
 *         state:
 *           type: string
 *           example: Delhi
 *         postalCode:
 *           type: string
 *           example: "110001"
 *         country:
 *           type: string
 *           example: India
 *         landmark:
 *           type: string
 *           example: City Mall
 *         addressType:
 *           type: string
 *           example: home
 *
 *     OrderPagination:
 *       type: object
 *       properties:
 *         page:
 *           type: number
 *           example: 1
 *         limit:
 *           type: number
 *           example: 10
 *         total:
 *           type: number
 *           example: 25
 *         totalPages:
 *           type: number
 *           example: 3
 *
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 69e011ac477b65f0b8785732
 *         orderNumber:
 *           type: string
 *           example: ORD-1776292268319-812
 *         user:
 *           type: string
 *           example: 69e0019230a0c9cdca3dce71
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         addressSnapshot:
 *           $ref: '#/components/schemas/OrderAddressSnapshot'
 *         couponSnapshot:
 *           nullable: true
 *           type: object
 *         subtotal:
 *           type: number
 *           example: 100000
 *         discount:
 *           type: number
 *           example: 0
 *         shippingCharge:
 *           type: number
 *           example: 50
 *         total:
 *           type: number
 *           example: 100050
 *         paymentProvider:
 *           type: string
 *           example: stripe
 *         paymentReference:
 *           nullable: true
 *           type: string
 *           example: cs_test_a1pAvE7D5yLxgqzL
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *           example: paid
 *         orderStatus:
 *           type: string
 *           enum:
 *             - pending
 *             - confirmed
 *             - processing
 *             - packed
 *             - shipped
 *             - out_for_delivery
 *             - delivered
 *             - cancelled
 *             - failed
 *             - returned
 *           example: confirmed
 *         shippingMethod:
 *           type: string
 *           example: standard
 *         shippingRecord:
 *           nullable: true
 *           type: string
 *           example: null
 *         courierName:
 *           nullable: true
 *           type: string
 *           example: Blue Dart
 *         trackingNumber:
 *           nullable: true
 *           type: string
 *           example: BD123456789IN
 *         trackingUrl:
 *           nullable: true
 *           type: string
 *           example: https://tracking.example.com/BD123456789IN
 *         shippedAt:
 *           nullable: true
 *           type: string
 *           example: 2026-04-15T22:34:57.694Z
 *         deliveredAt:
 *           nullable: true
 *           type: string
 *           example: 2026-04-16T22:34:57.694Z
 *         cancelledAt:
 *           nullable: true
 *           type: string
 *           example: null
 *         cancelledBy:
 *           nullable: true
 *           type: string
 *           example: customer
 *         cancellationReason:
 *           nullable: true
 *           type: string
 *           example: Changed my mind
 *         paidAt:
 *           nullable: true
 *           type: string
 *           example: 2026-04-15T22:34:57.694Z
 *         placedAt:
 *           type: string
 *           example: 2026-04-15T22:31:08.326Z
 *         createdAt:
 *           type: string
 *           example: 2026-04-15T22:31:08.331Z
 *         updatedAt:
 *           type: string
 *           example: 2026-04-15T22:34:57.694Z
 *
 *     OrderListData:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Order'
 *         pagination:
 *           $ref: '#/components/schemas/OrderPagination'
 *
 *     OrderListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Orders fetched successfully
 *         data:
 *           $ref: '#/components/schemas/OrderListData'
 *
 *     OrderResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Order fetched successfully
 *         data:
 *           $ref: '#/components/schemas/Order'
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get my orders
 *     description: Fetch logged-in customer's orders with filters, search, sorting, and pagination.
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           example: 10
 *       - in: query
 *         name: orderStatus
 *         schema:
 *           type: string
 *           enum:
 *             - pending
 *             - confirmed
 *             - processing
 *             - packed
 *             - shipped
 *             - out_for_delivery
 *             - delivered
 *             - cancelled
 *             - failed
 *             - returned
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum:
 *             - pending
 *             - paid
 *             - failed
 *             - refunded
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: ORD-
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *           example: 2026-01-01T00:00:00.000Z
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *           example: 2026-12-31T23:59:59.999Z
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum:
 *             - createdAt
 *             - total
 *             - orderStatus
 *             - paymentStatus
 *           example: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum:
 *             - asc
 *             - desc
 *           example: desc
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderListResponse'
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authMiddleware,
  validate(customerOrderListQuerySchema, 'query'),
  getMyOrdersController
);

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     summary: Get order by id
 *     description: Fetch a single order belonging to the logged-in customer.
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
 *               $ref: '#/components/schemas/OrderResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.get('/:orderId', authMiddleware, getOrderByIdController);

/**
 * @swagger
 * /orders/{orderId}/cancel:
 *   patch:
 *     summary: Cancel own order
 *     description: Cancel a customer order if it is still in a cancellable state.
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
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Changed my mind
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/OrderResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Order cancelled successfully
 *       400:
 *         description: Order cannot be cancelled at this stage
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.patch(
  '/:orderId/cancel',
  authMiddleware,
  validate(cancelOrderSchema),
  cancelMyOrderController
);

export default router;