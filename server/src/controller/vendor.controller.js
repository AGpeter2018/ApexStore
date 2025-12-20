import Vendor from "../../models/Vendor.js";
import Product from "../../models/Product.model.js";


/**
 * @desc    Create vendor store
 * @route   POST /api/vendors
 * @access  Vendor
 */
export const createVendor = async (req, res) => {
  try {
    // Ensure user is vendor
    if (req.user.role !== "vendor") {
      return res.status(403).json({
        success: false,
        message: "Only vendors can create a store"
      });
    }

    // Prevent duplicate store
    const existingVendor = await Vendor.findOne({ owner: req.user._id });
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: "Vendor store already exists"
      });
    }

    const vendor = await Vendor.create({
      owner: req.user._id,
      storeName: req.body.storeName,
      storeDescription: req.body.description,
      location: req.body.location,
      // businessLicense,
      phone: req.body.phone,
      address: req.body.address
    });

    res.status(201).json({
      success: true,
      message: "Vendor store created successfully",
      data: vendor
    });

  } catch (error) {
    console.error("Create Vendor Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create vendor",
      error: error.message
    });
  }
};

/**
 * @desc    Get logged-in vendor store
 * @route   GET /api/vendors/me
 * @access  Vendor
 */
export const getMyVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ owner: req.user._id })
      .populate("owner", "name email");

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor store not found"
      });
    }

    res.status(200).json({
      success: true,
      data: vendor
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update vendor store
 * @route   PUT /api/vendors/me
 * @access  Vendor
 */
export const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ owner: req.user._id });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor store not found"
      });
    }

    const fields = [
      "storeName",
      "description",
      "logo",
      "phone",
      "address",
      "socials"
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        vendor[field] = req.body[field];
      }
    });

    await vendor.save();

    res.status(200).json({
      success: true,
      message: "Vendor store updated successfully",
      data: vendor
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get vendor products
 * @route   GET /api/vendors/me/products
 * @access  Vendor
 */
export const getVendorProducts = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ owner: req.user._id });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor store not found"
      });
    }

    const products = await Product.find({ vendorId: vendor._id })
      .populate("categoryId", "name slug")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Admin: Get all vendors
 * @route   GET /api/vendors
 * @access  Admin
 */
export const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Admin: Approve / Suspend vendor
 * @route   PUT /api/vendors/:id/status
 * @access  Admin
 */
export const updateVendorStatus = async (req, res) => {
  try {
    const { isActive, isApproved } = req.body;
    const update = {};
    if (isActive !== undefined) update.isActive = isActive;
    if (isApproved !== undefined) update.isApproved = isApproved;

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    ).populate("owner", "name email");

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Vendor status updated successfully",
      data: vendor
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Admin: Get vendor statistics
 * @route   GET /api/vendors/stats
 * @access  Admin
 */
export const getVendorStats = async (req, res) => {
  try {
    const totalVendors = await Vendor.countDocuments();
    const activeVendors = await Vendor.countDocuments({ isActive: true });
    const pendingApprovals = await Vendor.countDocuments({ isApproved: false });

    const salesData = await Vendor.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalSales" },
          totalOrders: { $sum: "$totalOrders" }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalVendors,
        activeVendors,
        pendingApprovals,
        totalRevenue: salesData[0]?.totalRevenue || 0,
        totalOrders: salesData[0]?.totalOrders || 0
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
