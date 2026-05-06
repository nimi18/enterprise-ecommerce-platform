import Cart from '../models/cart.model.js';

const cartPopulateOptions = {
  path: 'items.product',
  select:
    'title slug sku price compareAtPrice currency stock images averageRating reviewCount isActive',
};

const createCart = async (payload) => {
  return Cart.create(payload);
};

const findCartByUser = async (userId) => {
  return Cart.findOne({ user: userId }).populate(cartPopulateOptions);
};

const findCartByUserLean = async (userId) => {
  return Cart.findOne({ user: userId }).populate(cartPopulateOptions).lean();
};

const updateCartById = async (cartId, payload) => {
  return Cart.findByIdAndUpdate(cartId, payload, {
    new: true,
    runValidators: true,
  }).populate(cartPopulateOptions);
};

const deleteCartByUser = async (userId) => {
  return Cart.findOneAndDelete({ user: userId });
};

const deleteEmptyCartsOlderThan = async (date) => {
  return Cart.deleteMany({
    items: { $size: 0 },
    updatedAt: { $lte: date },
  });
};

const deleteExpiredCarts = async (date = new Date()) => {
  return Cart.deleteMany({
    expiresAt: { $ne: null, $lte: date },
  });
};

const findStaleCartsOlderThan = async (date) => {
  return Cart.find({
    updatedAt: { $lte: date },
  }).lean();
};

export {
  createCart,
  findCartByUser,
  findCartByUserLean,
  updateCartById,
  deleteCartByUser,
  deleteEmptyCartsOlderThan,
  deleteExpiredCarts,
  findStaleCartsOlderThan,
};