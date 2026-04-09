import express from 'express';
import {
  addToCartController,
  applyCouponController,
  clearCartController,
  getCartController,
  moveCartItemToWishlistController,
  removeCartItemController,
  removeCouponController,
  updateCartItemController,
} from '../controllers/cart.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { applyCouponSchema } from '../validators/coupon.validator.js';
import {
  addToCartSchema,
  updateCartItemSchema,
} from '../validators/cart.validator.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Cart management APIs
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get current user cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart fetched successfully
 */
router.get('/', authMiddleware, getCartController);

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add product to cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 680f3a6f0c1234567890abcd
 *               quantity:
 *                 type: number
 *                 example: 2
 *     responses:
 *       200:
 *         description: Product added to cart
 */
router.post('/', authMiddleware, validate(addToCartSchema), addToCartController);

/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: Clear cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 */
router.delete('/', authMiddleware, clearCartController);

/**
 * @swagger
 * /cart/apply-coupon:
 *   post:
 *     summary: Apply coupon to cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *                 example: SAVE10
 *     responses:
 *       200:
 *         description: Coupon applied successfully
 */
router.post(
  '/apply-coupon',
  authMiddleware,
  validate(applyCouponSchema),
  applyCouponController
);

/**
 * @swagger
 * /cart/remove-coupon:
 *   delete:
 *     summary: Remove coupon from cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Coupon removed successfully
 */
router.delete('/remove-coupon', authMiddleware, removeCouponController);

/**
 * @swagger
 * /cart/{productId}/move-to-wishlist:
 *   post:
 *     summary: Move cart item to wishlist
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cart item moved to wishlist successfully
 */
router.post(
  '/:productId/move-to-wishlist',
  authMiddleware,
  moveCartItemToWishlistController
);

/**
 * @swagger
 * /cart/{productId}:
 *   patch:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: number
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 */
router.patch(
  '/:productId',
  authMiddleware,
  validate(updateCartItemSchema),
  updateCartItemController
);

/**
 * @swagger
 * /cart/{productId}:
 *   delete:
 *     summary: Remove cart item
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cart item removed successfully
 */
router.delete('/:productId', authMiddleware, removeCartItemController);

export default router;