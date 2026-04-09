import {
  addToWishlistService,
  getWishlistService,
  removeFromWishlistService,
} from '../services/wishlist.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccessResponse } from '../utils/response.js';

const getWishlistController = asyncHandler(async (req, res) => {
  const data = await getWishlistService(req.user.userId);

  return sendSuccessResponse(res, {
    message: 'Wishlist fetched successfully',
    data,
  });
});

const addToWishlistController = asyncHandler(async (req, res) => {
  const data = await addToWishlistService(
    req.user.userId,
    req.params.productId
  );

  return sendSuccessResponse(res, {
    message: 'Product added to wishlist',
    data,
  });
});

const removeFromWishlistController = asyncHandler(async (req, res) => {
  const data = await removeFromWishlistService(
    req.user.userId,
    req.params.productId
  );

  return sendSuccessResponse(res, {
    message: 'Product removed from wishlist',
    data,
  });
});

export {
  getWishlistController,
  addToWishlistController,
  removeFromWishlistController,
};