import express from "express";
import {
  createVendor,
  getMyVendor,
  updateVendor,
  getVendors,
  getVendorProducts
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

// Get vendors
vendorRouter.get('/', protect, authorize('admin'), getVendors)

// Vendor products
vendorRouter.get(
  "/me/products",
  protect,
  authorize("vendor"),
  requireVendor,
  getVendorProducts
);

export default vendorRouter;
