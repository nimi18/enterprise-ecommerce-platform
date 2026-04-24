import Joi from 'joi';

const createProductSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).required(),
  description: Joi.string().trim().required(),
  shortDescription: Joi.string().trim().max(300).allow('').optional(),
  sku: Joi.string().trim().uppercase().required(),
  price: Joi.number().min(0).required(),
  compareAtPrice: Joi.number().min(0).allow(null).optional(),
  currency: Joi.string().trim().default('INR'),
  category: Joi.string().trim().required(),
  stock: Joi.number().integer().min(0).required(),
  images: Joi.array().items(Joi.string().trim()).default([]),
  isFeatured: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
});

const updateProductSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).optional(),
  description: Joi.string().trim().optional(),
  shortDescription: Joi.string().trim().max(300).allow('').optional(),
  sku: Joi.string().trim().uppercase().optional(),
  price: Joi.number().min(0).optional(),
  compareAtPrice: Joi.number().min(0).allow(null).optional(),
  currency: Joi.string().trim().optional(),
  category: Joi.string().trim().optional(),
  stock: Joi.number().integer().min(0).optional(),
  images: Joi.array().items(Joi.string().trim()).optional(),
  isFeatured: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

const listProductsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow('').optional(),
  category: Joi.string().trim().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  minRating: Joi.number().min(0).max(5).optional(),
  isActive: Joi.boolean().optional(),
  sortBy: Joi.string()
    .valid('createdAt', 'price', 'title', 'averageRating')
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

export {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
};