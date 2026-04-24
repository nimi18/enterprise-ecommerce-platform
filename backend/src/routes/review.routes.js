import express from 'express';
import {
  createReviewController,
  deleteReviewController,
  listProductReviewsController,
  updateReviewController,
} from '../controllers/review.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createReviewSchema,
  updateReviewSchema,
} from '../validators/review.validator.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Product review APIs
 */

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create product review
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - rating
 *               - comment
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 680f3a6f0c1234567890abcd
 *               rating:
 *                 type: number
 *                 example: 5
 *               title:
 *                 type: string
 *                 example: Excellent product
 *               comment:
 *                 type: string
 *                 example: Great quality and very smooth experience.
 *     responses:
 *       201:
 *         description: Review created successfully
 */
router.post('/', authMiddleware, validate(createReviewSchema), createReviewController);

/**
 * @swagger
 * /reviews/product/{productId}:
 *   get:
 *     summary: Get product reviews
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reviews fetched successfully
 */
router.get('/product/:productId', listProductReviewsController);

/**
 * @swagger
 * /reviews/{reviewId}:
 *   patch:
 *     summary: Update own review
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 example: 4
 *               title:
 *                 type: string
 *                 example: Very good
 *               comment:
 *                 type: string
 *                 example: Good product overall.
 *     responses:
 *       200:
 *         description: Review updated successfully
 */
router.patch('/:reviewId', authMiddleware, validate(updateReviewSchema), updateReviewController);

/**
 * @swagger
 * /reviews/{reviewId}:
 *   delete:
 *     summary: Delete own review
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted successfully
 */
router.delete('/:reviewId', authMiddleware, deleteReviewController);

export default router;