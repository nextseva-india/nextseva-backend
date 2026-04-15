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



const PDFDocument = require("pdfkit");

// 📄 EXPORT PDF
router.post("/pdf", async (req, res) => {
  try {

    const { userId } = req.body;

    if (!userId) {
      return res.json({ status: "fail", message: "User ID required" });
    }

    const list = await Transaction.find({ userId }).sort({ createdAt: -1 });

    if (!list.length) {
      return res.json({ status: "fail", message: "No data" });
    }

    const doc = new PDFDocument({ margin: 30, size: "A4" });

    // 🔥 headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=NextSeva_Transactions.pdf"
    );

    doc.pipe(res);

    // 🔥 Title
    doc.fontSize(16).text("NextSeva Transaction Report", { align: "center" });
    doc.moveDown();

    // 🔥 Table Header
    doc.fontSize(10);
    doc.text("Date", 30, doc.y);
    doc.text("TXN ID", 110, doc.y);
    doc.text("Type", 220, doc.y);
    doc.text("Status", 320, doc.y);
    doc.text("Amount", 380, doc.y);
    doc.text("Balance", 450, doc.y);

    doc.moveDown();

    // 🔥 Rows
    list.forEach(tx => {

      const date = tx.createdAt
        ? new Date(tx.createdAt).toLocaleString("en-IN")
        : "N/A";

      const status = tx.status === "failed" ? "Failed" : "Success";

      doc.text(date, 30, doc.y);
      doc.text(tx.txnId, 110, doc.y);
      doc.text(tx.type, 220, doc.y);
      doc.text(status, 320, doc.y);
      doc.text(tx.amount.toString(), 380, doc.y);
      doc.text(tx.balance.toString(), 450, doc.y);

      doc.moveDown();
    });

    doc.end();

  } catch (err) {
    console.error("PDF ERROR:", err);
    res.json({ status: "fail" });
  }
});