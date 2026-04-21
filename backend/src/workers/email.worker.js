import env from '../config/env.js';
import { Worker } from 'bullmq';
import redis from '../config/redis.js';
import { sendMailDirect } from '../services/mail.service.js';

console.log('Email worker starting...');
console.log('EMAIL_USER loaded:', Boolean(env.emailUser));
console.log('EMAIL_PASS loaded:', Boolean(env.emailPass));

const emailWorker = new Worker(
  'emailQueue',
  async (job) => {
    const { to, subject, text } = job.data;

    await sendMailDirect({
      to,
      subject,
      text,
    });
  },
  {
    connection: redis,
  }
);

emailWorker.on('completed', (job) => {
  console.log(`Email job completed: ${job.id}`);
});

emailWorker.on('failed', (job, err) => {
  console.log(`Email job failed: ${job?.id}`, err.message);
});

export default emailWorker;