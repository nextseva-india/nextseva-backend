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

    // 🔥 TITLE (compact)
    doc
      .fontSize(12)
      .text("NextSeva Transaction Report", { align: "center" });

    doc.moveDown(1);

    // 🔥 HEADER
    doc.fontSize(8).font("Helvetica-Bold");

    const headerY = doc.y;

    doc.text("Date", 30, headerY);
    doc.text("TXN ID", 140, headerY);
    doc.text("Type", 280, headerY);
    doc.text("Status", 370, headerY);
    doc.text("Amount", 430, headerY);
    doc.text("Balance", 480, headerY);

    doc.moveDown(0.6);

    // 🔥 ROWS
    doc.fontSize(7).font("Helvetica");

    list.forEach(tx => {

      // 👉 single line clean date
      const date = tx.createdAt
        ? new Date(tx.createdAt).toLocaleString("en-IN").replace(",", "")
        : "N/A";

      const status = tx.status === "failed" ? "Failed" : "Success";

      const y = doc.y;

      // ❗ NO WRAP ANYWHERE
      doc.text(date, 30, y, {
        width: 105,
        lineBreak: false
      });

      doc.text(tx.txnId, 140, y, {
        width: 130,
        lineBreak: false
      });

      doc.text(tx.type, 280, y, {
        width: 85,
        lineBreak: false
      });

      doc.text(status, 370, y, {
        width: 50,
        lineBreak: false
      });

      doc.text(String(tx.amount), 430, y, {
        width: 40,
        lineBreak: false
      });

      doc.text(String(tx.balance), 480, y, {
        width: 40,
        lineBreak: false
      });

      doc.moveDown(0.6);

      // 🔥 PAGE BREAK + HEADER REPEAT
      if (doc.y > 750) {
        doc.addPage();

        doc.fontSize(8).font("Helvetica-Bold");

        const newY = doc.y;

        doc.text("Date", 30, newY);
        doc.text("TXN ID", 140, newY);
        doc.text("Type", 280, newY);
        doc.text("Status", 370, newY);
        doc.text("Amount", 430, newY);
        doc.text("Balance", 480, newY);

        doc.moveDown(0.6);

        doc.fontSize(7).font("Helvetica");
      }
    });

    doc.end();

  } catch (err) {
    console.error("PDF ERROR:", err);
    res.status(500).send("PDF Error");
  }
});