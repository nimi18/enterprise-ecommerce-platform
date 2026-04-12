import express from 'express';
import {
  addAddressController,
  deleteAddressController,
  getAddressByIdController,
  getMyAddressesController,
  setDefaultAddressController,
  updateAddressController,
} from '../controllers/address.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createAddressSchema,
  updateAddressSchema,
} from '../validators/address.validator.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Addresses
 *   description: Address management APIs
 */

/**
 * @swagger
 * /addresses:
 *   post:
 *     summary: Add address
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 */
router.post('/', authMiddleware, validate(createAddressSchema), addAddressController);

/**
 * @swagger
 * /addresses:
 *   get:
 *     summary: Get my addresses
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 */
router.get('/', authMiddleware, getMyAddressesController);

/**
 * @swagger
 * /addresses/{addressId}:
 *   get:
 *     summary: Get address by id
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 */
router.get('/:addressId', authMiddleware, getAddressByIdController);

/**
 * @swagger
 * /addresses/{addressId}:
 *   patch:
 *     summary: Update address
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 */
router.patch(
  '/:addressId',
  authMiddleware,
  validate(updateAddressSchema),
  updateAddressController
);

/**
 * @swagger
 * /addresses/{addressId}:
 *   delete:
 *     summary: Delete address
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 */
router.delete('/:addressId', authMiddleware, deleteAddressController);

/**
 * @swagger
 * /addresses/{addressId}/set-default:
 *   post:
 *     summary: Set default address
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 */
router.post(
  '/:addressId/set-default',
  authMiddleware,
  setDefaultAddressController
);

export default router;