import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import env from '../config/env.js';
import logger from '../config/logger.js';

import User from '../models/user.model.js';
import Category from '../models/category.model.js';
import Product from '../models/product.model.js';
import Coupon from '../models/coupon.model.js';
import Address from '../models/address.model.js';
import Cart from '../models/cart.model.js';
import Wishlist from '../models/wishlist.model.js';
import Order from '../models/order.model.js';
import Review from '../models/review.model.js';
import PaymentLog from '../models/paymentLog.model.js';
import NotificationLog from '../models/notificationLog.model.js';

import { hashPassword } from '../utils/password.js';

const IMAGE_BASE = 'https://placehold.co/800x800/png';

const buildImageSet = (label) => {
  const encoded = encodeURIComponent(label);

  return [
    `${IMAGE_BASE}?text=${encoded}+Front`,
    `${IMAGE_BASE}?text=${encoded}+Side`,
    `${IMAGE_BASE}?text=${encoded}+Back`,
  ];
};

const usersData = async () => {
  const adminPassword = await hashPassword('password123');
  const customerPassword = await hashPassword('password123');

  return [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      isActive: true,
    },
    {
      name: 'Customer User',
      email: 'customer@example.com',
      password: customerPassword,
      role: 'customer',
      isActive: true,
    },
  ];
};

const categoriesData = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Smartphones, laptops, audio devices and accessories.',
    isActive: true,
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Apparel, shoes and wearable accessories.',
    isActive: true,
  },
  {
    name: 'Home Decor',
    slug: 'home-decor',
    description: 'Furniture accents, decor items and home essentials.',
    isActive: true,
  },
];

const couponsData = [
  {
    code: 'WELCOME10',
    description: '10 percent off for new customers.',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 1000,
    maxDiscount: 1500,
    usageLimit: 500,
    usageCount: 0,
    perUserLimit: 1,
    expiryDate: new Date('2027-12-31T23:59:59.000Z'),
    isActive: true,
  },
  {
    code: 'FLAT500',
    description: 'Flat 500 off on larger carts.',
    discountType: 'flat',
    discountValue: 500,
    minOrderValue: 5000,
    maxDiscount: null,
    usageLimit: 1000,
    usageCount: 0,
    perUserLimit: 3,
    expiryDate: new Date('2027-12-31T23:59:59.000Z'),
    isActive: true,
  },
];

const buildProductsData = ({ adminId, categoryMap }) => [
  {
    title: 'iPhone 15',
    slug: 'iphone-15',
    description:
      'Latest Apple smartphone with premium build quality, smooth performance and excellent camera output.',
    shortDescription: 'Premium Apple smartphone',
    sku: 'IPHONE15-001',
    price: 75000,
    compareAtPrice: 79999,
    currency: 'INR',
    category: categoryMap.Electronics,
    stock: 25,
    images: buildImageSet('iPhone 15'),
    averageRating: 4.6,
    reviewCount: 1,
    isFeatured: true,
    isActive: true,
    createdBy: adminId,
  },
  {
    title: 'Samsung Galaxy S24',
    slug: 'samsung-galaxy-s24',
    description:
      'Flagship Samsung smartphone with AMOLED display, strong battery life and powerful camera features.',
    shortDescription: 'Flagship Android smartphone',
    sku: 'SAMS24-001',
    price: 68999,
    compareAtPrice: 72999,
    currency: 'INR',
    category: categoryMap.Electronics,
    stock: 20,
    images: buildImageSet('Samsung Galaxy S24'),
    averageRating: 4.5,
    reviewCount: 1,
    isFeatured: true,
    isActive: true,
    createdBy: adminId,
  },
  {
    title: 'Sony WH-1000XM5',
    slug: 'sony-wh-1000xm5',
    description:
      'Wireless noise-cancelling headphones designed for premium audio quality, comfort and long listening sessions.',
    shortDescription: 'Premium wireless headphones',
    sku: 'SONYXM5-001',
    price: 24999,
    compareAtPrice: 27999,
    currency: 'INR',
    category: categoryMap.Electronics,
    stock: 40,
    images: buildImageSet('Sony WH 1000XM5'),
    averageRating: 4.7,
    reviewCount: 1,
    isFeatured: true,
    isActive: true,
    createdBy: adminId,
  },
  {
    title: 'Nike Air Zoom Pegasus',
    slug: 'nike-air-zoom-pegasus',
    description:
      'Comfortable running shoes built for daily wear, training and lightweight performance.',
    shortDescription: 'Versatile running shoes',
    sku: 'NIKEPEG-001',
    price: 8999,
    compareAtPrice: 9999,
    currency: 'INR',
    category: categoryMap.Fashion,
    stock: 60,
    images: buildImageSet('Nike Air Zoom Pegasus'),
    averageRating: 4.4,
    reviewCount: 1,
    isFeatured: true,
    isActive: true,
    createdBy: adminId,
  },
  {
    title: 'Levis Slim Fit Jeans',
    slug: 'levis-slim-fit-jeans',
    description:
      'Classic slim fit jeans for everyday use with durable denim and versatile styling.',
    shortDescription: 'Classic everyday jeans',
    sku: 'LEVISJEAN-001',
    price: 2999,
    compareAtPrice: 3599,
    currency: 'INR',
    category: categoryMap.Fashion,
    stock: 85,
    images: buildImageSet('Levis Slim Fit Jeans'),
    averageRating: 4.2,
    reviewCount: 0,
    isFeatured: false,
    isActive: true,
    createdBy: adminId,
  },
  {
    title: 'Minimal Ceramic Vase',
    slug: 'minimal-ceramic-vase',
    description:
      'Modern ceramic vase designed for clean interiors and elegant table or shelf styling.',
    shortDescription: 'Modern decor vase',
    sku: 'VASE-001',
    price: 1499,
    compareAtPrice: 1899,
    currency: 'INR',
    category: categoryMap['Home Decor'],
    stock: 35,
    images: buildImageSet('Minimal Ceramic Vase'),
    averageRating: 4.3,
    reviewCount: 0,
    isFeatured: false,
    isActive: true,
    createdBy: adminId,
  },
  {
    title: 'Wooden Coffee Table',
    slug: 'wooden-coffee-table',
    description:
      'Solid wood coffee table with minimalist styling suitable for modern living rooms.',
    shortDescription: 'Solid wood table',
    sku: 'TABLE-001',
    price: 11999,
    compareAtPrice: 13999,
    currency: 'INR',
    category: categoryMap['Home Decor'],
    stock: 12,
    images: buildImageSet('Wooden Coffee Table'),
    averageRating: 4.5,
    reviewCount: 1,
    isFeatured: true,
    isActive: true,
    createdBy: adminId,
  },
  {
    title: 'Accent Floor Lamp',
    slug: 'accent-floor-lamp',
    description:
      'Decorative floor lamp for warm ambient lighting and premium room aesthetics.',
    shortDescription: 'Ambient decor lamp',
    sku: 'LAMP-001',
    price: 4999,
    compareAtPrice: 5799,
    currency: 'INR',
    category: categoryMap['Home Decor'],
    stock: 22,
    images: buildImageSet('Accent Floor Lamp'),
    averageRating: 4.1,
    reviewCount: 0,
    isFeatured: false,
    isActive: true,
    createdBy: adminId,
  },
];

const customerAddressesData = (customerId) => [
  {
    user: customerId,
    fullName: 'Customer User',
    phone: '9999999999',
    addressLine1: '123 Demo Street',
    addressLine2: 'Near Metro Station',
    city: 'Delhi',
    state: 'Delhi',
    postalCode: '110001',
    country: 'India',
    landmark: 'City Mall',
    addressType: 'home',
    isDefault: true,
  },
  {
    user: customerId,
    fullName: 'Customer User',
    phone: '9999999998',
    addressLine1: '45 Office Road',
    addressLine2: 'Business Park',
    city: 'Gurgaon',
    state: 'Haryana',
    postalCode: '122001',
    country: 'India',
    landmark: 'Cyber Hub',
    addressType: 'work',
    isDefault: false,
  },
];

const buildCompletedOrderData = ({ customerId, address, product }) => {
  const quantity = 1;
  const lineTotal = product.price * quantity;
  const shippingCharge = 50;

  return {
    orderNumber: `ORD-SEED-${Date.now()}`,
    user: customerId,
    items: [
      {
        product: product._id,
        titleSnapshot: product.title,
        skuSnapshot: product.sku,
        imageSnapshot: product.images?.[0] || '',
        quantity,
        unitPrice: product.price,
        lineTotal,
      },
    ],
    addressSnapshot: {
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      landmark: address.landmark,
      addressType: address.addressType,
    },
    couponSnapshot: null,
    subtotal: lineTotal,
    discount: 0,
    shippingCharge,
    total: lineTotal + shippingCharge,
    paymentProvider: 'stripe',
    paymentReference: 'seed_payment_reference',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    shippingMethod: 'standard',
    courierName: 'Blue Dart',
    trackingNumber: 'BD-SEED-123456',
    trackingUrl: 'https://tracking.example.com/BD-SEED-123456',
    shippedAt: new Date(),
    deliveredAt: new Date(),
    paidAt: new Date(),
  };
};

const reviewsData = ({ customerId, orderMap, productMap }) => [
  {
    user: customerId,
    product: productMap['iPhone 15']._id,
    order: orderMap['iPhone 15'],
    rating: 5,
    title: 'Excellent phone',
    comment: 'Smooth performance, premium feel and great camera quality.',
    isActive: true,
  },
  {
    user: customerId,
    product: productMap['Samsung Galaxy S24']._id,
    order: orderMap['Samsung Galaxy S24'],
    rating: 4,
    title: 'Strong Android flagship',
    comment: 'Great display and camera. Battery life is reliable for daily use.',
    isActive: true,
  },
  {
    user: customerId,
    product: productMap['Sony WH-1000XM5']._id,
    order: orderMap['Sony WH-1000XM5'],
    rating: 5,
    title: 'Amazing noise cancellation',
    comment: 'Very comfortable headphones with excellent sound quality.',
    isActive: true,
  },
  {
    user: customerId,
    product: productMap['Nike Air Zoom Pegasus']._id,
    order: orderMap['Nike Air Zoom Pegasus'],
    rating: 4,
    title: 'Comfortable shoes',
    comment: 'Good fit and comfortable for daily running and walking.',
    isActive: true,
  },
  {
    user: customerId,
    product: productMap['Wooden Coffee Table']._id,
    order: orderMap['Wooden Coffee Table'],
    rating: 5,
    title: 'Looks premium',
    comment: 'Good build quality and fits well in a modern living room.',
    isActive: true,
  },
];

const clearCollections = async () => {
  await NotificationLog.deleteMany({});
  await PaymentLog.deleteMany({});
  await Review.deleteMany({});
  await Order.deleteMany({});
  await Cart.deleteMany({});
  await Wishlist.deleteMany({});
  await Address.deleteMany({});
  await Coupon.deleteMany({});
  await Product.deleteMany({});
  await Category.deleteMany({});
  await User.deleteMany({});
};

const syncProductRatingSummary = async (productId) => {
  const result = await Review.aggregate([
    {
      $match: {
        product: productId,
        isActive: true,
      },
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const summary = result[0] || {
    averageRating: 0,
    reviewCount: 0,
  };

  await Product.findByIdAndUpdate(productId, {
    averageRating: Number(summary.averageRating.toFixed(1)),
    reviewCount: summary.reviewCount,
  });
};

const seed = async () => {
  try {
    if (!env.mongoUri) {
      throw new Error('MONGODB_URI is required to run seed script');
    }

    await connectDB();

    logger.info('Connected to MongoDB for seeding');

    await clearCollections();

    logger.info('Cleared existing seedable collections');

    const createdUsers = await User.insertMany(await usersData());
    const adminUser = createdUsers.find((user) => user.role === 'admin');
    const customerUser = createdUsers.find((user) => user.role === 'customer');

    const createdCategories = await Category.insertMany(categoriesData);

    const categoryMap = createdCategories.reduce((acc, category) => {
      acc[category.name] = category._id;
      return acc;
    }, {});

    const createdProducts = await Product.insertMany(
      buildProductsData({
        adminId: adminUser._id,
        categoryMap,
      })
    );

    const productMap = createdProducts.reduce((acc, product) => {
      acc[product.title] = product;
      return acc;
    }, {});

    await Coupon.insertMany(couponsData);

    const createdAddresses = await Address.insertMany(
      customerAddressesData(customerUser._id)
    );

    const defaultAddress = createdAddresses.find((address) => address.isDefault);

    const reviewedProductTitles = [
      'iPhone 15',
      'Samsung Galaxy S24',
      'Sony WH-1000XM5',
      'Nike Air Zoom Pegasus',
      'Wooden Coffee Table',
    ];

    const orderMap = {};

    for (const productTitle of reviewedProductTitles) {
      const product = productMap[productTitle];

      const order = await Order.create(
        buildCompletedOrderData({
          customerId: customerUser._id,
          address: defaultAddress,
          product,
        })
      );

      orderMap[productTitle] = order._id;
    }

    await Review.insertMany(
      reviewsData({
        customerId: customerUser._id,
        orderMap,
        productMap,
      })
    );

    await Promise.all(
      reviewedProductTitles.map((productTitle) =>
        syncProductRatingSummary(productMap[productTitle]._id)
      )
    );

    logger.info('Seed completed successfully');
    logger.info('Admin credentials: admin@example.com / password123');
    logger.info('Customer credentials: customer@example.com / password123');
    logger.info('Featured products and product reviews created successfully');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error(
      {
        err: {
          message: error.message,
          stack: error.stack,
        },
      },
      'Seed failed'
    );

    await mongoose.connection.close();
    process.exit(1);
  }
};

seed();