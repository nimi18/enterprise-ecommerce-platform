import Review from '../models/review.model.js';

const createReview = async (payload) => {
  return Review.create(payload);
};

const findReviewById = async (reviewId) => {
  return Review.findById(reviewId).populate('user', 'name');
};

const findReviewByUserAndProduct = async (userId, productId) => {
  return Review.findOne({ user: userId, product: productId });
};

const findReviewByUserAndId = async (userId, reviewId) => {
  return Review.findOne({ _id: reviewId, user: userId });
};

const listReviewsByProduct = async (productId) => {
  return Review.find({
    product: productId,
    isActive: true,
  })
    .populate('user', 'name')
    .sort({ createdAt: -1 });
};

const updateReviewById = async (reviewId, payload) => {
  return Review.findByIdAndUpdate(reviewId, payload, {
    new: true,
    runValidators: true,
  }).populate('user', 'name');
};

const countActiveReviewsByProduct = async (productId) => {
  return Review.countDocuments({
    product: productId,
    isActive: true,
  });
};

const getAverageRatingByProduct = async (productId) => {
  const result = await Review.aggregate([
    {
      $match: {
        product: Review.db.base.Types.ObjectId.createFromHexString(productId.toString()),
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

export {
  createReview,
  findReviewById,
  findReviewByUserAndProduct,
  findReviewByUserAndId,
  listReviewsByProduct,
  updateReviewById,
  countActiveReviewsByProduct,
  getAverageRatingByProduct,
};