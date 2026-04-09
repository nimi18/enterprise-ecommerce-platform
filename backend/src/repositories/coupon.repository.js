import Coupon from '../models/coupon.model.js';

const findCouponByCode = async (code) => {
  return Coupon.findOne({ code });
};

export { findCouponByCode };