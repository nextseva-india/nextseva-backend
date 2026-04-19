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
  remark: "Processing",

  details: {
    mobile,
    operator
  }
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


// 📡 DTH RECHARGE
router.post("/dth", async (req, res) => {
  try {

    const { userId, customerId, operator } = req.body;
    const type = "DTH Recharge";
    const amount = Number(req.body.amount);

    // ✅ validation
    if (!customerId || customerId.length < 5) {
      return res.json({ success: false, message: "Invalid Customer ID" });
    }

    if (!operator) {
      return res.json({ success: false, message: "Select operator" });
    }

    if (!amount || amount <= 0) {
      return res.json({ success: false, message: "Invalid amount" });
    }

    // 🔥 user check
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.wallet < amount) {
      return res.json({ success: false, message: "Insufficient balance" });
    }

    // 🔥 create txn (PENDING)
    const txnId = generateTxnId("DTH");

    const txn = await Transaction.create({
  userId,
  txnId,
  type,
  amount,
  status: "pending",
  flow: "debit",
  balance: user.wallet,
  remark: "Processing",

  details: {
    customerId,
    operator
  }
});

    // 🔥 fake API
    let apiResponse;

    if(Math.random() < 0.8){
      apiResponse = { success: true };
    }else{
      apiResponse = { success: false };
    }

    // 🔥 result handle
    if(apiResponse.success){

      user.wallet -= amount;
      await user.save();

      txn.status = "success";
      txn.balance = user.wallet;
      txn.remark = "DTH Recharge successful";

    } else {

      txn.status = "failed";
      txn.remark = "DTH Recharge failed";
    }

    await txn.save();

    return res.json({
      success: apiResponse.success,
      message: apiResponse.success ? "DTH Recharge successful" : "DTH Recharge failed",
      balance: user.wallet,
      txnId: txn.txnId
    });

  } catch (err) {
    console.error("DTH ERROR:", err);
    res.json({ success: false, message: err.message });
  }
});

// ELECTRIC BILL

router.post("/electric/fetch", async (req, res) => {
  try {

    const { consumerNo, board } = req.body;

    if(!consumerNo || !board){
      return res.json({ success: false, message: "Invalid details" });
    }

    // 🔥 FAKE BILL DATA (API replaceable)
    const bill = {
      customerName: "Demo User",
      consumerNo,
      board,
      amount: Math.floor(Math.random() * 500) + 100,
      dueDate: "28-03-2026"
    };

    return res.json({
      success: true,
      bill
    });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});


router.post("/electric/pay", async (req, res) => {
  try {

    const { userId, amount, consumerNo, board } = req.body;

    const user = await User.findById(userId);

    if(!user){
      return res.json({ success: false, message: "User not found" });
    }

    if(user.wallet < amount){
      return res.json({ success: false, message: "Insufficient balance" });
    }

    const txnId = generateTxnId("ELEC");

    // 🔥 create pending txn
   const txn = await Transaction.create({
  userId,
  txnId,
  type: "Electric Bill",
  amount,
  status: "pending",
  flow: "debit",
  balance: user.wallet,
  remark: "Bill Processing",

  details: {
    consumerNo,
    board
  }
});

    // 🔥 simulate API
    let apiResponse;

    if(Math.random() < 0.9){
      apiResponse = { success: true };
    }else{
      apiResponse = { success: false };
    }

    if(apiResponse.success){

      user.wallet -= amount;
      await user.save();

      txn.status = "success";
      txn.balance = user.wallet;
      txn.remark = "Bill Paid";

    }else{

      txn.status = "failed";
      txn.remark = "Bill Failed";

    }

    await txn.save();

    return res.json({
      success: apiResponse.success,
      txnId,
      balance: user.wallet
    });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

module.exports = router;