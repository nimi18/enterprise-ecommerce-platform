import Joi from 'joi';

const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().max(500).allow('').optional(),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  description: Joi.string().trim().max(500).allow('').optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

export { createCategorySchema, updateCategorySchema };