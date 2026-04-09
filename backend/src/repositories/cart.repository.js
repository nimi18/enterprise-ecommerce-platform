import Cart from '../models/cart.model.js';

const findCartByUser = async (userId) => {
  return Cart.findOne({ user: userId }).populate('items.product coupon');
};

const createCart = async (payload) => {
  return Cart.create(payload);
};

const updateCartById = async (cartId, payload) => {
  return Cart.findByIdAndUpdate(cartId, payload, {
    new: true,
    runValidators: true,
  }).populate('items.product coupon');
};

export {
  findCartByUser,
  createCart,
  updateCartById,
};