import Joi from 'joi';

const updateOrderStatusSchema = Joi.object({
  orderStatus: Joi.string()
    .valid(
      'pending',
      'confirmed',
      'processing',
      'packed',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'failed',
      'returned'
    )
    .required(),

  courierName: Joi.string().trim().allow('', null).optional(),
  trackingNumber: Joi.string().trim().allow('', null).optional(),
  trackingUrl: Joi.string().trim().uri().allow('', null).optional(),
});

export { updateOrderStatusSchema };