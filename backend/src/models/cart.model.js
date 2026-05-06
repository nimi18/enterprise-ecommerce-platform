import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    titleSnapshot: {
      type: String,
      required: true,
      trim: true,
    },

    priceSnapshot: {
      type: Number,
      required: true,
      min: 0,
    },

    imageSnapshot: {
      type: String,
      default: '',
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },

    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },

    couponCodeSnapshot: {
      type: String,
      default: '',
      trim: true,
      uppercase: true,
    },

    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    shippingCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastActivityAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

cartSchema.index({ user: 1 }, { unique: true });
cartSchema.index({ lastActivityAt: 1 });
cartSchema.index({ expiresAt: 1 });
cartSchema.index({ updatedAt: -1 });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;