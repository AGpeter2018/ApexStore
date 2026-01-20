import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Set mongoose options
        mongoose.set('strictQuery', false);
        
        // Connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGODB_URL, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Wait for connection to be fully ready
        if (mongoose.connection.readyState === 1) {
            console.log('✅ MongoDB is ready to accept operations');
        }
        
        return conn;
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

export default connectDB;