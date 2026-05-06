import {
  createReviewService,
  deleteReviewService,
  listProductReviewsService,
  updateReviewService,
  getMyReviewsService,
} from '../services/review.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccessResponse } from '../utils/response.js';

const createReviewController = asyncHandler(async (req, res) => {
  const data = await createReviewService(req.user.userId, req.body);

  return sendSuccessResponse(res, {
    statusCode: 201,
    message: 'Review created successfully',
    data,
  });
});

const listProductReviewsController = asyncHandler(async (req, res) => {
  const data = await listProductReviewsService(req.params.productId);

  return sendSuccessResponse(res, {
    statusCode: 200,
    message: 'Reviews fetched successfully',
    data,
  });
});

const updateReviewController = asyncHandler(async (req, res) => {
  const data = await updateReviewService(req.user.userId, req.params.reviewId, req.body);

  return sendSuccessResponse(res, {
    statusCode: 200,
    message: 'Review updated successfully',
    data,
  });
});

const deleteReviewController = asyncHandler(async (req, res) => {
  const data = await deleteReviewService(req.user.userId, req.params.reviewId);

  return sendSuccessResponse(res, {
    statusCode: 200,
    message: 'Review deleted successfully',
    data,
  });
});

const getMyReviewsController = asyncHandler(async (req, res) => {
  const data = await getMyReviewsService(req.user.userId, req.query);

  return sendSuccessResponse(res, {
    statusCode: 200,
    message: 'My reviews fetched successfully',
    data,
  });
});

export {
  createReviewController,
  listProductReviewsController,
  updateReviewController,
  deleteReviewController,
  getMyReviewsController,
};