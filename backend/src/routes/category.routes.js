import express from 'express';
import {
  createCategoryController,
  deactivateCategoryController,
  getCategoryByIdController,
  listCategoriesController,
  updateCategoryController,
} from '../controllers/category.controller.js';
import ROLES from '../constants/roles.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../validators/category.validator.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management APIs
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Electronics
 *               description:
 *                 type: string
 *                 example: Electronic devices and accessories
 *     responses:
 *       201:
 *         description: Category created successfully
 */
router.post(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(createCategorySchema),
  createCategoryController
);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get categories
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 */
router.get('/', listCategoriesController);

/**
 * @swagger
 * /categories/{categoryId}:
 *   get:
 *     summary: Get category by id
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category fetched successfully
 */
router.get('/:categoryId', getCategoryByIdController);

/**
 * @swagger
 * /categories/{categoryId}:
 *   patch:
 *     summary: Update category
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
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
 *               name:
 *                 type: string
 *                 example: Electronics
 *               description:
 *                 type: string
 *                 example: Updated category description
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Category updated successfully
 */
router.patch(
  '/:categoryId',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(updateCategorySchema),
  updateCategoryController
);

/**
 * @swagger
 * /categories/{categoryId}:
 *   delete:
 *     summary: Deactivate category
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deactivated successfully
 */
router.delete(
  '/:categoryId',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  deactivateCategoryController
);

export default router;