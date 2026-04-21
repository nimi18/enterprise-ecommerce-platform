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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - phone
 *               - addressLine1
 *               - city
 *               - state
 *               - postalCode
 *               - country
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Nimita Malhotra
 *               phone:
 *                 type: string
 *                 example: "9999999999"
 *               addressLine1:
 *                 type: string
 *                 example: 123 Street
 *               addressLine2:
 *                 type: string
 *                 example: Near Metro Station
 *               city:
 *                 type: string
 *                 example: Delhi
 *               state:
 *                 type: string
 *                 example: Delhi
 *               postalCode:
 *                 type: string
 *                 example: "110001"
 *               country:
 *                 type: string
 *                 example: India
 *               landmark:
 *                 type: string
 *                 example: Opposite City Mall
 *               addressType:
 *                 type: string
 *                 enum: [home, work, other]
 *                 example: home
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Address added successfully
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
 *     responses:
 *       200:
 *         description: Addresses fetched successfully
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
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Address fetched successfully
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
 *     parameters:
 *       - in: path
 *         name: addressId
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
 *               fullName:
 *                 type: string
 *                 example: Nimita Malhotra
 *               phone:
 *                 type: string
 *                 example: "9999999999"
 *               addressLine1:
 *                 type: string
 *                 example: 123 Street
 *               addressLine2:
 *                 type: string
 *                 example: Near Metro Station
 *               city:
 *                 type: string
 *                 example: Delhi
 *               state:
 *                 type: string
 *                 example: Delhi
 *               postalCode:
 *                 type: string
 *                 example: "110001"
 *               country:
 *                 type: string
 *                 example: India
 *               landmark:
 *                 type: string
 *                 example: Opposite City Mall
 *               addressType:
 *                 type: string
 *                 enum: [home, work, other]
 *                 example: home
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Address updated successfully
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
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Address deleted successfully
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
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Default address updated successfully
 */
router.post(
  '/:addressId/set-default',
  authMiddleware,
  setDefaultAddressController
);

export default router;