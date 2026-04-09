import {
  addToCartService,
  clearCartService,
  getCartService,
  moveCartItemToWishlistService,
  removeCartItemService,
  updateCartItemService,
  applyCouponService,
  removeCouponService,
} from '../services/cart.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccessResponse } from '../utils/response.js';

const getCartController = asyncHandler(async (req, res) => {
  const data = await getCartService(req.user.userId);

  return sendSuccessResponse(res, {
    message: 'Cart fetched successfully',
    data,
  });
});

const addToCartController = asyncHandler(async (req, res) => {
  const data = await addToCartService(req.user.userId, req.body);

  return sendSuccessResponse(res, {
    message: 'Product added to cart',
    data,
  });
});

const updateCartItemController = asyncHandler(async (req, res) => {
  const data = await updateCartItemService(
    req.user.userId,
    req.params.productId,
    req.body
  );

  return sendSuccessResponse(res, {
    message: 'Cart item updated successfully',
    data,
  });
});

const removeCartItemController = asyncHandler(async (req, res) => {
  const data = await removeCartItemService(
    req.user.userId,
    req.params.productId
  );

  return sendSuccessResponse(res, {
    message: 'Cart item removed successfully',
    data,
  });
});

const clearCartController = asyncHandler(async (req, res) => {
  const data = await clearCartService(req.user.userId);

  return sendSuccessResponse(res, {
    message: 'Cart cleared successfully',
    data,
  });
});

const moveCartItemToWishlistController = asyncHandler(async (req, res) => {
  const data = await moveCartItemToWishlistService(
    req.user.userId,
    req.params.productId
  );

  return sendSuccessResponse(res, {
    message: 'Cart item moved to wishlist successfully',
    data,
  });
});

const applyCouponController = asyncHandler(async (req, res) => {
  const data = await applyCouponService(req.user.userId, req.body);

  return sendSuccessResponse(res, {
    message: 'Coupon applied successfully',
    data,
  });
});

const removeCouponController = asyncHandler(async (req, res) => {
  const data = await removeCouponService(req.user.userId);

  return sendSuccessResponse(res, {
    message: 'Coupon removed successfully',
    data,
  });
});

export {
  getCartController,
  addToCartController,
  updateCartItemController,
  removeCartItemController,
  clearCartController,
  moveCartItemToWishlistController,
  applyCouponController,
  removeCouponController,
};