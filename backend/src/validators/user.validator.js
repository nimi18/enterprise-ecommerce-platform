import Joi from 'joi';

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).optional(),
  phone: Joi.string().trim().max(20).allow('', null).optional(),
}).min(1);

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

export { updateProfileSchema, changePasswordSchema };