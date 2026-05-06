import Joi from 'joi';

const cancelOrderSchema = Joi.object({
  reason: Joi.string().trim().max(500).allow('', null).optional(),
});

const customerOrderListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),

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
    .optional(),

  paymentStatus: Joi.string()
    .valid('pending', 'paid', 'failed', 'refunded')
    .optional(),

  search: Joi.string().trim().allow('').optional(),

  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),

  sortBy: Joi.string()
    .valid('createdAt', 'total', 'orderStatus', 'paymentStatus')
    .default('createdAt'),

  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

export { cancelOrderSchema, customerOrderListQuerySchema };