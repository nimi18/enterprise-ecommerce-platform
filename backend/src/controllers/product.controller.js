import {
  createProductService,
  deactivateProductService,
  getFeaturedProductsService,
  getProductByIdService,
  getRecommendedProductsService,
  listProductsService,
  updateProductService,
} from '../services/product.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccessResponse } from '../utils/response.js';

const createProductController = asyncHandler(async (req, res) => {
  const data = await createProductService(req.body, req.user);

  return sendSuccessResponse(res, {
    statusCode: 201,
    message: 'Product created successfully',
    data,
  });
});

const listProductsController = asyncHandler(async (req, res) => {
  const data = await listProductsService(req.query);

  return sendSuccessResponse(res, {
    statusCode: 200,
    message: 'Products fetched successfully',
    data,
  });
});

const getProductByIdController = asyncHandler(async (req, res) => {
  const data = await getProductByIdService(req.params.productId);

  return sendSuccessResponse(res, {
    statusCode: 200,
    message: 'Product fetched successfully',
    data,
  });
});

const updateProductController = asyncHandler(async (req, res) => {
  const data = await updateProductService(req.params.productId, req.body);

  return sendSuccessResponse(res, {
    statusCode: 200,
    message: 'Product updated successfully',
    data,
  });
});

const deactivateProductController = asyncHandler(async (req, res) => {
  const data = await deactivateProductService(req.params.productId);

  return sendSuccessResponse(res, {
    statusCode: 200,
    message: 'Product deactivated successfully',
    data,
  });
});

const getFeaturedProductsController = asyncHandler(async (req, res) => {
  const data = await getFeaturedProductsService();

  return sendSuccessResponse(res, {
    statusCode: 200,
    message: 'Featured products fetched successfully',
    data,
  });
});

const getRecommendedProductsController = asyncHandler(async (req, res) => {
  const data = await getRecommendedProductsService(req.params.productId);

  return sendSuccessResponse(res, {
    statusCode: 200,
    message: 'Recommended products fetched successfully',
    data,
  });
});

export {
  createProductController,
  listProductsController,
  getProductByIdController,
  updateProductController,
  deactivateProductController,
  getFeaturedProductsController,
  getRecommendedProductsController,
};