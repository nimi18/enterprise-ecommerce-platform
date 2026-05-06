import Joi from 'joi';

const createReviewSchema = Joi.object({
  productId: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  title: Joi.string().trim().min(2).max(120).required(),
  comment: Joi.string().trim().min(5).max(2000).required(),
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).optional(),
  title: Joi.string().trim().min(2).max(120).optional(),
  comment: Joi.string().trim().min(5).max(2000).optional(),
}).min(1);

const myReviewsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  rating: Joi.number().min(1).max(5).optional(),
  search: Joi.string().trim().allow('').optional(),
  sortBy: Joi.string().valid('createdAt', 'rating').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

export {
  createReviewSchema,
  updateReviewSchema,
  myReviewsQuerySchema,
};