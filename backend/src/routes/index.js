import express from 'express';
import addressRoutes from './address.routes.js';
import authRoutes from './auth.routes.js';
import cartRoutes from './cart.routes.js';
import categoryRoutes from './category.routes.js';
import checkoutRoutes from './checkout.routes.js';
import healthRoutes from './health.routes.js';
import productRoutes from './product.routes.js';
import wishlistRoutes from './wishlist.routes.js';

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/cart', cartRoutes);
router.use('/addresses', addressRoutes);
router.use('/checkout', checkoutRoutes);

export default router;