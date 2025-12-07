import express from 'express'
import cors from 'cors'
import router from './routes/product-collection-route.js';
import productRouter from './routes/product.routes.js';
import adminRouter from './routes/admin-product-route.js';
import orderRouter from './routes/order.routes.js';
import userRouter from './routes/user.routes.js';

const app = express()
// Middleware
app.use(express.json())

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Vite frontend
    credentials: true  
}));

app.use(express.urlencoded({extended: true}))

// Routes

//  Collectionn Route
app.use('/api/collections', router)

// Product Route
app.use('/api/products', productRouter)

// Order Route
app.use('/api/orders', orderRouter)

// User Route
app.use('/api/users', userRouter)

// Admin Route
app.use('/admin/products', adminRouter);






export default app