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

  wallet: {
    type: Number,
    default: 0
  },

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
  ],

  transactions: [
    {
      id: {
        type: String,
        required: true
      },

      date: {
        type: Date,
        default: Date.now
      },

      type: {
        type: String,
        enum: ["credit", "debit"],
        required: true
      },

      status: String,

      amount: Number,
      balance: Number
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);