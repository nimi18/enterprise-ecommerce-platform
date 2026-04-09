import Product from '../models/product.model.js';

const createProduct = async (payload) => {
  return Product.create(payload);
};

const findProductById = async (productId) => {
  return Product.findById(productId).populate('category', 'name slug isActive');
};

const findProductBySlug = async (slug) => {
  return Product.findOne({ slug }).populate('category', 'name slug isActive');
};

const findProductBySku = async (sku) => {
  return Product.findOne({ sku });
};

const findProductByTitle = async (title) => {
  return Product.findOne({ title });
};

const updateProductById = async (productId, payload) => {
  return Product.findByIdAndUpdate(productId, payload, {
    new: true,
    runValidators: true,
  }).populate('category', 'name slug isActive');
};

const listProducts = async ({ filter, sort, skip, limit }) => {
  return Product.find(filter)
    .populate('category', 'name slug isActive')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

const countProducts = async (filter) => {
  return Product.countDocuments(filter);
};

export {
  createProduct,
  findProductById,
  findProductBySlug,
  findProductBySku,
  findProductByTitle,
  updateProductById,
  listProducts,
  countProducts,
};