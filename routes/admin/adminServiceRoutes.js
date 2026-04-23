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

//====================== REATILER WISE SEVICE CINTROL =====================//
const RetailerService = require("../../models/RetailerService");


// 🔥 SAVE RETAILER SERVICE ACCESS
router.post("/retailer-service", async (req, res) => {
  try {

    const { retailerId, serviceId, isActive } = req.body;

    // check existing
    let record = await RetailerService.findOne({ retailerId, serviceId });

    if (record) {
      // update
      record.isActive = isActive;
      await record.save();
    } else {
      // create new
      await RetailerService.create({
        retailerId,
        serviceId,
        isActive
      });
    }

    res.json({ success: true });

  } catch (err) {
    console.error("Retailer Service Error:", err);
    res.json({ success: false });
  }
});

// 🔥 GET RETAILER SERVICE ACCESS
router.get("/retailer-service/:retailerId", async (req, res) => {
  try {

    const { retailerId } = req.params;

    const data = await RetailerService.find({ retailerId });

    res.json({
      success: true,
      data
    });

  } catch (err) {
    console.error("Get Retailer Service Error:", err);
    res.json({ success: false });
  }
});

module.exports = router;