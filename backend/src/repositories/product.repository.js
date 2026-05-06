import Product from '../models/product.model.js';

const productPopulateOptions = {
  path: 'category',
  select: 'name slug isActive',
};

const createProduct = async (payload) => {
  return Product.create(payload);
};

const findProductById = async (productId) => {
  return Product.findById(productId)
    .populate(productPopulateOptions)
    .lean();
};

const findProductDocumentById = async (productId) => {
  return Product.findById(productId);
};

const findProductBySlug = async (slug) => {
  return Product.findOne({ slug })
    .populate(productPopulateOptions)
    .lean();
};

const findProductBySku = async (sku) => {
  return Product.findOne({ sku }).lean();
};

const updateProductById = async (productId, payload) => {
  return Product.findByIdAndUpdate(productId, payload, {
    new: true,
    runValidators: true,
  })
    .populate(productPopulateOptions)
    .lean();
};

const decrementProductStock = async ({ productId, quantity }) => {
  return Product.findOneAndUpdate(
    {
      _id: productId,
      stock: { $gte: quantity },
    },
    {
      $inc: { stock: -quantity },
    },
    {
      new: true,
    }
  ).lean();
};

const incrementProductStock = async ({ productId, quantity }) => {
  return Product.findByIdAndUpdate(
    productId,
    {
      $inc: { stock: quantity },
    },
    {
      new: true,
    }
  ).lean();
};

const listProducts = async ({ filter, sort, skip, limit }) => {
  return Product.find(filter)
    .populate(productPopulateOptions)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();
};

const countProducts = async (filter) => {
  return Product.countDocuments(filter);
};

const listFeaturedProducts = async (limit = 8) => {
  return Product.find({
    isActive: true,
    isFeatured: true,
  })
    .populate(productPopulateOptions)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

const listRecommendedProducts = async ({
  categoryId,
  excludeProductId,
  limit = 8,
}) => {
  const filter = { isActive: true };

  if (categoryId) {
    filter.category = categoryId;
  }

  if (excludeProductId) {
    filter._id = { $ne: excludeProductId };
  }

  return Product.find(filter)
    .populate(productPopulateOptions)
    .sort({ averageRating: -1, createdAt: -1 })
    .limit(limit)
    .lean();
};

export {
  createProduct,
  findProductById,
  findProductDocumentById,
  findProductBySlug,
  findProductBySku,
  updateProductById,
  decrementProductStock,
  incrementProductStock,
  listProducts,
  countProducts,
  listFeaturedProducts,
  listRecommendedProducts,
};