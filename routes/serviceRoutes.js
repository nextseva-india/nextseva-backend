const express = require("express");
const router = express.Router();
const Service = require("../models/Service");

// GET all services
router.get("/services", async (req, res) => {
  try {
    const services = await Service.find();
    res.json({ status: "success", services });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;