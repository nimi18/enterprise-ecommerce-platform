import mongoose from 'mongoose';
import Review from '../models/review.model.js';

const userPopulateOptions = {
  path: 'user',
  select: 'name',
};

const createReview = async (payload) => {
  return Review.create(payload);
};

const findReviewById = async (reviewId) => {
  return Review.findById(reviewId).populate(userPopulateOptions).lean();
};

const findReviewByUserAndProduct = async (userId, productId) => {
  return Review.findOne({ user: userId, product: productId }).lean();
};

const findReviewByUserAndId = async (userId, reviewId) => {
  return Review.findOne({ _id: reviewId, user: userId }).lean();
};

const listReviewsByProduct = async (productId) => {
  return Review.find({
    product: productId,
    isActive: true,
  })
    .populate(userPopulateOptions)
    .sort({ createdAt: -1 })
    .lean();
};

const updateReviewById = async (reviewId, payload) => {
  return Review.findByIdAndUpdate(reviewId, payload, {
    new: true,
    runValidators: true,
  })
    .populate(userPopulateOptions)
    .lean();
};

const countActiveReviewsByProduct = async (productId) => {
  return Review.countDocuments({
    product: productId,
    isActive: true,
  });
};

const getAverageRatingByProduct = async (productId) => {
  const normalizedProductId =
    typeof productId === 'string'
      ? new mongoose.Types.ObjectId(productId)
      : productId;

  const result = await Review.aggregate([
    {
      $match: {
        product: normalizedProductId,
        isActive: true,
      },
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  return result[0]?.averageRating || 0;
};

const findMyReviews = async ({ filter, sort, skip, limit }) => {
  return Review.find(filter)
    .populate(userPopulateOptions)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();
};

const countMyReviews = async (filter) => {
  return Review.countDocuments(filter);
};

export {
  createReview,
  findReviewById,
  findReviewByUserAndProduct,
  findReviewByUserAndId,
  listReviewsByProduct,
  updateReviewById,
  countActiveReviewsByProduct,
  getAverageRatingByProduct,
  findMyReviews,
  countMyReviews,
};