const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  retailerId: {
    type: String,
    required: true,
    unique: true
  },

  name: String,
  shop: String,

  mobile: {
    type: String,
    required: true,
    unique: true
  },

  email: {
    type: String,
    unique: true,
    sparse: true
  },

  address: String,
  dob: String,
  docType: String,

  docNo: {
    type: String,
    unique: true,
    sparse: true
  },

  password: {
    type: String,
    required: true
  },

  username: {
    type: String,
    unique: true,
    sparse: true
  },

  role: {
    type: String,
    default: "retailer"
  },

  // 🔥 ADMIN CONTROL FIELD
  status: {
    type: String,
    enum: ["active", "blocked"],
    default: "active",
  },

  wallet: {
    type: Number,
    default: 0
  },

  // 🔐 PROFILE / KYC STATUS
  profileComplete: {
    type: Boolean,
    default: false
  },

  mpin: String,

  bankAccounts: [
    {
      name: String,
      accountNumber: String,
      ifsc: String,
      primary: {
        type: Boolean,
        default: false
      }
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);