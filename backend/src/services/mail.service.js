import nodemailer from 'nodemailer';
import env from '../config/env.js';
import emailQueue from '../queues/email.queue.js';

const isTestEnvironment = env.nodeEnv === 'test';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.emailUser,
    pass: env.emailPass,
  },
});

const sendMailDirect = async ({ to, subject, text }) => {
  if (isTestEnvironment) {
    return {
      skipped: true,
      reason: 'Email sending skipped in test environment',
      to,
      subject,
    };
  }

  if (!env.emailUser || !env.emailPass) {
    throw new Error(
      'Email credentials are missing. Check EMAIL_USER and EMAIL_PASS in backend/.env'
    );
  }

  return transporter.sendMail({
    from: env.emailUser,
    to,
    subject,
    text,
  });
};

const queueMail = async ({ name, to, subject, text }) => {
  if (isTestEnvironment) {
    return {
      skipped: true,
      reason: 'Email queue skipped in test environment',
      name,
      to,
      subject,
    };
  }

  return emailQueue.add(
    name,
    {
      to,
      subject,
      text,
    },
    {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
};

const queueOrderSuccessEmail = async ({ to, orderNumber }) => {
  return queueMail({
    name: 'order-success',
    to,
    subject: 'Order Placed Successfully',
    text: `Your order ${orderNumber} has been placed successfully.`,
  });
};

const queuePaymentFailureEmail = async ({ to, orderNumber }) => {
  return queueMail({
    name: 'payment-failure',
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