import express from "express";
import {
  createVendor,
  getMyVendor,
  updateVendor,
  getVendors,
  getVendorProducts,
  updateVendorStatus,
  getVendorStats,
  getVendorDetail
} from "../controller/vendor.controller.js";
import { protect, authorize } from "../../middleware/auth.js";
import { requireVendor } from "../../middleware/vendorAuth.js";

const vendorRouter = express.Router();

// Create store
vendorRouter.post(
  "/",
  protect,
  authorize("vendor"),
  createVendor
);

// Get own store
vendorRouter.get(
  "/me",
  protect,
  authorize("vendor"),
  requireVendor,
  getMyVendor
);

// Update store
vendorRouter.put(
  "/me",
  protect,
  authorize("vendor"),
  requireVendor,
  updateVendor
);

// Admin: Get vendors
vendorRouter.get('/', protect, authorize('admin'), getVendors)

// Admin: Get stats
vendorRouter.get('/stats', protect, authorize('admin'), getVendorStats)

// Admin: Update status
vendorRouter.put('/:id/status', protect, authorize('admin'), updateVendorStatus)
vendorRouter.get('/:id', protect, authorize('admin'), getVendorDetail)

// Vendor products
vendorRouter.get(
  "/me/products",
  protect,
  authorize("vendor"),
  requireVendor,
  getVendorProducts
);

export default vendorRouter;
