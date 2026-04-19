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
    unique: true,
    index: true
  },

  type: {
    type: String,
    required: true
    // "Mobile Recharge", "DTH Recharge", "Electric Bill"
  },

  amount: {
    type: Number,
    required: true,
    min: 1
  },

  // ✅ status = pending / success / failed
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    required: true,
    index: true
  },

  // ✅ credit / debit
  flow: {
    type: String,
    enum: ["credit", "debit"],
    required: true,
    index: true
  },

  balance: {
    type: Number,
    required: true,
    min: 0
  },

  // 🔥 ALL SERVICE DATA HERE (FUTURE PROOF)
  details: {
    mobile: {
      type: String,
      default: ""
    },
    customerId: {
      type: String,
      default: ""
    },
    consumerNo: {
      type: String,
      default: ""
    },
    operator: {
      type: String,
      default: ""
    },
    board: {
      type: String,
      default: ""
    }
  },

  remark: {
    type: String,
    default: ""
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("Transaction", transactionSchema);