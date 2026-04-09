import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },

    shippingMethod: {
      type: String,
      enum: ['standard', 'express'],
      required: true,
    },

    provider: {
      type: String,
      required: true,
      trim: true,
    },

    trackingId: {
      type: String,
      trim: true,
      default: null,
    },

    shippingStatus: {
      type: String,
      enum: ['pending', 'packed', 'dispatched', 'in_transit', 'delivered', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

shipmentSchema.index({ order: 1 });
shipmentSchema.index({ trackingId: 1 });
shipmentSchema.index({ shippingStatus: 1 });

const Shipment = mongoose.model('Shipment', shipmentSchema);

export default Shipment;