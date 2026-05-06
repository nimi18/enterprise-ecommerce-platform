import express from 'express';
import {
  changeMyPasswordController,
  deleteMyAvatarController,
  getMyProfileController,
  updateMyAvatarController,
  updateMyProfileController,
} from '../controllers/user.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { uploadAvatar } from '../middlewares/upload.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  changePasswordSchema,
  updateProfileSchema,
} from '../validators/user.validator.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User Profile
 *   description: Customer profile APIs
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get my profile
 *     tags: [User Profile]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 */
router.get('/me', authMiddleware, getMyProfileController);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update my profile
 *     tags: [User Profile]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nimita Malhotra
 *               phone:
 *                 type: string
 *                 example: "9999999999"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.patch(
  '/me',
  authMiddleware,
  validate(updateProfileSchema),
  updateMyProfileController
);

/**
 * @swagger
 * /users/me/password:
 *   patch:
 *     summary: Change my password
 *     tags: [User Profile]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: password123
 *               newPassword:
 *                 type: string
 *                 example: newPassword123
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.patch(
  '/me/password',
  authMiddleware,
  validate(changePasswordSchema),
  changeMyPasswordController
);

/**
 * @swagger
 * /users/me/avatar:
 *   patch:
 *     summary: Upload or replace my avatar
 *     tags: [User Profile]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 */
router.patch(
  '/me/avatar',
  authMiddleware,
  uploadAvatar.single('avatar'),
  updateMyAvatarController
);

/**
 * @swagger
 * /users/me/avatar:
 *   delete:
 *     summary: Remove my avatar
 *     tags: [User Profile]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar removed successfully
 */
router.delete('/me/avatar', authMiddleware, deleteMyAvatarController);

export default router;