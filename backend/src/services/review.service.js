import mongoose from 'mongoose';
import ERROR_CODES from '../constants/errorCodes.js';
import Product from '../models/product.model.js';
import {
  createReview,
  countActiveReviewsByProduct,
  findReviewByUserAndId,
  findReviewByUserAndProduct,
  getAverageRatingByProduct,
  listReviewsByProduct,
  updateReviewById,
} from '../repositories/review.repository.js';
import { findProductById } from '../repositories/product.repository.js';
import { findOrdersByUser } from '../repositories/order.repository.js';
import AppError from '../utils/appError.js';

const buildReviewResponse = (review) => {
  return {
    _id: review._id,
    user: review.user
      ? {
          _id: review.user._id,
          name: review.user.name,
        }
      : review.user,
    product: review.product,
    order: review.order,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    isActive: review.isActive,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
};

const userHasPurchasedProduct = async (userId, productId) => {
  const orders = await findOrdersByUser(userId);

  return orders.some((order) =>
    order.items.some((item) => item.product.toString() === productId)
  );
};

const findOrderIdForPurchasedProduct = async (userId, productId) => {
  const orders = await findOrdersByUser(userId);

  const matchedOrder = orders.find((order) =>
    order.items.some((item) => item.product.toString() === productId)
  );

  return matchedOrder?._id || null;
};

const syncProductRatingSummary = async (productId) => {
  const [reviewCount, averageRating] = await Promise.all([
    countActiveReviewsByProduct(productId),
    getAverageRatingByProduct(productId),
  ]);

  await Product.findByIdAndUpdate(productId, {
    reviewCount,
    averageRating: Number(averageRating.toFixed(1)),
  });
};

const createReviewService = async (userId, payload) => {
  const { productId, rating, title = '', comment } = payload;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError('Invalid product id', 400, ERROR_CODES.BAD_REQUEST);
  }

  const product = await findProductById(productId);

  if (!product || !product.isActive) {
    throw new AppError('Product not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const existingReview = await findReviewByUserAndProduct(userId, productId);

  if (existingReview) {
    throw new AppError('You have already reviewed this product', 409, ERROR_CODES.CONFLICT);
  }

  const hasPurchased = await userHasPurchasedProduct(userId, productId);

  if (!hasPurchased) {
    throw new AppError(
      'Only customers who purchased this product can review it',
      403,
      ERROR_CODES.FORBIDDEN
    );
  }

  const orderId = await findOrderIdForPurchasedProduct(userId, productId);

  const review = await createReview({
    user: userId,
    product: productId,
    order: orderId,
    rating,
    title,
    comment,
    isActive: true,
  });

  await syncProductRatingSummary(productId);

  return buildReviewResponse(review);
};

const listProductReviewsService = async (productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError('Invalid product id', 400, ERROR_CODES.BAD_REQUEST);
  }

  const product = await findProductById(productId);

  if (!product) {
    throw new AppError('Product not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const reviews = await listReviewsByProduct(productId);

  return reviews.map(buildReviewResponse);
};

const updateReviewService = async (userId, reviewId, payload) => {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new AppError('Invalid review id', 400, ERROR_CODES.BAD_REQUEST);
  }

  const review = await findReviewByUserAndId(userId, reviewId);

  if (!review || !review.isActive) {
    throw new AppError('Review not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const updatedReview = await updateReviewById(reviewId, payload);

  await syncProductRatingSummary(review.product);

  return buildReviewResponse(updatedReview);
};

const deleteReviewService = async (userId, reviewId) => {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new AppError('Invalid review id', 400, ERROR_CODES.BAD_REQUEST);
  }

  const review = await findReviewByUserAndId(userId, reviewId);

  if (!review || !review.isActive) {
    throw new AppError('Review not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const updatedReview = await updateReviewById(reviewId, {
    isActive: false,
  });

  await syncProductRatingSummary(review.product);

  return buildReviewResponse(updatedReview);
};

export {
  createReviewService,
  listProductReviewsService,
  updateReviewService,
  deleteReviewService,
};