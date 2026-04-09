import mongoose from 'mongoose';
import ERROR_CODES from '../constants/errorCodes.js';
import {
  createCart,
  findCartByUser,
  updateCartById,
} from '../repositories/cart.repository.js';
import { findProductById } from '../repositories/product.repository.js';
import {
  addToWishlistService,
} from './wishlist.service.js';
import AppError from '../utils/appError.js';
import { calculateCartTotals, calculateLineTotal } from '../utils/cart.js';
import { findCouponByCode } from '../repositories/coupon.repository.js';

const buildCartResponse = (cart) => {
  return {
    _id: cart._id,
    user: cart.user,
    items: cart.items.map((item) => ({
      product: item.product,
      titleSnapshot: item.titleSnapshot,
      priceSnapshot: item.priceSnapshot,
      imageSnapshot: item.imageSnapshot,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
    coupon: cart.coupon,
    couponCodeSnapshot: cart.couponCodeSnapshot,
    subtotal: cart.subtotal,
    discount: cart.discount,
    shippingCharge: cart.shippingCharge,
    total: cart.total,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
};

const getOrCreateCart = async (userId) => {
  let cart = await findCartByUser(userId);

  if (!cart) {
    cart = await createCart({
      user: userId,
      items: [],
      coupon: null,
      couponCodeSnapshot: '',
      subtotal: 0,
      discount: 0,
      shippingCharge: 0,
      total: 0,
    });

    cart = await findCartByUser(userId);
  }

  return cart;
};

const recalculateCartPayload = ({ items, discount = 0, shippingCharge = 0 }) => {
  const normalizedItems = items.map((item) => {
    const lineTotal = calculateLineTotal({
      price: item.priceSnapshot,
      quantity: item.quantity,
    });

    return {
      product: item.product,
      titleSnapshot: item.titleSnapshot,
      priceSnapshot: item.priceSnapshot,
      imageSnapshot: item.imageSnapshot || '',
      quantity: item.quantity,
      lineTotal,
    };
  });

  const totals = calculateCartTotals({
    items: normalizedItems,
    discount,
    shippingCharge,
  });

  return {
    items: normalizedItems,
    ...totals,
  };
};

const getCartService = async (userId) => {
  const cart = await getOrCreateCart(userId);
  return buildCartResponse(cart);
};

const addToCartService = async (userId, { productId, quantity }) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError('Invalid product id', 400, ERROR_CODES.BAD_REQUEST);
  }

  const product = await findProductById(productId);

  if (!product || !product.isActive) {
    throw new AppError('Product not found', 404, ERROR_CODES.NOT_FOUND);
  }

  if (product.stock < quantity) {
    throw new AppError('Requested quantity is not available in stock', 400, ERROR_CODES.BAD_REQUEST);
  }

  const cart = await getOrCreateCart(userId);

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product._id.toString() === productId
  );

  let updatedItems = [...cart.items];

  if (existingItemIndex >= 0) {
    const existingItem = updatedItems[existingItemIndex];
    const newQuantity = existingItem.quantity + quantity;

    if (product.stock < newQuantity) {
      throw new AppError('Requested quantity is not available in stock', 400, ERROR_CODES.BAD_REQUEST);
    }

    updatedItems[existingItemIndex] = {
      ...existingItem.toObject(),
      product: existingItem.product._id,
      quantity: newQuantity,
    };
  } else {
    updatedItems.push({
      product: product._id,
      titleSnapshot: product.title,
      priceSnapshot: product.price,
      imageSnapshot: product.images?.[0] || '',
      quantity,
    });
  }

  const recalculated = recalculateCartPayload({
    items: updatedItems,
    discount: 0,
    shippingCharge: 0,
  });

  const updatedCart = await updateCartById(cart._id, {
    ...recalculated,
    coupon: null,
    couponCodeSnapshot: '',
  });

  return buildCartResponse(updatedCart);
};

const updateCartItemService = async (userId, productId, { quantity }) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError('Invalid product id', 400, ERROR_CODES.BAD_REQUEST);
  }

  const product = await findProductById(productId);

  if (!product || !product.isActive) {
    throw new AppError('Product not found', 404, ERROR_CODES.NOT_FOUND);
  }

  if (product.stock < quantity) {
    throw new AppError('Requested quantity is not available in stock', 400, ERROR_CODES.BAD_REQUEST);
  }

  const cart = await getOrCreateCart(userId);

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product._id.toString() === productId
  );

  if (existingItemIndex === -1) {
    throw new AppError('Cart item not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const updatedItems = [...cart.items];
  const existingItem = updatedItems[existingItemIndex];

  updatedItems[existingItemIndex] = {
    ...existingItem.toObject(),
    product: existingItem.product._id,
    quantity,
  };

  const recalculated = recalculateCartPayload({
    items: updatedItems,
    discount: 0,
    shippingCharge: 0,
  });

  const updatedCart = await updateCartById(cart._id, {
    ...recalculated,
    coupon: null,
    couponCodeSnapshot: '',
  });

  return buildCartResponse(updatedCart);
};

const removeCartItemService = async (userId, productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError('Invalid product id', 400, ERROR_CODES.BAD_REQUEST);
  }

  const cart = await getOrCreateCart(userId);

  const filteredItems = cart.items.filter(
    (item) => item.product._id.toString() !== productId
  );

  if (filteredItems.length === cart.items.length) {
    throw new AppError('Cart item not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const recalculated = recalculateCartPayload({
    items: filteredItems,
    discount: 0,
    shippingCharge: 0,
  });

  const updatedCart = await updateCartById(cart._id, {
    ...recalculated,
    coupon: null,
    couponCodeSnapshot: '',
  });

  return buildCartResponse(updatedCart);
};

const clearCartService = async (userId) => {
  const cart = await getOrCreateCart(userId);

  const updatedCart = await updateCartById(cart._id, {
    items: [],
    coupon: null,
    couponCodeSnapshot: '',
    subtotal: 0,
    discount: 0,
    shippingCharge: 0,
    total: 0,
  });

  return buildCartResponse(updatedCart);
};

const moveCartItemToWishlistService = async (userId, productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError('Invalid product id', 400, ERROR_CODES.BAD_REQUEST);
  }

  const cart = await getOrCreateCart(userId);

  const existingItem = cart.items.find(
    (item) => item.product._id.toString() === productId
  );

  if (!existingItem) {
    throw new AppError('Cart item not found', 404, ERROR_CODES.NOT_FOUND);
  }

  await addToWishlistService(userId, productId);

  const filteredItems = cart.items.filter(
    (item) => item.product._id.toString() !== productId
  );

  const recalculated = recalculateCartPayload({
    items: filteredItems,
    discount: 0,
    shippingCharge: 0,
  });

  const updatedCart = await updateCartById(cart._id, {
    ...recalculated,
    coupon: null,
    couponCodeSnapshot: '',
  });

  return buildCartResponse(updatedCart);
};

const validateCoupon = (coupon, cart) => {
  if (!coupon) {
    throw new AppError('Invalid coupon code', 400, ERROR_CODES.BAD_REQUEST);
  }

  if (!coupon.isActive) {
    throw new AppError('Coupon is inactive', 400, ERROR_CODES.BAD_REQUEST);
  }

  if (coupon.expiryDate < new Date()) {
    throw new AppError('Coupon has expired', 400, ERROR_CODES.BAD_REQUEST);
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    throw new AppError('Coupon usage limit exceeded', 400, ERROR_CODES.BAD_REQUEST);
  }

  if (cart.subtotal < coupon.minOrderValue) {
    throw new AppError(
      `Minimum order value is ${coupon.minOrderValue}`,
      400,
      ERROR_CODES.BAD_REQUEST
    );
  }
};

const calculateDiscount = (coupon, subtotal) => {
  let discount = 0;

  if (coupon.discountType === 'flat') {
    discount = coupon.discountValue;
  } else {
    discount = (subtotal * coupon.discountValue) / 100;

    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  }

  return Number(discount.toFixed(2));
};

const applyCouponService = async (userId, { code }) => {
  const cart = await getOrCreateCart(userId);

  if (!cart.items.length) {
    throw new AppError('Cart is empty', 400, ERROR_CODES.BAD_REQUEST);
  }

  const coupon = await findCouponByCode(code);

  validateCoupon(coupon, cart);

  const discount = calculateDiscount(coupon, cart.subtotal);

  const recalculated = calculateCartTotals({
    items: cart.items,
    discount,
    shippingCharge: cart.shippingCharge,
  });

  const updatedCart = await updateCartById(cart._id, {
    ...recalculated,
    coupon: coupon._id,
    couponCodeSnapshot: coupon.code,
  });

  return buildCartResponse(updatedCart);
};

const removeCouponService = async (userId) => {
  const cart = await getOrCreateCart(userId);

  const recalculated = calculateCartTotals({
    items: cart.items,
    discount: 0,
    shippingCharge: cart.shippingCharge,
  });

  const updatedCart = await updateCartById(cart._id, {
    ...recalculated,
    coupon: null,
    couponCodeSnapshot: '',
  });

  return buildCartResponse(updatedCart);
};

export {
  getCartService,
  addToCartService,
  updateCartItemService,
  removeCartItemService,
  clearCartService,
  moveCartItemToWishlistService,
  applyCouponService,
  removeCouponService,
};