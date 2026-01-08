import User from '../../models/User.model.js';
import Vendor from '../../models/Vendor.js';
import jwt from 'jsonwebtoken';

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || process.env.MY_KEY, {
        expiresIn: '1d'
    });
};

// Register user
export const register = async (req, res) => {
    try {
        const { name, email, password, phone, role, storeDescription, location, businessAddress, logo, socials, storeName } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            phone,
            role: role || 'customer'
        });

        let vendorProfile = null
        // Auto-create Vendor profile for new vendors
        if (user.role === 'vendor') {
           vendorProfile = await Vendor.create({
                owner: user._id,
                storeName,
                storeDescription,
                location,
                businessAddress,
                socials,
                logo
            });
        }

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: generateToken(user._id),
                vendor: vendorProfile ? {
                owner: user._id,
                storeName,
                storeDescription,
                location,
                businessAddress,
                socials,
                logo
                } : null
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });

    }
};

// Login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated'
            });
        }


        let vendorProfile = null
        // Ensure Vendor profile exists for all vendors
        if (user.role === 'vendor') {
            const vendorProfile = await Vendor.findOne({ owner: user._id });
            if (!vendorProfile) {
                console.log(`Creating missing vendor profile for user: ${user.email}`);
                await Vendor.create({
                owner: user._id,
                storeName: req.body.storeName||`${user.name}'s Store`,
                storeDescription: req.body.storeDescription,
                location: req.body.location, 
                businessAddress: req.body.businessAddress,
                socials: req.body.socials,
                logo: req.body.logo
                });
            }
        }

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                token: generateToken(user._id),
                vendor: vendorProfile ? {
                owner: user._id,
                storeName: req.body.storeName||`${user.name}'s Store`,
                storeDescription: req.body.storeDescription,
                location: req.body.location, 
                businessAddress: req.body.businessAddress,
                socials: req.body.socials,
                logo: req.body.logo
                } : null
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all users (Admin only)
export const getUsers = async (req, res) => {
    try {
        const { role, isActive } = req.query;

        const filter = {};
        if (role) filter.role = role;
        if (isActive) filter.isActive = isActive === 'true';

        const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update user role (Admin only)
export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Deactivate user (Admin only)
export const deactivateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Verify user (Admin only)
export const verifyUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isVerified: true },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get user statistics (Admin only)
export const getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const customers = await User.countDocuments({ role: 'customer' });
        const vendors = await User.countDocuments({ role: 'vendor' });
        const admins = await User.countDocuments({ role: 'admin' });
        const activeUsers = await User.countDocuments({ isActive: true });
        const verifiedUsers = await User.countDocuments({ isVerified: true });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                customers,
                vendors,
                admins,
                activeUsers,
                verifiedUsers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
