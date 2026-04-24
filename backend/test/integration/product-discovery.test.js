import '../helpers/setup.js';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';
import {
  createCategoryFactory,
  createProductFactory,
} from '../helpers/factories.js';

describe('Product Discovery API', () => {
  it('should filter products by search keyword', async () => {
    await createProductFactory({
      title: 'iPhone 15',
      slug: 'iphone-15',
      sku: 'IPHONE15-SEARCH',
      description: 'Apple smartphone',
      price: 75000,
    });

    await createProductFactory({
      title: 'Wooden Table',
      slug: 'wooden-table',
      sku: 'TABLE-SEARCH',
      description: 'Home furniture',
      price: 12000,
    });

    const response = await request(app).get('/api/products?search=iphone');

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.items).to.have.length(1);
    expect(response.body.data.items[0].title).to.equal('iPhone 15');
  });

  it('should filter products by category', async () => {
    const electronics = await createCategoryFactory({
      name: 'Electronics',
      slug: 'electronics',
    });

    const fashion = await createCategoryFactory({
      name: 'Fashion',
      slug: 'fashion',
    });

    await createProductFactory({
      title: 'iPhone 15',
      slug: 'iphone-15',
      sku: 'IPHONE15-CAT',
      category: electronics._id,
    });

    await createProductFactory({
      title: 'Running Shoes',
      slug: 'running-shoes',
      sku: 'SHOES-CAT',
      category: fashion._id,
    });

    const response = await request(app).get(
      `/api/products?category=${electronics._id}`
    );

    expect(response.status).to.equal(200);
    expect(response.body.data.items).to.have.length(1);
    expect(response.body.data.items[0].title).to.equal('iPhone 15');
  });

  it('should filter products by price range', async () => {
    await createProductFactory({
      title: 'Budget Earphones',
      slug: 'budget-earphones',
      sku: 'EARPHONE-PRICE',
      price: 999,
    });

    await createProductFactory({
      title: 'Premium Headphones',
      slug: 'premium-headphones',
      sku: 'HEADPHONE-PRICE',
      price: 24999,
    });

    const response = await request(app).get(
      '/api/products?minPrice=10000&maxPrice=30000'
    );

    expect(response.status).to.equal(200);
    expect(response.body.data.items).to.have.length(1);
    expect(response.body.data.items[0].title).to.equal('Premium Headphones');
  });

  it('should filter products by minimum rating', async () => {
    await createProductFactory({
      title: 'Average Product',
      slug: 'average-product',
      sku: 'AVG-RATING',
      averageRating: 3.5,
    });

    await createProductFactory({
      title: 'Top Rated Product',
      slug: 'top-rated-product',
      sku: 'TOP-RATING',
      averageRating: 4.7,
    });

    const response = await request(app).get('/api/products?minRating=4');

    expect(response.status).to.equal(200);
    expect(response.body.data.items).to.have.length(1);
    expect(response.body.data.items[0].title).to.equal('Top Rated Product');
  });

  it('should sort products by price ascending', async () => {
    await createProductFactory({
      title: 'Expensive Product',
      slug: 'expensive-product',
      sku: 'EXP-SORT',
      price: 50000,
    });

    await createProductFactory({
      title: 'Affordable Product',
      slug: 'affordable-product',
      sku: 'AFF-SORT',
      price: 1000,
    });

    const response = await request(app).get(
      '/api/products?sortBy=price&sortOrder=asc'
    );

    expect(response.status).to.equal(200);
    expect(response.body.data.items[0].title).to.equal('Affordable Product');
  });

  it('should return featured products', async () => {
    await createProductFactory({
      title: 'Featured Phone',
      slug: 'featured-phone',
      sku: 'FEATURED-001',
      isFeatured: true,
    });

    await createProductFactory({
      title: 'Regular Phone',
      slug: 'regular-phone',
      sku: 'REGULAR-001',
      isFeatured: false,
    });

    const response = await request(app).get('/api/products/featured');

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data).to.have.length(1);
    expect(response.body.data[0].title).to.equal('Featured Phone');
  });

  it('should return recommended products from same category excluding current product', async () => {
    const category = await createCategoryFactory({
      name: 'Electronics',
      slug: 'electronics',
    });

    const currentProduct = await createProductFactory({
      title: 'iPhone 15',
      slug: 'iphone-15',
      sku: 'IPHONE15-REC',
      category: category._id,
      averageRating: 4.5,
    });

    await createProductFactory({
      title: 'Samsung Galaxy S24',
      slug: 'samsung-galaxy-s24',
      sku: 'SAMS24-REC',
      category: category._id,
      averageRating: 4.7,
    });

    const response = await request(app).get(
      `/api/products/${currentProduct._id}/recommended`
    );

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data).to.have.length(1);
    expect(response.body.data[0].title).to.equal('Samsung Galaxy S24');
  });
});