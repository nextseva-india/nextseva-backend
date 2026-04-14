const express = require("express");
const router = express.Router();

const Transaction = require("../models/Transaction");

// 📥 GET TRANSACTION LIST (NEW SYSTEM)
router.post("/list", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.json({
        status: "fail",
        message: "User ID required"
      });
    }

    const list = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100);

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