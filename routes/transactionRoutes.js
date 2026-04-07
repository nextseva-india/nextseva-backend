const express = require("express");
const router = express.Router();

const User = require("../models/User");

// ➕ SAVE TRANSACTION
router.post("/add", async (req, res) => {
  try {
    const { mobile, tx } = req.body;

    // 🔒 VALIDATION
    if (
      !mobile ||
      !tx ||
      !tx.id ||
      !tx.amount ||
      !tx.type ||
      !tx.status
    ) {
      return res.json({
        status: "fail",
        message: "Invalid transaction data"
      });
    }

    // 🔥 PUSH + LIMIT (last 100 only)
    const result = await User.updateOne(
      { mobile },
      {
        $push: {
          transactions: {
            $each: [tx],
            $slice: -100
          }
        }
      }
    );

    // ❗ user না থাকলে
    if (result.matchedCount === 0) {
      return res.json({
        status: "fail",
        message: "User not found"
      });
    }

    res.json({ status: "success" });

  } catch (err) {
    console.error("TX ADD ERROR:", err);
    res.json({ status: "fail" });
  }
});


// 📥 GET TRANSACTION LIST
router.post("/list", async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.json({
        status: "fail",
        message: "Mobile required"
      });
    }

    const user = await User.findOne({ mobile });

    if (!user) {
      return res.json({
        status: "fail",
        message: "User not found"
      });
    }

    // 🔥 SORT (latest first)
    const list = (user.transactions || []).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    res.json({
      status: "success",
      list
    });

  } catch (err) {
    console.error("TX LIST ERROR:", err);
    res.json({ status: "fail" });
  }
});

module.exports = router;