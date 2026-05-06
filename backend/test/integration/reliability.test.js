import '../helpers/setup.js';
import { expect } from 'chai';
import Cart from '../../src/models/cart.model.js';
import Order from '../../src/models/order.model.js';
import PaymentLog from '../../src/models/paymentLog.model.js';
import {
  cleanupOldCartsService,
  expireOldPendingOrdersService,
  reconcilePaidOrderService,
} from '../../src/services/reliability.service.js';
import {
  createProductFactory,
  createUserFactory,
} from '../helpers/factories.js';

const createPendingOrder = async ({ userId, product, createdAt }) => {
  const order = await Order.create({
    orderNumber: `ORD-REL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    user: userId,
    items: [
      {
        product: product._id,
        titleSnapshot: product.title,
        skuSnapshot: product.sku,
        imageSnapshot: product.images?.[0] || '',
        quantity: 1,
        unitPrice: product.price,
        lineTotal: product.price,
      },
    ],
    addressSnapshot: {
      fullName: 'Test User',
      phone: '9999999999',
      addressLine1: '123 Test Street',
      addressLine2: '',
      city: 'Delhi',
      state: 'Delhi',
      postalCode: '110001',
      country: 'India',
      landmark: '',
      addressType: 'home',
    },
    couponSnapshot: null,
    subtotal: product.price,
    discount: 0,
    shippingCharge: 50,
    total: product.price + 50,
    paymentProvider: 'stripe',
    paymentReference: null,
    paymentStatus: 'pending',
    orderStatus: 'pending',
    shippingMethod: 'standard',
  });

  await Order.collection.updateOne(
    { _id: order._id },
    {
      $set: {
        createdAt,
        updatedAt: createdAt,
      },
    }
  );

  return Order.findById(order._id);
};

const createEmptyCartWithUpdatedAt = async ({ userId, updatedAt, expiresAt = null }) => {
  const cart = await Cart.create({
    user: userId,
    items: [],
    subtotal: 0,
    discount: 0,
    shippingCharge: 0,
    total: 0,
    expiresAt,
  });

  await Cart.collection.updateOne(
    { _id: cart._id },
    {
      $set: {
        updatedAt,
        lastActivityAt: updatedAt,
      },
    }
  );

  return Cart.findById(cart._id);
};

describe('Reliability Services', () => {
  it('should expire pending orders older than cutoff', async () => {
    const user = await createUserFactory({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'REL-PENDING-001',
      price: 1000,
    });

    const oldDate = new Date(Date.now() - 60 * 60 * 1000);

    const order = await createPendingOrder({
      userId: user._id,
      product,
      createdAt: oldDate,
    });

    const result = await expireOldPendingOrdersService({
      olderThanMinutes: 30,
    });

    expect(result.modified).to.equal(1);

    const updatedOrder = await Order.findById(order._id);

    expect(updatedOrder.paymentStatus).to.equal('failed');
    expect(updatedOrder.orderStatus).to.equal('failed');
  });

  it('should not expire recent pending orders', async () => {
    const user = await createUserFactory({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'REL-RECENT-001',
      price: 1000,
    });

    const recentDate = new Date(Date.now() - 5 * 60 * 1000);

    const order = await createPendingOrder({
      userId: user._id,
      product,
      createdAt: recentDate,
    });

    const result = await expireOldPendingOrdersService({
      olderThanMinutes: 30,
    });

    expect(result.modified).to.equal(0);

    const unchangedOrder = await Order.findById(order._id);

    expect(unchangedOrder.paymentStatus).to.equal('pending');
    expect(unchangedOrder.orderStatus).to.equal('pending');
  });

  it('should cleanup old empty carts', async () => {
    const user = await createUserFactory({
      email: 'cart-empty@example.com',
      role: 'customer',
    });

    const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

    const cart = await createEmptyCartWithUpdatedAt({
      userId: user._id,
      updatedAt: oldDate,
    });

    const result = await cleanupOldCartsService({
      emptyCartOlderThanDays: 7,
    });

    expect(result.emptyCartsDeleted).to.equal(1);

    const deletedCart = await Cart.findById(cart._id);
    expect(deletedCart).to.equal(null);
  });

  it('should cleanup expired carts', async () => {
    const user = await createUserFactory({
      email: 'cart-expired@example.com',
      role: 'customer',
    });

    const expiredDate = new Date(Date.now() - 60 * 1000);

    const cart = await createEmptyCartWithUpdatedAt({
      userId: user._id,
      updatedAt: new Date(),
      expiresAt: expiredDate,
    });

    const result = await cleanupOldCartsService({
      emptyCartOlderThanDays: 7,
    });

    expect(result.expiredCartsDeleted).to.equal(1);

    const deletedCart = await Cart.findById(cart._id);
    expect(deletedCart).to.equal(null);
  });

  it('should reconcile paid order and create payment log', async () => {
    const user = await createUserFactory({
      email: 'reconcile@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'REL-RECONCILE-001',
      price: 1000,
    });

    const order = await createPendingOrder({
      userId: user._id,
      product,
      createdAt: new Date(),
    });

    const updatedOrder = await reconcilePaidOrderService({
      orderId: order._id,
      paymentReference: 'cs_test_reconciled',
      paymentIntent: 'pi_test_reconciled',
      charge: 'ch_test_reconciled',
      customerEmail: 'reconcile@example.com',
      amountTotal: 105000,
      currency: 'inr',
      eventId: 'evt_manual_reconcile_001',
    });

    expect(updatedOrder.paymentStatus).to.equal('paid');
    expect(updatedOrder.orderStatus).to.equal('confirmed');
    expect(updatedOrder.paymentReference).to.equal('cs_test_reconciled');

    const paymentLog = await PaymentLog.findOne({
      eventId: 'evt_manual_reconcile_001',
    });

    expect(paymentLog).to.not.equal(null);
    expect(paymentLog.orderId.toString()).to.equal(order._id.toString());
    expect(paymentLog.paymentReference).to.equal('cs_test_reconciled');
    expect(paymentLog.paymentIntent).to.equal('pi_test_reconciled');
    expect(paymentLog.charge).to.equal('ch_test_reconciled');
    expect(paymentLog.customerEmail).to.equal('reconcile@example.com');
    expect(paymentLog.amountTotal).to.equal(105000);
    expect(paymentLog.paymentStatus).to.equal('paid');
  });
});