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

const listFeaturedProducts = async (limit = 8) => {
  return Product.find({
    isActive: true,
    isFeatured: true,
  })
    .populate('category', 'name slug isActive')
    .sort({ createdAt: -1 })
    .limit(limit);
};

const listRecommendedProducts = async ({ categoryId, excludeProductId, limit = 8 }) => {
  const filter = {
    isActive: true,
  };

  if (categoryId) {
    filter.category = categoryId;
  }

  if (excludeProductId) {
    filter._id = { $ne: excludeProductId };
  }

  return Product.find(filter)
    .populate('category', 'name slug isActive')
    .sort({ averageRating: -1, createdAt: -1 })
    .limit(limit);
};

export {
  createProduct,
  findProductById,
  findProductBySlug,
  findProductBySku,
  updateProductById,
  listProducts,
  countProducts,
  listFeaturedProducts,
  listRecommendedProducts,
};