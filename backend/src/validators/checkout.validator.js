import Joi from 'joi';

const checkoutSchema = Joi.object({
  addressId: Joi.string().required(),
  shippingMethod: Joi.string().valid('standard', 'express').required(),
});

export { checkoutSchema };