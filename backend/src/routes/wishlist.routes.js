import express from 'express';
import {
  addToWishlistController,
  getWishlistController,
  removeFromWishlistController,
} from '../controllers/wishlist.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: Wishlist management APIs
 */

/**
 * @swagger
 * /wishlist:
 *   get:
 *     summary: Get wishlist
 *     tags: [Wishlist]
 *     security:
 *       - BearerAuth: []
 */
router.get('/', authMiddleware, getWishlistController);

/**
 * @swagger
 * /wishlist/{productId}:
 *   post:
 *     summary: Add product to wishlist
 *     tags: [Wishlist]
 *     security:
 *       - BearerAuth: []
 */
router.post('/:productId', authMiddleware, addToWishlistController);

/**
 * @swagger
 * /wishlist/{productId}:
 *   delete:
 *     summary: Remove product from wishlist
 *     tags: [Wishlist]
 *     security:
 *       - BearerAuth: []
 */
router.delete('/:productId', authMiddleware, removeFromWishlistController);

export default router;