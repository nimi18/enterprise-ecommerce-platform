import mongoose from 'mongoose';

const paymentLogSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      default: 'stripe',
    },

    eventId: {
      type: String,
      required: true,
      trim: true,
    },

    eventType: {
      type: String,
      required: true,
      trim: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },

    paymentReference: {
      type: String,
      default: null,
      trim: true,
    },

    status: {
      type: String,
      enum: ['success', 'failure'],
      required: true,
    },

    payloadSummary: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    error: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

paymentLogSchema.index({ eventId: 1 }, { unique: true });
paymentLogSchema.index({ eventType: 1 });
paymentLogSchema.index({ orderId: 1 });
paymentLogSchema.index({ paymentReference: 1 });
paymentLogSchema.index({ createdAt: -1 });

const PaymentLog = mongoose.model('PaymentLog', paymentLogSchema);

export default PaymentLog;