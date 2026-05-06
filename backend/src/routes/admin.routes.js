import express from 'express';
import {
  adminCancelOrderController,
  getAllOrdersController,
  getAnyOrderByIdController,
  updateOrderStatusController,
} from '../controllers/admin.controller.js';
import ROLES from '../constants/roles.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  adminCancelOrderSchema,
  adminOrderListQuerySchema,
  updateOrderStatusSchema,
} from '../validators/admin.validator.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin order management APIs
 */

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Get all orders
 *     description: Fetch all orders with optional filters, pagination, and sorting.
 *     tags: [Admin]
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
 *           example: 20
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
 *         name: userId
 *         schema:
 *           type: string
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
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum:
 *             - createdAt
 *             - total
 *             - orderStatus
 *             - paymentStatus
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum:
 *             - asc
 *             - desc
 *     responses:
 *       200:
 *         description: All orders fetched successfully
 */
router.get(
  '/orders',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(adminOrderListQuerySchema, 'query'),
  getAllOrdersController
);

/**
 * @swagger
 * /admin/orders/{orderId}:
 *   get:
 *     summary: Get any order by id
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order fetched successfully
 */
router.get(
  '/orders/:orderId',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  getAnyOrderByIdController
);

/**
 * @swagger
 * /admin/orders/{orderId}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderStatus
 *             properties:
 *               orderStatus:
 *                 type: string
 *                 enum:
 *                   - pending
 *                   - confirmed
 *                   - processing
 *                   - packed
 *                   - shipped
 *                   - out_for_delivery
 *                   - delivered
 *                   - cancelled
 *                   - failed
 *                   - returned
 *                 example: shipped
 *               courierName:
 *                 type: string
 *                 example: Blue Dart
 *               trackingNumber:
 *                 type: string
 *                 example: BD123456789IN
 *               trackingUrl:
 *                 type: string
 *                 example: https://tracking.example.com/BD123456789IN
 *     responses:
 *       200:
 *         description: Order status updated successfully
 */
router.patch(
  '/orders/:orderId/status',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(updateOrderStatusSchema),
  updateOrderStatusController
);

/**
 * @swagger
 * /admin/orders/{orderId}/cancel:
 *   patch:
 *     summary: Cancel any order
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Fraud check failed
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 */
router.patch(
  '/orders/:orderId/cancel',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(adminCancelOrderSchema),
  adminCancelOrderController
);

export default router;