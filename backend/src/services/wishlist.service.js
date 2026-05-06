import mongoose from 'mongoose';
import ERROR_CODES from '../constants/errorCodes.js';
import { findProductById } from '../repositories/product.repository.js';
import {
  createWishlist,
  findWishlistByUser,
  updateWishlist,
} from '../repositories/wishlist.repository.js';
import AppError from '../utils/appError.js';

const buildWishlistResponse = (wishlist) => {
  return {
    items: wishlist.products,
  };
};

const getOrCreateWishlist = async (userId) => {
  let wishlist = await findWishlistByUser(userId);

  if (!wishlist) {
    wishlist = await createWishlist({
      user: userId,
      products: [],
    });

    wishlist = await findWishlistByUser(userId);
  }

  return wishlist;
};

const validateProductId = (productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError('Invalid product id', 400, ERROR_CODES.BAD_REQUEST);
  }
};

const getWishlistService = async (userId) => {
  const wishlist = await getOrCreateWishlist(userId);
  return buildWishlistResponse(wishlist);
};

const addToWishlistService = async (userId, productId) => {
  validateProductId(productId);

  const product = await findProductById(productId);

  if (!product || !product.isActive) {
    throw new AppError('Product not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const wishlist = await getOrCreateWishlist(userId);

  const alreadyExists = wishlist.products.some(
    (item) => item._id.toString() === productId
  );

  if (alreadyExists) {
    return buildWishlistResponse(wishlist);
  }

  wishlist.products.push(productId);

  const updated = await updateWishlist(wishlist._id, {
    products: wishlist.products,
  });

  return buildWishlistResponse(updated);
};

const removeFromWishlistService = async (userId, productId) => {
  validateProductId(productId);

  const wishlist = await getOrCreateWishlist(userId);

  const updatedProducts = wishlist.products.filter(
    (item) => item._id.toString() !== productId
  );

  const updated = await updateWishlist(wishlist._id, {
    products: updatedProducts,
  });

  return buildWishlistResponse(updated);
};

export {
  getWishlistService,
  addToWishlistService,
  removeFromWishlistService,
};