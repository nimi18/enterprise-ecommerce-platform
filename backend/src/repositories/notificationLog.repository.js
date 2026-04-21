import NotificationLog from '../models/notificationLog.model.js';

const createNotificationLog = async (payload) => {
  return NotificationLog.create(payload);
};

const findNotificationLogsByOrder = async (orderId) => {
  return NotificationLog.find({ order: orderId }).sort({ createdAt: -1 });
};

export { createNotificationLog, findNotificationLogsByOrder };