import express from 'express';
import {
  getAllOrdersController,
  getAnyOrderByIdController,
  updateOrderStatusController,
} from '../controllers/admin.controller.js';
import ROLES from '../constants/roles.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { updateOrderStatusSchema } from '../validators/admin.validator.js';

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
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All orders fetched successfully
 */
router.get(
  '/orders',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
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

export default router;