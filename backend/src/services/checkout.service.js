import mongoose from 'mongoose';
import ERROR_CODES from '../constants/errorCodes.js';
import { findAddressByUserAndId } from '../repositories/address.repository.js';
import { findCartByUser } from '../repositories/cart.repository.js';
import { findProductById } from '../repositories/product.repository.js';
import { createOrder } from '../repositories/order.repository.js';
import AppError from '../utils/appError.js';

const generateOrderNumber = () => {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const buildOrderItems = async (cartItems) => {
  const items = [];

  for (const item of cartItems) {
    const productId = item.product?._id || item.product;
    const product = await findProductById(productId);

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

const buildCheckoutResponse = (order) => {
  return {
    _id: order._id,
    orderId: order._id,
    orderNumber: order.orderNumber,
    user: order.user,
    items: order.items,
    addressSnapshot: order.addressSnapshot,
    couponSnapshot: order.couponSnapshot,
    subtotal: order.subtotal,
    discount: order.discount,
    shippingCharge: order.shippingCharge,
    total: order.total,
    paymentProvider: order.paymentProvider,
    paymentReference: order.paymentReference,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    shippingMethod: order.shippingMethod,
    placedAt: order.placedAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
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
        discountType: cart.coupon.discountType,
        discountValue: cart.coupon.discountValue,
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
    total: cart.subtotal - cart.discount + shippingCharge,
    paymentProvider: 'stripe',
    paymentReference: null,
    paymentStatus: 'pending',
    orderStatus: 'pending',
    shippingMethod,
  });

  return buildCheckoutResponse(order);
};

export { checkoutService };