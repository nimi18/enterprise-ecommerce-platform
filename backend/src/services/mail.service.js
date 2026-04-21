import nodemailer from 'nodemailer';
import env from '../config/env.js';
import emailQueue from '../queues/email.queue.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.emailUser,
    pass: env.emailPass,
  },
});

const sendMailDirect = async ({ to, subject, text }) => {
  if (!env.emailUser || !env.emailPass) {
    throw new Error('Email credentials are missing. Check EMAIL_USER and EMAIL_PASS in backend/.env');
  }

  return transporter.sendMail({
    from: env.emailUser,
    to,
    subject,
    text,
  });
};

const queueOrderSuccessEmail = async ({ to, orderNumber }) => {
  await emailQueue.add('order-success', {
    to,
    subject: 'Order Placed Successfully',
    text: `Your order ${orderNumber} has been placed successfully.`,
  });
};

const queuePaymentFailureEmail = async ({ to, orderNumber }) => {
  await emailQueue.add('payment-failure', {
    to,
    subject: 'Payment Failed',
    text: `Your payment for order ${orderNumber} was not completed successfully.`,
  });
};

export {
  sendMailDirect,
  queueOrderSuccessEmail,
  queuePaymentFailureEmail,
};