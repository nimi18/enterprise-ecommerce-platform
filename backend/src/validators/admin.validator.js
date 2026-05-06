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

const adminCancelOrderSchema = Joi.object({
  reason: Joi.string().trim().max(500).allow('', null).optional(),
});

const adminOrderListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),

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

  userId: Joi.string().trim().optional(),
  search: Joi.string().trim().allow('').optional(),

  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),

  sortBy: Joi.string()
    .valid('createdAt', 'total', 'orderStatus', 'paymentStatus')
    .default('createdAt'),

  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

export {
  updateOrderStatusSchema,
  adminCancelOrderSchema,
  adminOrderListQuerySchema,
};