import Category from '../../src/models/category.model.js';
import Coupon from '../../src/models/coupon.model.js';
import Product from '../../src/models/product.model.js';
import User from '../../src/models/user.model.js';
import { hashPassword } from '../../src/utils/password.js';

const createUserFactory = async (overrides = {}) => {
  const password = await hashPassword(overrides.password || 'password123');

  return User.create({
    name: 'Test User',
    email: overrides.email || 'test@example.com',
    password,
    role: overrides.role || 'customer',
    isActive: overrides.isActive ?? true,
  });
};

const createCategoryFactory = async (overrides = {}) => {
  return Category.create({
    name: overrides.name || 'Electronics',
    slug: overrides.slug || 'electronics',
    description: overrides.description || 'Electronics category',
    isActive: overrides.isActive ?? true,
  });
};

const createProductFactory = async (overrides = {}) => {
  let categoryId = overrides.category;

  if (!categoryId) {
    const category = await createCategoryFactory();
    categoryId = category._id;
  }

  return Product.create({
    title: overrides.title || 'iPhone 15',
    slug: overrides.slug || 'iphone-15',
    description: overrides.description || 'Latest smartphone',
    shortDescription: overrides.shortDescription || 'Premium phone',
    sku: overrides.sku || 'IPHONE15-001',
    price: overrides.price ?? 50000,
    compareAtPrice: overrides.compareAtPrice ?? 55000,
    currency: overrides.currency || 'INR',
    category: categoryId,
    stock: overrides.stock ?? 10,
    images: overrides.images || ['https://example.com/iphone.jpg'],
    averageRating: overrides.averageRating ?? 0,
    reviewCount: overrides.reviewCount ?? 0,
    isActive: overrides.isActive ?? true,
    createdBy: overrides.createdBy || null,
  });
};

const createCouponFactory = async (overrides = {}) => {
  return Coupon.create({
    code: overrides.code || 'SAVE10',
    description: overrides.description || 'Ten percent discount',
    discountType: overrides.discountType || 'percentage',
    discountValue: overrides.discountValue ?? 10,
    minOrderValue: overrides.minOrderValue ?? 1000,
    maxDiscount: overrides.maxDiscount ?? 500,
    usageLimit: overrides.usageLimit ?? null,
    usageCount: overrides.usageCount ?? 0,
    perUserLimit: overrides.perUserLimit ?? null,
    expiryDate:
      overrides.expiryDate ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: overrides.isActive ?? true,
  });
};

export {
  createUserFactory,
  createCategoryFactory,
  createProductFactory,
  createCouponFactory,
};