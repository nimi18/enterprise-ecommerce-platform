import mongoose from 'mongoose';

const paymentLogSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ['stripe'],
      default: 'stripe',
      trim: true,
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

    paymentIntent: {
      type: String,
      default: null,
      trim: true,
    },

    charge: {
      type: String,
      default: null,
      trim: true,
    },

    customerEmail: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },

    amountTotal: {
      type: Number,
      default: null,
      min: 0,
    },

    currency: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },

    paymentStatus: {
      type: String,
      default: null,
      trim: true,
    },

    processingStatus: {
      type: String,
      enum: ['processed', 'failed', 'duplicate'],
      default: 'processed',
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
paymentLogSchema.index({ eventType: 1, createdAt: -1 });
paymentLogSchema.index({ orderId: 1, createdAt: -1 });
paymentLogSchema.index({ paymentReference: 1 });
paymentLogSchema.index({ paymentIntent: 1 });
paymentLogSchema.index({ charge: 1 });
paymentLogSchema.index({ customerEmail: 1, createdAt: -1 });
paymentLogSchema.index({ status: 1, createdAt: -1 });
paymentLogSchema.index({ processingStatus: 1, createdAt: -1 });
paymentLogSchema.index({ createdAt: -1 });

const PaymentLog = mongoose.model('PaymentLog', paymentLogSchema);

export default PaymentLog;