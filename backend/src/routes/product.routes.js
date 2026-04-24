import express from 'express';
import {
  createProductController,
  deactivateProductController,
  getFeaturedProductsController,
  getProductByIdController,
  getRecommendedProductsController,
  listProductsController,
  updateProductController,
} from '../controllers/product.controller.js';
import ROLES from '../constants/roles.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createProductSchema,
  listProductsQuerySchema,
  updateProductSchema,
} from '../validators/product.validator.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management APIs
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, sku, price, category, stock]
 *             properties:
 *               title:
 *                 type: string
 *                 example: iPhone 15
 *               description:
 *                 type: string
 *                 example: Latest Apple smartphone
 *               shortDescription:
 *                 type: string
 *                 example: Premium smartphone
 *               sku:
 *                 type: string
 *                 example: IPHONE15-128-BLK
 *               price:
 *                 type: number
 *                 example: 79999
 *               compareAtPrice:
 *                 type: number
 *                 example: 84999
 *               currency:
 *                 type: string
 *                 example: INR
 *               category:
 *                 type: string
 *                 example: 680f3a6f0c1234567890abcd
 *               stock:
 *                 type: number
 *                 example: 20
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               isFeatured:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Product created successfully
 */
router.post(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(createProductSchema),
  createProductController
);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get products for PLP
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, price, title, averageRating]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Products fetched successfully
 */
router.get('/', validate(listProductsQuerySchema, 'query'), listProductsController);

/**
 * @swagger
 * /products/featured:
 *   get:
 *     summary: Get featured products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Featured products fetched successfully
 */
router.get('/featured', getFeaturedProductsController);

/**
 * @swagger
 * /products/{productId}/recommended:
 *   get:
 *     summary: Get recommended products
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recommended products fetched successfully
 */
router.get('/:productId/recommended', getRecommendedProductsController);

/**
 * @swagger
 * /products/{productId}:
 *   get:
 *     summary: Get product by id for PDP
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product fetched successfully
 */
router.get('/:productId', getProductByIdController);

/**
 * @swagger
 * /products/{productId}:
 *   patch:
 *     summary: Update product
 *     tags: [Products]
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
 *     responses:
 *       200:
 *         description: Product updated successfully
 */
router.patch(
  '/:productId',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(updateProductSchema),
  updateProductController
);

/**
 * @swagger
 * /products/{productId}:
 *   delete:
 *     summary: Deactivate product
 *     tags: [Products]
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
 *         description: Product deactivated successfully
 */
router.delete(
  '/:productId',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  deactivateProductController
);

export default router;