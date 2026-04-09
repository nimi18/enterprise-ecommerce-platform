import ERROR_CODES from '../constants/errorCodes.js';
import { findProductById } from '../repositories/product.repository.js';
import {
  createWishlist,
  findWishlistByUser,
  updateWishlist,
} from '../repositories/wishlist.repository.js';
import AppError from '../utils/appError.js';

const getOrCreateWishlist = async (userId) => {
  let wishlist = await findWishlistByUser(userId);

  if (!wishlist) {
    wishlist = await createWishlist({
      user: userId,
      products: [],
    });
  }

  return wishlist;
};

const getWishlistService = async (userId) => {
  const wishlist = await getOrCreateWishlist(userId);

  return wishlist.products;
};

const addToWishlistService = async (userId, productId) => {
  const product = await findProductById(productId);

  if (!product || !product.isActive) {
    throw new AppError('Product not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const wishlist = await getOrCreateWishlist(userId);

  const alreadyExists = wishlist.products.some(
    (item) => item._id.toString() === productId
  );

  if (alreadyExists) {
    return wishlist.products;
  }

  wishlist.products.push(productId);

  const updated = await updateWishlist(wishlist._id, {
    products: wishlist.products,
  });

  return updated.products;
};

const removeFromWishlistService = async (userId, productId) => {
  const wishlist = await getOrCreateWishlist(userId);

  const updatedProducts = wishlist.products.filter(
    (item) => item._id.toString() !== productId
  );

  const updated = await updateWishlist(wishlist._id, {
    products: updatedProducts,
  });

  return updated.products;
};

export {
  getWishlistService,
  addToWishlistService,
  removeFromWishlistService,
};