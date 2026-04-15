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
      return res.status(400).send("User ID required");
    }

    const list = await Transaction.find({ userId }).sort({ createdAt: -1 });

    if (!list.length) {
      return res.status(400).send("No data");
    }

    const doc = new PDFDocument({ margin: 30, size: "A4" });

    // ✅ headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=NextSeva_Transactions.pdf"
    );

    doc.pipe(res);

    // 🔥 Title
    doc
      .fontSize(16)
      .text("NextSeva Transaction Report", { align: "center" });

    doc.moveDown(2);

    // 🔥 Table Header
    doc.fontSize(10).font("Helvetica-Bold");

    let startY = doc.y;

    doc.text("Date", 30, startY);
    doc.text("TXN ID", 120, startY);
    doc.text("Type", 240, startY);
    doc.text("Status", 340, startY);
    doc.text("Amount", 400, startY);
    doc.text("Balance", 470, startY);

    doc.moveDown();

    doc.font("Helvetica");

    // 🔥 Rows
    list.forEach(tx => {

      const date = tx.createdAt
        ? new Date(tx.createdAt).toLocaleString("en-IN")
        : "N/A";

      const status = tx.status === "failed" ? "Failed" : "Success";

      const y = doc.y;

      doc.text(date, 30, y, { width: 80 });
      doc.text(tx.txnId, 120, y, { width: 110 });
      doc.text(tx.type, 240, y, { width: 90 });
      doc.text(status, 340, y, { width: 60 });
      doc.text(String(tx.amount), 400, y, { width: 50 });
      doc.text(String(tx.balance), 470, y, { width: 50 });

      doc.moveDown();

      // 🔥 page break safety
      if (doc.y > 750) {
        doc.addPage();
      }
    });

    doc.end();

  } catch (err) {
    console.error("PDF ERROR:", err);
    res.status(500).send("PDF Error");
  }
});