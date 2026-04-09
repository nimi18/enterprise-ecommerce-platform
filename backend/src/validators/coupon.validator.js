import Joi from 'joi';

const applyCouponSchema = Joi.object({
  code: Joi.string().trim().uppercase().required(),
});

export { applyCouponSchema };