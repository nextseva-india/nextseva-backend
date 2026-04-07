const express = require("express");
const router = express.Router();

const User = require("../models/User");

// 💰 ADD MONEY
router.post("/add", async (req, res) => {
  try {
    const { mobile, amount } = req.body;

    const amt = Number(amount);

    // 🔥 VALIDATION FIX
    if (!mobile || isNaN(amt) || amt <= 0) {
      return res.json({ status: "fail", message: "Invalid data" });
    }

    // 🔥 ATOMIC UPDATE (NO BUG)
    const user = await User.findOneAndUpdate(
      { mobile },
      { $inc: { wallet: amt } },
      { new: true }
    );

    if (!user) {
      return res.json({ status: "fail", message: "User not found" });
    }

    res.json({
      status: "success",
      wallet: user.wallet
    });

  } catch (err) {
    console.error(err);
    res.json({ status: "fail" });
  }
});

// 💸 DEDUCT MONEY
router.post("/deduct", async (req, res) => {
  try {
    const { mobile, amount } = req.body;

    const amt = Number(amount);

    // 🔥 VALIDATION FIX
    if (!mobile || isNaN(amt) || amt <= 0) {
      return res.json({ status: "fail", message: "Invalid data" });
    }

    const user = await User.findOne({ mobile });

    if (!user) {
      return res.json({ status: "fail", message: "User not found" });
    }

    // 🔥 BALANCE CHECK
    if (user.wallet < amt) {
      return res.json({ status: "fail", message: "Low balance" });
    }

    // 🔥 ATOMIC UPDATE
    const updated = await User.findOneAndUpdate(
      { mobile },
      { $inc: { wallet: -amt } },
      { new: true }
    );

    res.json({
      status: "success",
      wallet: updated.wallet
    });

  } catch (err) {
    console.error(err);
    res.json({ status: "fail" });
  }
});

module.exports = router;