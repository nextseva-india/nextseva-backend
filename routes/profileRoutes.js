const express = require("express");
const router = express.Router();

const User = require("../models/User");


// 🔥 Get Profile
router.post("/profile", async (req, res) => {
  try {
    const { mobile } = req.body;

    const user = await User.findOne({ mobile });

    if (!user) {
      return res.json({
        status: "error",
        message: "User not found"
      });
    }

    res.json({
      status: "success",
      user: user
    });

  } catch (err) {
    console.log(err);
    res.json({
      status: "error",
      message: "Server error"
    });
  }
});


// 🔥 Update Profile (SAFE VERSION)
router.post("/profile/update", async (req, res) => {
  try {
    const { userId, field, value } = req.body;

    if (!userId || !field) {
      return res.json({
        status: "error",
        message: "Invalid request"
      });
    }

    // 🔒 DUPLICATE CHECK (only for mobile/email)
    if (field === "mobile" || field === "email") {

      const existingUser = await User.findOne({
        _id: { $ne: userId },
        [field]: value
      });

      if (existingUser) {
        return res.json({
          status: "error",
          message: `${field} already in use`
        });
      }
    }

    // ✅ UPDATE USER
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { [field]: value },
      { new: true }
    );

    res.json({
      status: "success",
      message: "Profile updated",
      user: updatedUser
    });

  } catch (err) {
    console.log("Profile update error:", err);

    res.json({
      status: "error",
      message: "Update failed"
    });
  }
});


module.exports = router;