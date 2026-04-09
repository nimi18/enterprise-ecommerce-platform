import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },

    titleSnapshot: {
      type: String,
      required: [true, 'Product title snapshot is required'],
      trim: true,
    },

    priceSnapshot: {
      type: Number,
      required: [true, 'Product price snapshot is required'],
      min: [0, 'Price snapshot cannot be negative'],
    },

    imageSnapshot: {
      type: String,
      trim: true,
      default: '',
    },

    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },

    lineTotal: {
      type: Number,
      required: [true, 'Line total is required'],
      min: [0, 'Line total cannot be negative'],
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
      required: [true, 'User is required'],
    },

    items: {
      type: [cartItemSchema],
      default: [],
      validate: {
        validator(items) {
          const productIds = items.map((item) => String(item.product));
          return new Set(productIds).size === productIds.length;
        },
        message: 'Duplicate products are not allowed in cart items',
      },
    },

    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },

    couponCodeSnapshot: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },

    subtotal: {
      type: Number,
      default: 0,
      min: [0, 'Subtotal cannot be negative'],
    },

    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },

    shippingCharge: {
      type: Number,
      default: 0,
      min: [0, 'Shipping charge cannot be negative'],
    },

    total: {
      type: Number,
      default: 0,
      min: [0, 'Total cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

cartSchema.index({ user: 1 }, { unique: true });
cartSchema.index({ 'items.product': 1 });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;