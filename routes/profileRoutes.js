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

module.exports = router;

// 🔥 Update Profile
router.post("/profile/update", async (req, res) => {
  try {
    const { mobile, field, value } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { mobile: mobile },
      { [field]: value },
      { new: true }
    );

    res.json({
      status: "success",
      message: "Profile updated",
      user: updatedUser
    });

  } catch (err) {
    console.log(err);
    res.json({
      status: "error",
      message: "Update failed"
    });
  }
});