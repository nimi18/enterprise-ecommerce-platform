import PaymentLog from '../models/paymentLog.model.js';

const createPaymentLog = async (payload) => {
  return PaymentLog.create(payload);
};

const findPaymentLogByEventId = async (eventId) => {
  return PaymentLog.findOne({ eventId });
};

export { createPaymentLog, findPaymentLogByEventId };