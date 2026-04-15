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

    // 🔥 Title (smaller + clean)
    doc
      .fontSize(13)
      .text("NextSeva Transaction Report", { align: "center" });

    doc.moveDown(1);

    // 🔥 Header
    doc.fontSize(9).font("Helvetica-Bold");

    const headerY = doc.y;

    doc.text("Date", 30, headerY);
    doc.text("TXN ID", 130, headerY);
    doc.text("Type", 270, headerY);
    doc.text("Status", 360, headerY);
    doc.text("Amount", 420, headerY);
    doc.text("Balance", 480, headerY);

    doc.moveDown(0.5);

    // 🔥 Rows
    doc.fontSize(8).font("Helvetica");

    list.forEach(tx => {

      // 👉 single line date
      const date = tx.createdAt
        ? new Date(tx.createdAt).toLocaleString("en-IN").replace(",", "")
        : "N/A";

      const status = tx.status === "failed" ? "Failed" : "Success";

      const y = doc.y;

      doc.text(date, 30, y, { width: 95 });
      doc.text(tx.txnId, 130, y, { width: 130 });
      doc.text(tx.type, 270, y, { width: 85 });
      doc.text(status, 360, y, { width: 55 });
      doc.text(String(tx.amount), 420, y, { width: 50 });
      doc.text(String(tx.balance), 480, y, { width: 50 });

      doc.moveDown(0.5);

      // 🔥 page break
      if (doc.y > 750) {
        doc.addPage();

        // 👉 header repeat after page break
        doc.fontSize(9).font("Helvetica-Bold");

        const newY = doc.y;

        doc.text("Date", 30, newY);
        doc.text("TXN ID", 130, newY);
        doc.text("Type", 270, newY);
        doc.text("Status", 360, newY);
        doc.text("Amount", 420, newY);
        doc.text("Balance", 480, newY);

        doc.moveDown(0.5);

        doc.fontSize(8).font("Helvetica");
      }
    });

    doc.end();

  } catch (err) {
    console.error("PDF ERROR:", err);
    res.status(500).send("PDF Error");
  }
});