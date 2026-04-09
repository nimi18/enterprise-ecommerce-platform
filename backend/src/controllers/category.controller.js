import {
  createCategoryService,
  deactivateCategoryService,
  getCategoryByIdService,
  listCategoriesService,
  updateCategoryService,
} from '../services/category.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccessResponse } from '../utils/response.js';

const createCategoryController = asyncHandler(async (req, res) => {
  const data = await createCategoryService(req.body);

  return sendSuccessResponse(res, {
    statusCode: 201,
    message: 'Category created successfully',
    data,
  });
});

const listCategoriesController = asyncHandler(async (req, res) => {
  const isActive =
    typeof req.query.isActive === 'string'
      ? req.query.isActive === 'true'
      : undefined;

  const data = await listCategoriesService({ isActive });

  return sendSuccessResponse(res, {
    statusCode: 200,
    message: 'Categories fetched successfully',
    data,
  });
});

const getCategoryByIdController = asyncHandler(async (req, res) => {
  const data = await getCategoryByIdService(req.params.categoryId);

  return sendSuccessResponse(res, {
    statusCode: 200,
    message: 'Category fetched successfully',
    data,
  });
});

const updateCategoryController = asyncHandler(async (req, res) => {
  const data = await updateCategoryService(req.params.categoryId, req.body);

  return sendSuccessResponse(res, {
    statusCode: 200,
    message: 'Category updated successfully',
    data,
  });
});

const deactivateCategoryController = asyncHandler(async (req, res) => {
  const data = await deactivateCategoryService(req.params.categoryId);

  return sendSuccessResponse(res, {
    statusCode: 200,
    message: 'Category deactivated successfully',
    data,
  });
});

export {
  createCategoryController,
  listCategoriesController,
  getCategoryByIdController,
  updateCategoryController,
  deactivateCategoryController,
};