const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: String,
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  type: {
    type: String,
    enum: ["main", "sub", "item"]
  },
  page_key: String,
  icon: String,

   isActive: {
    type: Boolean,
    default: true
  }
  
});

module.exports = mongoose.model("Service", serviceSchema);