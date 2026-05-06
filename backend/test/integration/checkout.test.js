import '../helpers/setup.js';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';
import Address from '../../src/models/address.model.js';
import Cart from '../../src/models/cart.model.js';
import Order from '../../src/models/order.model.js';
import { loginAndGetToken } from '../helpers/auth.js';
import { createProductFactory } from '../helpers/factories.js';

const createAddressForUser = async (userId) => {
  return Address.create({
    user: userId,
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
    isDefault: true,
  });
};

describe('Checkout API', () => {
  it('should create pending order from cart without clearing cart before payment', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      title: 'iPhone 15',
      slug: 'iphone-15-checkout',
      sku: 'IPHONE15-CHECKOUT',
      price: 50000,
      stock: 10,
    });

    const address = await createAddressForUser(user._id);

    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        quantity: 2,
      });

    const response = await request(app)
      .post('/api/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        addressId: address._id.toString(),
        shippingMethod: 'standard',
      });

    expect(response.status).to.equal(201);
    expect(response.body.success).to.equal(true);
    expect(response.body.data._id).to.be.a('string');
    expect(response.body.data.orderId).to.be.a('string');
    expect(response.body.data.paymentStatus).to.equal('pending');
    expect(response.body.data.orderStatus).to.equal('pending');
    expect(response.body.data.items).to.have.length(1);
    expect(response.body.data.total).to.equal(100050);

    const order = await Order.findById(response.body.data._id);
    expect(order).to.not.equal(null);

    const cart = await Cart.findOne({ user: user._id });
    expect(cart.items).to.have.length(1);
  });

  it('should fail checkout when cart is empty', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const address = await createAddressForUser(user._id);

    const response = await request(app)
      .post('/api/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        addressId: address._id.toString(),
        shippingMethod: 'standard',
      });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
  });

  it('should fail checkout for invalid address', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'CHECKOUT-INVALID-ADDR',
      price: 1000,
      stock: 10,
    });

    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        quantity: 1,
      });

    const response = await request(app)
      .post('/api/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        addressId: '680f3a6f0c1234567890abcd',
        shippingMethod: 'standard',
      });

    expect(response.status).to.equal(404);
    expect(response.body.success).to.equal(false);
  });

  it('should fail checkout when stock is insufficient', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'CHECKOUT-STOCK',
      price: 1000,
      stock: 1,
    });

    const address = await createAddressForUser(user._id);

    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        quantity: 1,
      });

    product.stock = 0;
    await product.save();

    const response = await request(app)
      .post('/api/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        addressId: address._id.toString(),
        shippingMethod: 'standard',
      });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
  });
});