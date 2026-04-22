const express = require("express");
const router = express.Router();

const Service = require("../../models/Service");

// 🔥 GET ALL SERVICES
router.get("/services", async (req, res) => {
  try {

    const services = await Service.find().lean();

    res.json({
      success: true,
      services
    });

  } catch (err) {
    console.error("Service Fetch Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;