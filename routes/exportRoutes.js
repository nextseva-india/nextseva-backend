const express = require("express");
const router = express.Router();

const Transaction = require("../models/Transaction");
const XLSX = require("xlsx");

// 📊 EXPORT EXCEL
router.post("/excel", async (req, res) => {
  try {

    const { userId } = req.body;

    if (!userId) {
      return res.json({ status: "fail", message: "User ID required" });
    }

    const list = await Transaction.find({ userId }).sort({ createdAt: -1 });

    if (!list.length) {
      return res.json({ status: "fail", message: "No data" });
    }

    // 🔥 format data
    const data = list.map(tx => ({
      Date: new Date(tx.createdAt).toLocaleString("en-IN"),
      TXN_ID: tx.txnId,
      Type: tx.type,
      Status: tx.status === "failed" ? "Failed" : "Success",
      Amount: tx.amount,
      Balance: tx.balance,
      Mobile: tx.mobile || "",
      Operator: tx.operator || "",
      Remark: tx.remark || ""
    }));

    // 🔥 create excel
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Transactions");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // 🔥 response headers
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=NextSeva_Transactions.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);

  } catch (err) {
    console.error("EXPORT ERROR:", err);
    res.json({ status: "fail" });
  }
});

module.exports = router;