import Wishlist from '../models/wishlist.model.js';

const findWishlistByUser = async (userId) => {
  return Wishlist.findOne({ user: userId }).populate('products');
};

const createWishlist = async (payload) => {
  return Wishlist.create(payload);
};

const updateWishlist = async (wishlistId, payload) => {
  return Wishlist.findByIdAndUpdate(wishlistId, payload, {
    new: true,
  }).populate('products');
};

export {
  findWishlistByUser,
  createWishlist,
  updateWishlist,
};