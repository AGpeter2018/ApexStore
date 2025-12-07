import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import app from './app.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

console.log('Environment loaded from:', envPath);
console.log('MongoDB URL exists:', !!process.env.MONGODB_URL);
console.log('PORT:', process.env.PORT);

const startServer = async () => {
    try {
        // Connect to MongoDB and WAIT for it to be ready
        await connectDB();
        
        // Give mongoose a moment to fully initialize
        await new Promise(resolve => setTimeout(resolve, 1000));

        const PORT = process.env.PORT || 5000;
        
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });

        app.on('error', (error) => {
            console.error(`Server error: ${error.message}`);
        });


    } catch (error) {
        console.error('❌ Server startup failed:', error);
        process.exit(1);
    }
};

startServer();