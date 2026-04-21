import Order from '../models/order.model.js';

const createOrder = async (payload) => {
  return Order.create(payload);
};

const findOrderById = async (orderId) => {
  return Order.findById(orderId).sort({ createdAt: -1 });
};

const updateOrderById = async (orderId, payload) => {
  return Order.findByIdAndUpdate(orderId, payload, {
    new: true,
    runValidators: true,
  });
};

const findOrdersByUser = async (userId) => {
  return Order.find({ user: userId }).sort({ createdAt: -1 });
};

const findAllOrders = async () => {
  return Order.find({}).sort({ createdAt: -1 });
};

export {
  createOrder,
  findOrderById,
  updateOrderById,
  findOrdersByUser,
  findAllOrders,
};