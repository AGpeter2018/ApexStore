import express from 'express'
import cors from 'cors'
import categoryRouter from './routes/product-category-route.js';
import productRouter from './routes/product.routes.js';
import adminRouter from './routes/admin-product-route.js';
import orderRouter from './routes/order.routes.js';
import userRouter from './routes/user.routes.js';
import authRouter from './routes/authRoutes.js';
import vendorRouter from './routes/vendor.route.js';
import aiRouter from './routes/ai.routes.js';
import cartRouter from './routes/cart.routes.js';
import wishlistRouter from './routes/wishlist.routes.js';
import webhookRouter from './routes/webhook.routes.js';
import payoutRouter from './routes/payout.routes.js';
import analyticsRouter from './routes/analytics.routes.js';
import disputeRouter from './routes/dispute.routes.js';


const app = express()
// Middleware
app.use(express.json())

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Vite frontend
    credentials: true
}));

app.use(express.urlencoded({ extended: true }))

// Routes

//  Categories Route
app.use('/api/categories', categoryRouter)

// Product Route
app.use('/api/products', productRouter)

// Order Route
app.use('/api/orders', orderRouter)

// User Route
app.use('/api/users', userRouter)

// Auth Route
app.use('/api/auth', authRouter)

// Vendor Route
app.use('/api/vendors', vendorRouter)

// Admin Route
app.use('/api/admin/products', adminRouter);

// AI Route
app.use('/api/ai', aiRouter);

// Cart Route
app.use('/api/cart', cartRouter);

// Wishlist Route
app.use('/api/wishlist', wishlistRouter);

// Webhook Route
app.use('/api/webhooks', webhookRouter);

// Payout Route
app.use('/api/payouts', payoutRouter);

// Analytics Route
app.use('/api/analytics', analyticsRouter);

// Dispute Route
app.use('/api/disputes', disputeRouter);







export default app