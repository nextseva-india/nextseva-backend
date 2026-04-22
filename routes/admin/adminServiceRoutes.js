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

// 🔥 TOGGLE SERVICE
// 🔥 helper function (recursive)
async function disableChildren(parentId) {

  const children = await Service.find({ parent_id: parentId });

  for (let child of children) {

    await Service.findByIdAndUpdate(child._id, { isActive: false });

    // 🔁 recursive call
    await disableChildren(child._id);
  }
}


// 🔥 TOGGLE SERVICE
router.post("/toggle-service", async (req, res) => {
  try {

    const { serviceId, isActive } = req.body;

    // update selected
    await Service.findByIdAndUpdate(serviceId, { isActive });

    // 🔥 if disable → all level disable
    if (isActive === false) {
      await disableChildren(serviceId);
    }

    res.json({ success: true });

  } catch (err) {
    console.error("Toggle Error:", err);
    res.json({ success: false });
  }
});

module.exports = router;