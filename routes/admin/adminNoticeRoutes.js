const express = require("express");
const router = express.Router();

const Notice = require("../../models/Notice");

router.post("/notice", async (req, res) => {
  try {

    const { type, message, serviceId, retailerId } = req.body;

    if (!type || !message) {
      return res.status(400).json({ success: false, msg: "Missing fields" });
    }

    if (type === "service" && !serviceId) {
      return res.status(400).json({ success: false, msg: "Service required" });
    }

    if (type === "retailer" && !retailerId) {
      return res.status(400).json({ success: false, msg: "Retailer required" });
    }

    const notice = new Notice({
      type,
      message,
      serviceId: type === "service" ? serviceId : null,
      retailerId: type === "retailer" ? retailerId : null
    });

    await notice.save();

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

router.get("/notice/:retailerId", async (req, res) => {
  try {

    const { retailerId } = req.params;

    const notices = await Notice.find({
      isActive: true,
      $or: [
        { type: "global" },
        { type: "retailer", retailerId },
        { type: "service" }
      ]
    }).sort({ createdAt: -1 });

    res.json({ success: true, notices });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;