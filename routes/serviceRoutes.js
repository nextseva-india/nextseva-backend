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

    // ❌ INVALID AMOUNT (FIXED + LOG ADDED)
    if (!amount || amount <= 0) {

      const txnId = generateTxnId("RC");

      await Transaction.create({
        userId,
        txnId,
        type,
        amount,
        status: "failed",
        flow: "debit",
        balance: 0,
        mobile,
        operator,
        remark: "Invalid amount"
      });

      return res.json({ success: false, message: "Invalid amount" });
    }

    const user = await User.findById(userId);

    // ❌ USER NOT FOUND (LOG ADDED)
    if (!user) {

      const txnId = generateTxnId("RC");

      await Transaction.create({
        userId,
        txnId,
        type,
        amount,
        status: "failed",
        flow: "debit",
        balance: 0,
        mobile,
        operator,
        remark: "User not found"
      });

      return res.json({ success: false, message: "User not found" });
    }

    // ❌ LOW BALANCE (ALREADY GOOD)
    if (user.wallet < amount) {

      const txnId = generateTxnId("RC");

      await Transaction.create({
        userId,
        txnId,
        type,
        amount,
        status: "failed",
        flow: "debit",
        balance: user.wallet,
        mobile,
        operator,
        remark: "Insufficient balance"
      });

      return res.json({ success: false, message: "Insufficient balance" });
    }

    // ✅ wallet deduct
    user.wallet -= amount;
    await user.save();

    // ✅ SUCCESS TRANSACTION
    const txnId = generateTxnId("RC");

    await Transaction.create({
      userId,
      txnId,
      type,
      amount,
      status: "success",
      flow: "debit",
      balance: user.wallet,
      mobile,
      operator,
      remark: "Recharge successful"
    });

    return res.json({
      success: true,
      message: "Recharge successful",
      balance: user.wallet
    });

  } catch (err) {

    console.error(err);

    const txnId = generateTxnId("RC");

    await Transaction.create({
      userId: req.body.userId,
      txnId,
      type: req.body.type || "Mobile Recharge",
      amount: Number(req.body.amount) || 0,
      status: "failed",
      flow: "debit",
      balance: 0,
      mobile: req.body.mobile,
      operator: req.body.operator,
      remark: "Server error"
    });

    res.json({ success: false, message: "Server error" });
  }
});

module.exports = router;