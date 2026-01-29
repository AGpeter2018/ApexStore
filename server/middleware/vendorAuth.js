import Vendor from "../models/Vendor.js";

export const requireVendor = async (req, res, next) => {
  if (req.user.role !== "vendor") {
    return res.status(403).json({
      success: false,
      message: "Vendor access only"
    });
  }

  let vendor = await Vendor.findOne({ owner: req.user._id });

  if (!vendor) {
    // Fail-safe: Create missing vendor profile
    vendor = await Vendor.create({
      owner: req.user._id,
      storeName: `${req.user.name}'s Store`,
      storeDescription: "Premium African products and craftsmanship.",
      location: "Lagos",
    });
  }

  req.vendor = vendor; // THIS IS THE MAGIC
  next();
};
