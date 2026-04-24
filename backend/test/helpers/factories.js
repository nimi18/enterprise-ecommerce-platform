import Category from '../../src/models/category.model.js';
import Coupon from '../../src/models/coupon.model.js';
import Product from '../../src/models/product.model.js';
import User from '../../src/models/user.model.js';
import { hashPassword } from '../../src/utils/password.js';

const random = () => `${Date.now()}${Math.floor(Math.random() * 10000)}`;

const createUserFactory = async (overrides = {}) => {
  const suffix = random();

  const plainPassword = overrides.password || 'password123';
  const hashedPassword = await hashPassword(plainPassword);

  return User.create({
    name: `User ${suffix}`,
    email: `user${suffix}@example.com`,
    password: hashedPassword,
    role: 'customer',
    isActive: true,
    ...overrides,
    password: hashedPassword,
  });
};

const createCategoryFactory = async (overrides = {}) => {
  const suffix = random();

  return Category.create({
    name: `Electronics-${suffix}`,
    slug: `electronics-${suffix}`,
    description: 'Test category',
    isActive: true,
    ...overrides,
  });
};

const createProductFactory = async (overrides = {}) => {
  const suffix = random();

  let categoryId = overrides.category;

  if (!categoryId) {
    const category = await createCategoryFactory();
    categoryId = category._id;
  }

  return Product.create({
    title: `Test Product ${suffix}`,
    slug: `test-product-${suffix}`,
    description: 'Test product description',
    shortDescription: 'Test short description',
    sku: `SKU-${suffix}`,
    price: 1000,
    compareAtPrice: 1200,
    currency: 'INR',
    category: categoryId,
    stock: 10,
    images: ['https://example.com/product.jpg'],
    averageRating: 0,
    reviewCount: 0,
    isFeatured: false,
    isActive: true,
    ...overrides,
  });
};

const createCouponFactory = async (overrides = {}) => {
  const suffix = random();

  return Coupon.create({
    code: `SAVE${suffix}`,
    description: 'Test coupon',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 1000,
    maxDiscount: 500,
    usageLimit: null,
    usageCount: 0,
    perUserLimit: null,
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true,
    ...overrides,
  });
};

export {
  createUserFactory,
  createCategoryFactory,
  createProductFactory,
  createCouponFactory,
};