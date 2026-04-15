const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  txnId: {
    type: String,
    required: true,
    unique: true
  },

  type: {
    type: String,
    required: true
    // example: "Mobile Recharge", "DTH Recharge", "Wallet Add"
  },

  amount: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["debit", "credit", "failed"],
    required: true
  },

  balance: {
    type: Number,
    required: true
  },

  mobile: String,
  operator: String,
  
remark: {
  type: String,
  default: ""
}

}, 
{
  timestamps: true
});

module.exports = mongoose.model("Transaction", transactionSchema);