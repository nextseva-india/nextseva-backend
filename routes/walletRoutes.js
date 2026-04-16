const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const generateTxnId = require("../utils/generateTxnId");


// 💰 ADD MONEY
router.post("/add", async (req, res) => {
  try {
    console.log("🔥 ADD ROUTE HIT");

    const { mobile, amount } = req.body;
    const amt = Number(amount);

    if (!mobile || isNaN(amt) || amt <= 0) {
      return res.json({ status: "fail", message: "Invalid data" });
    }

    // 🔥 FIND USER FIRST
    const user = await User.findOne({ mobile });

    if (!user) {
      return res.json({ status: "fail", message: "User not found" });
    }

    // 🔥 CALCULATE NEW BALANCE
    const newBalance = user.wallet + amt;

    // 🔥 CREATE TRANSACTION FIRST (prepare data)
    const txnId = generateTxnId("CR");

    await Transaction.create({
      userId: user._id,
      txnId,
      type: "Wallet Add",
      amount: amt,
      status: "success",
      flow: "credit",
      balance: newBalance,
      remark: "Amount added successfully"
    });

    // 🔥 UPDATE WALLET AFTER
    user.wallet = newBalance;
    await user.save();

    res.json({
      status: "success",
      wallet: user.wallet
    });

  } catch (err) {
    console.error("WALLET ADD ERROR:", err);
    res.json({ status: "fail", message: err.message });
  }
});


// 💸 DEDUCT MONEY
router.post("/deduct", async (req, res) => {
  try {
    const { mobile, amount } = req.body;
    const amt = Number(amount);

    if (!mobile || isNaN(amt) || amt <= 0) {
      return res.json({ status: "fail", message: "Invalid data" });
    }

    const user = await User.findOne({ mobile });

    if (!user) {
      return res.json({ status: "fail", message: "User not found" });
    }

    if (user.wallet < amt) {
      return res.json({ status: "fail", message: "Low balance" });
    }

    // 🔥 CALCULATE NEW BALANCE
    const newBalance = user.wallet - amt;

    // 🔥 CREATE TRANSACTION FIRST
    const txnId = generateTxnId("DR");

    await Transaction.create({
      userId: user._id,
      txnId,
      type: "Wallet Withdraw",
      amount: amt,
      status: "success",
      flow: "debit",
      balance: newBalance,
      remark: "Amount Withdrawal successfully"
    });

    // 🔥 UPDATE WALLET AFTER
    user.wallet = newBalance;
    await user.save();

    res.json({
      status: "success",
      wallet: user.wallet
    });

  } catch (err) {
    console.error("WALLET DEDUCT ERROR:", err);
    res.json({ status: "fail", message: err.message });
  }
});


module.exports = router;