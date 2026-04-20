const express = require("express");
const router = express.Router();

const User = require("../../models/User");

// 👨‍💼 GET ALL RETAILERS
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ role: "retailer" });

    res.json({
      success: true,
      users
    });

  } catch (err) {
    console.error("Fetch Users Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;