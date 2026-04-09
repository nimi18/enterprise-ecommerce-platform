import mongoose from 'mongoose';

const notificationLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },

    type: {
      type: String,
      required: true,
      trim: true,
    },

    channel: {
      type: String,
      default: 'email',
    },

    templateName: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ['queued', 'sent', 'failed'],
      default: 'queued',
    },
  },
  { timestamps: true }
);

notificationLogSchema.index({ user: 1 });
notificationLogSchema.index({ order: 1 });
notificationLogSchema.index({ status: 1 });

const NotificationLog = mongoose.model('NotificationLog', notificationLogSchema);

export default NotificationLog;