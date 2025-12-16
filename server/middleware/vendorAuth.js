import Vendor from "../models/Vendor.js";

export const requireVendor = async (req, res, next) => {
  if (req.user.role !== "vendor") {
    return res.status(403).json({
      success: false,
      message: "Vendor access only"
    });
  }

  const vendor = await Vendor.findOne({ owner: req.user._id });

  if (!vendor) {
    return res.status(400).json({
      success: false,
      message: "Vendor store not created"
    });
  }

  req.vendor = vendor; // 🔥 THIS IS THE MAGIC
  next();
};
