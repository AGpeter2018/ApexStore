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

app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url} from ${req.headers.origin || 'no origin'}`);
  
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // Cache for 24 hours
    return res.status(204).send(); // No content, just headers
  }
  
  next();
});

// Then CORS middleware
app.use(cors({
  origin: true,
  credentials: true,
  preflightContinue: false, // Don't pass OPTIONS to next handler
  optionsSuccessStatus: 204
}));

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.status(200).json({ message: 'ApexStore API is running...' });
});

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