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

router.post("/electricity/fetch", async (req, res) => {
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


router.post("/electricity/pay", async (req, res) => {
  try {

    const { userId, amount, consumerNo, board } = req.body;

    const user = await User.findById(userId);

    if(!user){
      return res.json({ success: false, message: "User not found" });
    }

    if(user.wallet < amount){
      return res.json({ success: false, message: "Insufficient balance" });
    }

    const txnId = generateTxnId("EL");

    // 🔥 create pending txn
   const txn = await Transaction.create({
  userId,
  txnId,
  type: "Electricity Bill",
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

// ======================= POSTPAID BILL =======================
router.post("/postpaid/fetch", async (req, res) => {
  try {

    const { mobile, operator } = req.body;

    // ✅ validation
    if(!/^[6-9]\d{9}$/.test(mobile)){
      return res.json({ success: false, message: "Invalid mobile number" });
    }

    if(!operator){
      return res.json({ success: false, message: "Select operator" });
    }

    // 🔥 FAKE BILL DATA (API replaceable)
    const bill = {
      customerName: "Demo User",
      mobile,
      operator,
      amount: Math.floor(Math.random() * 500) + 100,
      dueDate: "30-03-2026"
    };

    return res.json({
      success: true,
      bill
    });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.post("/postpaid/pay", async (req, res) => {
  try {

    const { userId, mobile, operator, amount } = req.body;

    const user = await User.findById(userId);

    if(!user){
      return res.json({ success: false, message: "User not found" });
    }

    if(user.wallet < amount){
      return res.json({ success: false, message: "Insufficient balance" });
    }

    const txnId = generateTxnId("PP");

    // 🔥 create txn (PENDING)
    const txn = await Transaction.create({
      userId,
      txnId,
      type: "Postpaid Bill",
      amount,
      status: "pending",
      flow: "debit",
      balance: user.wallet,
      remark: "Bill Processing",

      details: {
        mobile,
        operator
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
      txn.remark = "Postpaid Paid";

    }else{

      txn.status = "failed";
      txn.remark = "Postpaid Failed";
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

// ======================= CREDITCARD BILL =======================
router.post("/creditcard/fetch", async (req, res) => {
  try {

    const { cardNumber, bank } = req.body;

    if(!cardNumber || cardNumber.length < 12){
      return res.json({ success: false, message: "Invalid card number" });
    }

    if(!bank){
      return res.json({ success: false, message: "Select bank" });
    }

    // 🔥 FAKE DATA (API replaceable)
    const bill = {
      cardNumber,
      bank,
      customerName: "Demo User",
      totalDue: Math.floor(Math.random() * 5000) + 1000,
      minDue: Math.floor(Math.random() * 500) + 100,
      dueDate: "05-04-2026"
    };

    return res.json({
      success: true,
      bill
    });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.post("/creditcard/pay", async (req, res) => {
  try {

    const { userId, cardNumber, bank, amount } = req.body;

    const user = await User.findById(userId);

    if(!user){
      return res.json({ success: false, message: "User not found" });
    }

    if(user.wallet < amount){
      return res.json({ success: false, message: "Insufficient balance" });
    }

    const txnId = generateTxnId("CC");

    const txn = await Transaction.create({
      userId,
      txnId,
      type: "Credit Card Bill",
      amount,
      status: "pending",
      flow: "debit",
      balance: user.wallet,
      remark: "Bill Processing",

      details: {
        cardNumber,
        bank
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
      txn.remark = "Credit Card Paid";

    } else {

      txn.status = "failed";
      txn.remark = "Payment Failed";
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

// ======================= LIC PREMIUM =======================
router.post("/lic/fetch", async (req, res) => {
  try {

    const { policyNumber } = req.body;

    // ✅ validation
    if(!policyNumber || policyNumber.length < 6){
      return res.json({ success: false, message: "Invalid policy number" });
    }

    // 🔥 FAKE DATA (API replaceable)
    const bill = {
      policyNumber,
      customerName: "Demo User",
      premiumAmount: Math.floor(Math.random() * 3000) + 500,
      dueDate: "10-04-2026"
    };

    return res.json({
      success: true,
      bill
    });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.post("/lic/pay", async (req, res) => {
  try {

    const { userId, policyNumber, amount } = req.body;

    const user = await User.findById(userId);

    if(!user){
      return res.json({ success: false, message: "User not found" });
    }

    if(user.wallet < amount){
      return res.json({ success: false, message: "Insufficient balance" });
    }

    const txnId = generateTxnId("LI");

    const txn = await Transaction.create({
      userId,
      txnId,
      type: "LIC Premium",
      amount,
      status: "pending",
      flow: "debit",
      balance: user.wallet,
      remark: "LIC Processing",

      details: {
        policyNumber
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
      txn.remark = "LIC Paid";

    } else {

      txn.status = "failed";
      txn.remark = "LIC Failed";
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

// ======================= LPG BOOKING =======================
router.post("/lpg/fetch", async (req, res) => {
  try {

    const { consumerNo, distributor } = req.body;

    if(!consumerNo || consumerNo.length < 5){
      return res.json({ success: false, message: "Invalid consumer number" });
    }

    if(!distributor){
      return res.json({ success: false, message: "Select distributor" });
    }

    // 🔥 FAKE DATA (API replaceable)
    const data = {
      consumerNo,
      distributor,
      customerName: "Demo User",
      cylinderPrice: Math.floor(Math.random()*500) + 900,
      subsidy: Math.floor(Math.random()*200),
      bookingDate: new Date().toLocaleDateString("en-IN")
    };

    return res.json({
      success: true,
      data
    });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.post("/lpg/book", async (req, res) => {
  try {

    const { userId, consumerNo, distributor, amount } = req.body;

    const user = await User.findById(userId);

    if(!user){
      return res.json({ success: false, message: "User not found" });
    }

    if(user.wallet < amount){
      return res.json({ success: false, message: "Insufficient balance" });
    }

    const txnId = generateTxnId("LP");

    const txn = await Transaction.create({
      userId,
      txnId,
      type: "LPG Booking",
      amount,
      status: "pending",
      flow: "debit",
      balance: user.wallet,
      remark: "LPG Booking Processing",

      consumerNo,
      operator: distributor
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
      txn.remark = "LPG Booked";

    }else{

      txn.status = "failed";
      txn.remark = "Booking Failed";
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