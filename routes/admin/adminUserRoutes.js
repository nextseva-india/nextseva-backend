const express = require("express");
const router = express.Router();

const User = require("../../models/User");

// 👨‍💼 GET ALL RETAILERS
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({
      role: { $ne: "admin" }
    });

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


// 🔥 UPDATE USER STATUS (BLOCK / ENABLE)
router.post("/user/status", async (req, res) => {
  try {
    const { userId, status } = req.body;

    // ❌ validation
    if (!userId || !status) {
      return res.status(400).json({
        success: false,
        message: "userId and status required"
      });
    }

    if (!["active", "blocked"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    // 🔄 update
    await User.findByIdAndUpdate(userId, { status });

    res.json({
      success: true,
      message: "User status updated"
    });

  } catch (err) {
    console.error("Admin Status Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;