const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  shop: String,
  mobile: String,
  email: String,
  address: String,
  dob: String,
  docType: String,
  docNo: String,
  password: String,
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
});

module.exports = mongoose.model("User", userSchema);