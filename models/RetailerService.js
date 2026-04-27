const mongoose = require("mongoose");

const retailerServiceSchema = new mongoose.Schema({
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model("RetailerService", retailerServiceSchema);
