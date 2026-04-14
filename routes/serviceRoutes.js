const User = require("../models/User");
const Transaction = require("../models/Transaction");
const express = require("express");
const router = express.Router();
const Service = require("../models/Service");
const generateTxnId = require("../utils/generateTxnId");

// GET all services
router.get("/services", async (req, res) => {
  try {
    const services = await Service.find();
    res.json({ status: "success", services });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/recharge", async (req, res) => {
  try {

    const { userId, mobile, operator } = req.body;
    const type = req.body.type || "Mobile Recharge";
    const amount = Number(req.body.amount);

    if(!amount || amount <= 0){
     return res.json({ success: false, message: "Invalid amount" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.wallet < amount) {
      return res.json({ success: false, message: "Insufficient balance" });
    }

    // ✅ wallet deduct
    user.wallet -= amount;
    await user.save();

    // ✅ transaction save
    const txnId = generateTxnId("RC");
  await Transaction.create({
  userId,
  txnId,
  type,
  amount,
  status: "debit",
  balance: user.wallet,
  mobile,
  operator
});

    return res.json({
  success: true,
  message: "Recharge successful",
  balance: user.wallet
});

  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Server error" });
  }
});

module.exports = router;