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

// 📊 ADMIN DASHBOARD STATS
router.get("/stats", async (req, res) => {
  try {

    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });

    const activeUsers = await User.countDocuments({
      role: { $ne: "admin" },
      status: "active"
    });

    const blockedUsers = await User.countDocuments({
      role: { $ne: "admin" },
      status: "blocked"
    });

    const incompleteUsers = await User.countDocuments({
  role: { $ne: "admin" },
  profileComplete: false
});

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        blockedUsers,
        incompleteUsers
      }
    });

  } catch (err) {
    console.error("Admin Stats Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});
// 📊 TRANSACTION STATS
const Transaction = require("../../models/Transaction");

// 📊 TRANSACTION STATS API
router.get("/transaction-stats", async (req, res) => {
  try {

    const total = await Transaction.countDocuments();
    const success = await Transaction.countDocuments({ status: "success" });
    const failed = await Transaction.countDocuments({ status: "failed" });
    const pending = await Transaction.countDocuments({ status: "pending" });

    res.json({
      success: true,
      stats: { total, success, failed, pending }
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// 📋 ADMIN ALL TRANSACTIONS (❌ require remove)
router.get("/transactions", async (req, res) => {
  try {

    const transactions = await Transaction.find()
  .populate("userId", "retailerId name shop mobile")
  .sort({ createdAt: -1 });

    res.json({
      success: true,
      transactions
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
