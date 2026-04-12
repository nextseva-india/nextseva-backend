const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Transaction = require("../models/Transaction");

// 💰 ADD MONEY
router.post("/add", async (req, res) => {
  try {
    const { mobile, amount } = req.body;

    const amt = Number(amount);

    if (!mobile || isNaN(amt) || amt <= 0) {
      return res.json({ status: "fail", message: "Invalid data" });
    }

    // 🔥 UPDATE WALLET
    const user = await User.findOneAndUpdate(
      { mobile },
      { $inc: { wallet: amt } },
      { new: true }
    );

    if (!user) {
      return res.json({ status: "fail", message: "User not found" });
    }

    // 🔥 SAVE TRANSACTION
    await Transaction.create({
      userId: user._id,
      txnId: "NS" + Date.now() + Math.floor(Math.random() * 1000),
      type: "Wallet Add",
      amount: amt,
      status: "credit",
      balance: user.wallet
    });

    res.json({
      status: "success",
      wallet: user.wallet
    });

  } catch (err) {
    console.error("WALLET ADD ERROR:", err);
    res.json({ status: "fail" });
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

    // 🔥 UPDATE WALLET
    const updated = await User.findOneAndUpdate(
      { mobile },
      { $inc: { wallet: -amt } },
      { new: true }
    );

    // 🔥 SAVE TRANSACTION
    await Transaction.create({
      userId: updated._id,
      txnId: "NS" + Date.now() + Math.floor(Math.random() * 1000),
      type: "Wallet Withdraw",
      amount: amt,
      status: "debit",
      balance: updated.wallet
    });

    res.json({
      status: "success",
      wallet: updated.wallet
    });

  } catch (err) {
    console.error("WALLET DEDUCT ERROR:", err);
    res.json({ status: "fail" });
  }
});

module.exports = router;