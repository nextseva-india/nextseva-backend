const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({

  type: {
    type: String,
    enum: ["global", "service", "retailer"],
    required: true
  },

  message: {
    type: String,
    required: true
  },

  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    default: null
  },

  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Notice", noticeSchema);