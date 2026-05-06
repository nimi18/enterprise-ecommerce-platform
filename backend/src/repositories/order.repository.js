import Order from '../models/order.model.js';

const createOrder = async (payload) => {
  return Order.create(payload);
};

const findOrderById = async (orderId) => {
  return Order.findById(orderId).lean();
};

const findOrderByIdForUpdate = async (orderId) => {
  return Order.findById(orderId);
};

const updateOrderById = async (orderId, payload) => {
  return Order.findByIdAndUpdate(orderId, payload, {
    new: true,
    runValidators: true,
  }).lean();
};

const findOrdersByUser = async (userId) => {
  return Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
};

const findCustomerOrders = async ({ filter, sort, skip, limit }) => {
  return Order.find(filter).sort(sort).skip(skip).limit(limit).lean();
};

const countCustomerOrders = async (filter) => {
  return Order.countDocuments(filter);
};

const findAllOrders = async () => {
  return Order.find({}).sort({ createdAt: -1 }).lean();
};

const findAdminOrders = async ({ filter, sort, skip, limit }) => {
  return Order.find(filter).sort(sort).skip(skip).limit(limit).lean();
};

const countAdminOrders = async (filter) => {
  return Order.countDocuments(filter);
};

const findPendingOrdersOlderThan = async (date) => {
  return Order.find({
    paymentStatus: 'pending',
    orderStatus: 'pending',
    createdAt: { $lte: date },
  })
    .sort({ createdAt: 1 })
    .lean();
};

const expirePendingOrdersOlderThan = async (date) => {
  return Order.updateMany(
    {
      paymentStatus: 'pending',
      orderStatus: 'pending',
      createdAt: { $lte: date },
    },
    {
      paymentStatus: 'failed',
      orderStatus: 'failed',
    }
  );
};

export {
  createOrder,
  findOrderById,
  findOrderByIdForUpdate,
  updateOrderById,
  findOrdersByUser,
  findCustomerOrders,
  countCustomerOrders,
  findAllOrders,
  findAdminOrders,
  countAdminOrders,
  findPendingOrdersOlderThan,
  expirePendingOrdersOlderThan,
};