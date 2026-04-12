const User = require("../models/User");
const express = require("express");
const router = express.Router();
const Service = require("../models/Service");

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
    await User.updateOne(
  { _id: userId },
  {
    $push: {
      transactions: {
        $each: [{
          id: "NS" + Date.now(),
          type: "Mobile Recharge",
          status: "debit",
          amount,
          balance: user.wallet, // 🔥 ADD THIS
          date: new Date()
        }],
        $slice: -100
      }
    }
  }
);

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