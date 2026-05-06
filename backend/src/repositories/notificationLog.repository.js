import NotificationLog from '../models/notificationLog.model.js';

const createNotificationLog = async (payload) => {
  return NotificationLog.create(payload);
};

const findNotificationLogById = async (notificationLogId) => {
  return NotificationLog.findById(notificationLogId).lean();
};

const updateNotificationLogById = async (notificationLogId, payload) => {
  return NotificationLog.findByIdAndUpdate(notificationLogId, payload, {
    new: true,
    runValidators: true,
  }).lean();
};

const findNotificationLogsByOrder = async (orderId) => {
  return NotificationLog.find({ order: orderId }).sort({ createdAt: -1 }).lean();
};

const findNotificationLogs = async ({ filter, sort, skip, limit }) => {
  return NotificationLog.find(filter).sort(sort).skip(skip).limit(limit).lean();
};

const countNotificationLogs = async (filter) => {
  return NotificationLog.countDocuments(filter);
};

export {
  createNotificationLog,
  findNotificationLogById,
  updateNotificationLogById,
  findNotificationLogsByOrder,
  findNotificationLogs,
  countNotificationLogs,
};