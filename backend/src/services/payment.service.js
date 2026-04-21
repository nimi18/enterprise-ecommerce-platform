import stripe from '../config/stripe.js';
import env from '../config/env.js';
import { findOrderById } from '../repositories/order.repository.js';
import AppError from '../utils/appError.js';

const createCheckoutSessionService = async (userId, orderId) => {
  const order = await findOrderById(orderId);

  if (!order || order.user.toString() !== userId) {
    throw new AppError('Order not found', 404);
  }

  if (order.paymentStatus !== 'pending') {
    throw new AppError('Order already paid or invalid', 400);
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',

    line_items: order.items.map((item) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.titleSnapshot,
        },
        unit_amount: item.unitPrice * 100,
      },
      quantity: item.quantity,
    })),

    success_url: `${env.frontendUrl}/success?orderId=${order._id}`,
    cancel_url: `${env.frontendUrl}/cancel?orderId=${order._id}`,

    metadata: {
      orderId: order._id.toString(),
      userId,
    },
  });

  return {
    url: session.url,
  };
};

export { createCheckoutSessionService };