import Joi from 'joi';

const createReviewSchema = Joi.object({
  productId: Joi.string().trim().required(),
  rating: Joi.number().min(1).max(5).required(),
  title: Joi.string().trim().max(150).allow('').optional(),
  comment: Joi.string().trim().min(3).max(2000).required(),
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).optional(),
  title: Joi.string().trim().max(150).allow('').optional(),
  comment: Joi.string().trim().min(3).max(2000).optional(),
}).min(1);

export { createReviewSchema, updateReviewSchema };