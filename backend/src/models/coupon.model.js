import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      uppercase: true,
      trim: true,
      minlength: [3, 'Coupon code must be at least 3 characters'],
      maxlength: [50, 'Coupon code cannot exceed 50 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },

    discountType: {
      type: String,
      required: [true, 'Discount type is required'],
      enum: {
        values: ['flat', 'percentage'],
        message: 'Discount type must be either flat or percentage',
      },
    },

    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
    },

    minOrderValue: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order value cannot be negative'],
    },

    maxDiscount: {
      type: Number,
      min: [0, 'Max discount cannot be negative'],
      default: null,
    },

    usageLimit: {
      type: Number,
      min: [1, 'Usage limit must be at least 1'],
      default: null,
    },

    usageCount: {
      type: Number,
      default: 0,
      min: [0, 'Usage count cannot be negative'],
    },

    perUserLimit: {
      type: Number,
      min: [1, 'Per-user limit must be at least 1'],
      default: null,
    },

    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ expiryDate: 1 });
couponSchema.index({ isActive: 1 });

couponSchema.path('maxDiscount').validate(function (value) {
  if (value == null) {
    return true;
  }

  if (this.discountType === 'flat') {
    return false;
  }

  return true;
}, 'Max discount is only allowed for percentage coupons');

couponSchema.path('discountValue').validate(function (value) {
  if (this.discountType === 'percentage' && value > 100) {
    return false;
  }

  return true;
}, 'Percentage discount cannot exceed 100');

couponSchema.path('expiryDate').validate(function (value) {
  return value instanceof Date && !Number.isNaN(value.getTime());
}, 'Expiry date must be a valid date');

couponSchema.post('save', function (error, doc, next) {
  if (error?.code === 11000) {
    const duplicateField = Object.keys(error.keyPattern || {})[0];

    if (duplicateField === 'code') {
      return next(new Error('Coupon code already exists'));
    }

    return next(new Error('Duplicate coupon field'));
  }

  return next(error);
});

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;