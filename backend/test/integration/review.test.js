import '../helpers/setup.js';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';
import Order from '../../src/models/order.model.js';
import Product from '../../src/models/product.model.js';
import { loginAndGetToken } from '../helpers/auth.js';
import { createProductFactory } from '../helpers/factories.js';

const createPaidOrderForProduct = async ({ userId, product }) => {
  return Order.create({
    orderNumber: `ORD-TEST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
    paymentReference: 'test_payment_reference',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    shippingMethod: 'standard',
    paidAt: new Date(),
  });
};

describe('Review API', () => {
  it('should allow customer to review a purchased product', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      title: 'iPhone 15',
      slug: 'iphone-15',
      sku: 'IPHONE15-REVIEW',
      price: 50000,
    });

    await createPaidOrderForProduct({
      userId: user._id,
      product,
    });

    const response = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        rating: 5,
        title: 'Excellent product',
        comment: 'Great quality and very smooth experience.',
      });

    expect(response.status).to.equal(201);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.rating).to.equal(5);

    const updatedProduct = await Product.findById(product._id);

    expect(updatedProduct.averageRating).to.equal(5);
    expect(updatedProduct.reviewCount).to.equal(1);
  });

  it('should not allow customer to review product without purchase', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      title: 'iPhone 15',
      slug: 'iphone-15',
      sku: 'IPHONE15-NOPURCHASE',
    });

    const response = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        rating: 5,
        title: 'Excellent product',
        comment: 'Great quality and very smooth experience.',
      });

    expect(response.status).to.equal(403);
    expect(response.body.success).to.equal(false);
  });

  it('should not allow duplicate review for same product', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      title: 'iPhone 15',
      slug: 'iphone-15',
      sku: 'IPHONE15-DUPREVIEW',
      price: 50000,
    });

    await createPaidOrderForProduct({
      userId: user._id,
      product,
    });

    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        rating: 5,
        title: 'Excellent product',
        comment: 'Great quality and very smooth experience.',
      });

    const duplicateResponse = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        rating: 4,
        title: 'Updated opinion',
        comment: 'Still good.',
      });

    expect(duplicateResponse.status).to.equal(409);
    expect(duplicateResponse.body.success).to.equal(false);
  });

  it('should list product reviews', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      title: 'iPhone 15',
      slug: 'iphone-15',
      sku: 'IPHONE15-LISTREVIEWS',
      price: 50000,
    });

    await createPaidOrderForProduct({
      userId: user._id,
      product,
    });

    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        rating: 5,
        title: 'Excellent product',
        comment: 'Great quality and very smooth experience.',
      });

    const response = await request(app).get(`/api/reviews/product/${product._id}`);

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data).to.have.length(1);
    expect(response.body.data[0].rating).to.equal(5);
  });

  it('should update own review and sync product rating summary', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      title: 'iPhone 15',
      slug: 'iphone-15',
      sku: 'IPHONE15-UPDATEREVIEW',
      price: 50000,
    });

    await createPaidOrderForProduct({
      userId: user._id,
      product,
    });

    const createResponse = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        rating: 5,
        title: 'Excellent product',
        comment: 'Great quality and very smooth experience.',
      });

    const reviewId = createResponse.body.data._id;

    const updateResponse = await request(app)
      .patch(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        rating: 4,
        title: 'Very good',
        comment: 'Still a strong product overall.',
      });

    expect(updateResponse.status).to.equal(200);
    expect(updateResponse.body.data.rating).to.equal(4);

    const updatedProduct = await Product.findById(product._id);

    expect(updatedProduct.averageRating).to.equal(4);
    expect(updatedProduct.reviewCount).to.equal(1);
  });

  it('should delete own review and sync product rating summary', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      title: 'iPhone 15',
      slug: 'iphone-15',
      sku: 'IPHONE15-DELETEREVIEW',
      price: 50000,
    });

    await createPaidOrderForProduct({
      userId: user._id,
      product,
    });

    const createResponse = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        rating: 5,
        title: 'Excellent product',
        comment: 'Great quality and very smooth experience.',
      });

    const reviewId = createResponse.body.data._id;

    const deleteResponse = await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteResponse.status).to.equal(200);
    expect(deleteResponse.body.data.isActive).to.equal(false);

    const updatedProduct = await Product.findById(product._id);

    expect(updatedProduct.averageRating).to.equal(0);
    expect(updatedProduct.reviewCount).to.equal(0);
  });
});