const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Service = require("../models/Service");
const generateTxnId = require("../utils/generateTxnId");


// GET all services
router.get("/services", async (req, res) => {
  try {
    const services = await Service.find();
    res.json({ status: "success", services });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// RECHARGE
router.post("/recharge", async (req, res) => {
  try {

    const { userId, mobile, operator } = req.body;
    const type = req.body.type || "Mobile Recharge";
    const amount = Number(req.body.amount);

    if (!amount || amount <= 0) {
      return res.json({ success: false, message: "Invalid amount" });
    }

    // 🔥 FIND USER
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.wallet < amount) {
      return res.json({ success: false, message: "Insufficient balance" });
    }


    // 🔥 CREATE TRANSACTION FIRST
    const txnId = generateTxnId("RC");

    const txn = await Transaction.create({
      
      userId,
      txnId,
      type,
      amount,
      status: "pending",
      flow: "debit",
      balance: user.wallet,
      mobile,
      operator,
      remark: "Processing"
    });
    // 🔥 STEP 2: simulate API call
let apiResponse;

// ✅ force fail
if(Math.random() < 0.8){
  apiResponse = { success: true };
}else{
  apiResponse = { success: false };
}

console.log("API RESULT:", apiResponse);

if(apiResponse.success){

  // ✅ wallet deduct
  user.wallet = user.wallet - amount;
  await user.save();

  // ✅ update txn
  txn.status = "success";
  txn.balance = user.wallet;
  txn.remark = "Recharge successful";

}else{

  // ❌ failed txn
  txn.status = "failed";
  txn.remark = "Recharge failed";

}

await txn.save();


   return res.json({
  success: apiResponse.success,
  message: apiResponse.success ? "Recharge successful" : "Recharge failed",
  balance: user.wallet,
  txnId: txn.txnId   // 🔥 IMPORTANT
});

  } catch (err) {
    console.error("RECHARGE ERROR:", err);
    res.json({ success: false, message: err.message });
  }
});


module.exports = router;