import Joi from 'joi';

const addToCartSchema = Joi.object({
  productId: Joi.string().trim().required(),
  quantity: Joi.number().integer().min(1).required(),
});

const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
});

export { addToCartSchema, updateCartItemSchema };