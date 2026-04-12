import mongoose from 'mongoose';
import ERROR_CODES from '../constants/errorCodes.js';
import { findAddressByUserAndId } from '../repositories/address.repository.js';
import {
  findCartByUser,
  updateCartById,
} from '../repositories/cart.repository.js';
import { findProductById } from '../repositories/product.repository.js';
import { createOrder } from '../repositories/order.repository.js';
import AppError from '../utils/appError.js';

const generateOrderNumber = () => {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const buildOrderItems = async (cartItems) => {
  const items = [];

  for (const item of cartItems) {
    const product = await findProductById(item.product._id);

    if (!product || !product.isActive) {
      throw new AppError('Product not available', 400, ERROR_CODES.BAD_REQUEST);
    }

    if (product.stock < item.quantity) {
      throw new AppError(
        `Insufficient stock for ${product.title}`,
        400,
        ERROR_CODES.BAD_REQUEST
      );
    }

    items.push({
      product: product._id,
      titleSnapshot: product.title,
      skuSnapshot: product.sku,
      imageSnapshot: product.images?.[0] || '',
      quantity: item.quantity,
      unitPrice: product.price,
      lineTotal: product.price * item.quantity,
    });
  }

  return items;
};

const checkoutService = async (userId, { addressId, shippingMethod }) => {
  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new AppError('Invalid address id', 400, ERROR_CODES.BAD_REQUEST);
  }

  const cart = await findCartByUser(userId);

  if (!cart || !cart.items.length) {
    throw new AppError('Cart is empty', 400, ERROR_CODES.BAD_REQUEST);
  }

  const address = await findAddressByUserAndId(userId, addressId);

  if (!address) {
    throw new AppError('Address not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const items = await buildOrderItems(cart.items);

  const addressSnapshot = {
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    landmark: address.landmark,
    addressType: address.addressType,
  };

  const couponSnapshot = cart.coupon
    ? {
        couponId: cart.coupon._id,
        code: cart.couponCodeSnapshot,
      }
    : null;

  const shippingCharge = shippingMethod === 'express' ? 100 : 50;

  const order = await createOrder({
    orderNumber: generateOrderNumber(),
    user: userId,
    items,
    addressSnapshot,
    couponSnapshot,
    subtotal: cart.subtotal,
    discount: cart.discount,
    shippingCharge,
    total: cart.total + shippingCharge,
    paymentStatus: 'pending',
    orderStatus: 'pending',
    shippingMethod,
  });

  // optional: clear cart after checkout
  await updateCartById(cart._id, {
    items: [],
    subtotal: 0,
    discount: 0,
    shippingCharge: 0,
    total: 0,
    coupon: null,
    couponCodeSnapshot: '',
  });

  return order;
};

export { checkoutService };