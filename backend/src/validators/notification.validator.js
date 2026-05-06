import Joi from 'joi';

const listNotificationLogsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  orderId: Joi.string().trim().optional(),
  userId: Joi.string().trim().optional(),
  status: Joi.string().valid('queued', 'sent', 'failed').optional(),
  type: Joi.string().trim().optional(),
  channel: Joi.string().valid('email', 'system').optional(),
  sortBy: Joi.string().valid('createdAt', 'status', 'type').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

export { listNotificationLogsQuerySchema };