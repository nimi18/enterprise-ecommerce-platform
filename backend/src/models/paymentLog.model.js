import mongoose from 'mongoose';

const paymentLogSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },

    provider: {
      type: String,
      required: true,
      default: 'stripe',
    },

    providerPaymentId: {
      type: String,
      trim: true,
      default: null,
    },

    eventType: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      required: true,
      trim: true,
    },

    payloadSummary: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

paymentLogSchema.index({ order: 1 });
paymentLogSchema.index({ providerPaymentId: 1 });
paymentLogSchema.index({ eventType: 1 });

const PaymentLog = mongoose.model('PaymentLog', paymentLogSchema);

export default PaymentLog;