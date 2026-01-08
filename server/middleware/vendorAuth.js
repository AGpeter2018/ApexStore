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
    const {storeName, storeDescription, location, businessAddress,  socials, logo} = req.body;
    vendor = await Vendor.create({
     owner: user._id,
                storeName,
                storeDescription,
                location, 
                businessAddress,
                socials,
                logo
    });
  }

  req.vendor = vendor; // THIS IS THE MAGIC
  next();
};
