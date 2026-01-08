import mongoose from 'mongoose';
import Product from './server/models/Product.model.js';
import Vendor from './server/models/Vendor.js';
import User from './server/models/User.model.js';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to MongoDB');

        const products = await Product.find({
            $or: [
                { createdBy: { $exists: false } },
                { createdBy: null },
                { createdByRole: { $exists: false } }
            ]
        }).populate('vendorId');

        console.log(`Found ${products.length} products to migrate`);

        let adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            console.log('No admin user found, using a generic placeholder if necessary');
        }

        for (const product of products) {
            let update = {};

            if (product.vendorId && product.vendorId.owner) {
                update.createdBy = product.vendorId.owner;
                update.createdByRole = 'vendor';
            } else if (adminUser) {
                update.createdBy = adminUser._id;
                update.createdByRole = 'admin';
            }

            if (Object.keys(update).length > 0) {
                await Product.findByIdAndUpdate(product._id, { $set: update });
                console.log(`Updated product ${product._id} (${product.name})`);
            }
        }

        console.log('Migration complete');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
