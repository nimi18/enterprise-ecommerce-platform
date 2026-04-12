import Joi from 'joi';

const createAddressSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required(),
  phone: Joi.string().trim().pattern(/^[0-9]{10}$/).required(),
  addressLine1: Joi.string().trim().max(200).required(),
  addressLine2: Joi.string().trim().max(200).allow('').optional(),
  city: Joi.string().trim().max(100).required(),
  state: Joi.string().trim().max(100).required(),
  postalCode: Joi.string().trim().pattern(/^[0-9]{5,10}$/).required(),
  country: Joi.string().trim().max(100).required(),
  landmark: Joi.string().trim().max(200).allow('').optional(),
  addressType: Joi.string().valid('home', 'work', 'other').default('home'),
  isDefault: Joi.boolean().optional(),
});

const updateAddressSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).optional(),
  phone: Joi.string().trim().pattern(/^[0-9]{10}$/).optional(),
  addressLine1: Joi.string().trim().max(200).optional(),
  addressLine2: Joi.string().trim().max(200).allow('').optional(),
  city: Joi.string().trim().max(100).optional(),
  state: Joi.string().trim().max(100).optional(),
  postalCode: Joi.string().trim().pattern(/^[0-9]{5,10}$/).optional(),
  country: Joi.string().trim().max(100).optional(),
  landmark: Joi.string().trim().max(200).allow('').optional(),
  addressType: Joi.string().valid('home', 'work', 'other').optional(),
  isDefault: Joi.boolean().optional(),
}).min(1);

export { createAddressSchema, updateAddressSchema };