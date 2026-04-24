import mongoose from 'mongoose';
import ERROR_CODES from '../constants/errorCodes.js';
import { findCategoryById } from '../repositories/category.repository.js';
import {
  countProducts,
  createProduct,
  findProductById,
  findProductBySku,
  findProductBySlug,
  listFeaturedProducts,
  listProducts as listProductsRepository,
  listRecommendedProducts,
  updateProductById,
} from '../repositories/product.repository.js';
import AppError from '../utils/appError.js';
import generateSlug from '../utils/slug.js';

const buildProductResponse = (product) => {
  const category =
    product.category &&
    typeof product.category === 'object' &&
    product.category._id
      ? {
          _id: product.category._id,
          name: product.category.name,
          slug: product.category.slug,
          isActive: product.category.isActive,
        }
      : product.category || null;

  return {
    _id: product._id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    sku: product.sku,
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? null,
    currency: product.currency,
    category,
    stock: product.stock,
    images: product.images || [],
    averageRating: product.averageRating,
    reviewCount: product.reviewCount,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    createdBy: product.createdBy ?? null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

const createProductService = async (payload, currentUser) => {
  const slug = generateSlug(payload.title);

  const existingBySlug = await findProductBySlug(slug);
  if (existingBySlug) {
    throw new AppError('Product slug already exists', 409, ERROR_CODES.CONFLICT);
  }

  const existingBySku = await findProductBySku(payload.sku);
  if (existingBySku) {
    throw new AppError('SKU already exists', 409, ERROR_CODES.CONFLICT);
  }

  const category = await findCategoryById(payload.category);
  if (!category) {
    throw new AppError('Category not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const product = await createProduct({
    ...payload,
    slug,
    createdBy: currentUser.userId,
  });

  const populatedProduct = await findProductById(product._id);

  return buildProductResponse(populatedProduct);
};

const listProductsService = async (query) => {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  const search = query.search || '';
  const category = query.category;
  const minPrice = typeof query.minPrice !== 'undefined' ? Number(query.minPrice) : null;
  const maxPrice = typeof query.maxPrice !== 'undefined' ? Number(query.maxPrice) : null;
  const minRating = typeof query.minRating !== 'undefined' ? Number(query.minRating) : null;
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder || 'desc';

  const filter = {};

  if (typeof query.isActive === 'boolean') {
    filter.isActive = query.isActive;
  }

  if (category) {
    if (!mongoose.Types.ObjectId.isValid(category)) {
      throw new AppError('Invalid category id', 400, ERROR_CODES.BAD_REQUEST);
    }

    filter.category = category;
  }

  if (search) {
    filter.$text = { $search: search };
  }

  if (minPrice !== null || maxPrice !== null) {
    filter.price = {};

    if (minPrice !== null) {
      filter.price.$gte = minPrice;
    }

    if (maxPrice !== null) {
      filter.price.$lte = maxPrice;
    }
  }

  if (minRating !== null) {
    filter.averageRating = { $gte: minRating };
  }

  const skip = (page - 1) * limit;
  const sort = {
    [sortBy]: sortOrder === 'asc' ? 1 : -1,
  };

  const [products, total] = await Promise.all([
    listProductsRepository({ filter, sort, skip, limit }),
    countProducts(filter),
  ]);

  return {
    items: products.map(buildProductResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getProductByIdService = async (productId) => {
  const product = await findProductById(productId);

  if (!product) {
    throw new AppError('Product not found', 404, ERROR_CODES.NOT_FOUND);
  }

  return buildProductResponse(product);
};

const updateProductService = async (productId, payload) => {
  const existingProduct = await findProductById(productId);

  if (!existingProduct) {
    throw new AppError('Product not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const updatePayload = { ...payload };

  if (payload.title) {
    const slug = generateSlug(payload.title);
    const existingBySlug = await findProductBySlug(slug);

    if (existingBySlug && existingBySlug._id.toString() !== productId) {
      throw new AppError('Product slug already exists', 409, ERROR_CODES.CONFLICT);
    }

    updatePayload.slug = slug;
  }

  if (payload.sku) {
    const existingBySku = await findProductBySku(payload.sku);

    if (existingBySku && existingBySku._id.toString() !== productId) {
      throw new AppError('SKU already exists', 409, ERROR_CODES.CONFLICT);
    }
  }

  if (payload.category) {
    const category = await findCategoryById(payload.category);

    if (!category) {
      throw new AppError('Category not found', 404, ERROR_CODES.NOT_FOUND);
    }
  }

  const updatedProduct = await updateProductById(productId, updatePayload);

  return buildProductResponse(updatedProduct);
};

const deactivateProductService = async (productId) => {
  const existingProduct = await findProductById(productId);

  if (!existingProduct) {
    throw new AppError('Product not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const updatedProduct = await updateProductById(productId, { isActive: false });

  return buildProductResponse(updatedProduct);
};

const getFeaturedProductsService = async () => {
  const products = await listFeaturedProducts(8);
  return products.map(buildProductResponse);
};

const getRecommendedProductsService = async (productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError('Invalid product id', 400, ERROR_CODES.BAD_REQUEST);
  }

  const product = await findProductById(productId);

  if (!product) {
    throw new AppError('Product not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const products = await listRecommendedProducts({
    categoryId: product.category?._id || product.category,
    excludeProductId: productId,
    limit: 8,
  });

  return products.map(buildProductResponse);
};

export {
  createProductService,
  listProductsService,
  getProductByIdService,
  updateProductService,
  deactivateProductService,
  getFeaturedProductsService,
  getRecommendedProductsService,
};