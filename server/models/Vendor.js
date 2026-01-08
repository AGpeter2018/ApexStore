import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true //  One vendor per user
  },

  storeName: {
    type: String,
    required: true,
    trim: true
  },

  storeSlug: {
    type: String,
    unique: true,
    lowercase: true
  },

  storeDescription: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  // businessLicense: {
  //     type: String,
  //     trim: true
  // },
  location: {
    type: String,
    trim: true
  },
  businessAddress: {
    type: String,
    trim: true,
    maxlength: 1000
  },

  socials: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String
  },

  logo: {
    type: String,
    trim: true
  },

  totalSales: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },

  isApproved: {
    type: Boolean,
    default: false // admin approves vendor
  },

  isActive: {
    type: Boolean,
    default: true
  },
  balance: {
    type: Number,
    default: 0
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankCode: String,
    bankName: String
  }
}, { timestamps: true });

/* Auto-generate slug */
vendorSchema.pre("save", function () {
  if (this.isModified("storeName")) {
    this.storeSlug = this.storeName
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

});

export default mongoose.model("Vendor", vendorSchema);
