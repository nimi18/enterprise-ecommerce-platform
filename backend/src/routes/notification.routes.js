import express from 'express';
import {
  getNotificationLogsByOrderController,
  listNotificationLogsController,
  resendNotificationController,
} from '../controllers/notification.controller.js';
import ROLES from '../constants/roles.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { listNotificationLogsQuerySchema } from '../validators/notification.validator.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Admin notification log and resend APIs
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: List notification logs
 *     tags: [Notifications]
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
 *         name: orderId
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [queued, sent, failed]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: channel
 *         schema:
 *           type: string
 *           enum: [email, system]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, status, type]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Notification logs fetched successfully
 */
router.get(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(listNotificationLogsQuerySchema, 'query'),
  listNotificationLogsController
);

/**
 * @swagger
 * /notifications/order/{orderId}:
 *   get:
 *     summary: Get notification logs by order
 *     tags: [Notifications]
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
 *         description: Order notification logs fetched successfully
 */
router.get(
  '/order/:orderId',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  getNotificationLogsByOrderController
);

/**
 * @swagger
 * /notifications/{notificationLogId}/resend:
 *   post:
 *     summary: Resend email notification
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationLogId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification queued successfully
 */
router.post(
  '/:notificationLogId/resend',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  resendNotificationController
);

export default router;