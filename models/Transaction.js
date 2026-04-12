const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  txnId: String,
  type: String,
  amount: Number,
  mobile: String,
  operator: String,
  status: String,
  date: Date
});

module.exports = mongoose.model("Transaction", transactionSchema);