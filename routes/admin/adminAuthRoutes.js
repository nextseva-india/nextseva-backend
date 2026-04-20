const express = require("express");
const router = express.Router();

const User = require("../../models/User");

// 🔐 ADMIN LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. check input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password required"
      });
    }

    // 2. find user
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username"
      });
    }

    // 3. check role
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied (not admin)"
      });
    }

    // 4. check password (temporary plain)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Wrong password"
      });
    }

    // 5. success
    return res.json({
      success: true,
      message: "Login successful",
      admin: {
        id: user._id,
        name: user.name,
        username: user.username
      }
    });

  } catch (err) {
    console.error("Admin Login Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;