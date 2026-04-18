const express = require("express");
const router = express.Router();

const Transaction = require("../models/Transaction");
const XLSX = require("xlsx");
const PDFDocument = require("pdfkit");


// ================= FILTER BUILDER =================
function buildFilter(body){

  const {
    userId,
    txnId,
    type,
    status,
    amount,
    dateType,
    fromDate,
    toDate
  } = body;

  // 🔥 normalize (MOST IMPORTANT)
  const dt = (dateType || "").toLowerCase();
  const st = (status || "").toLowerCase();

  let query = { userId };

  // TXN ID
  if (txnId && txnId.trim() !== "") {
    query.txnId = { $regex: txnId.trim(), $options: "i" };
  }

  // TYPE
  if (type && type !== "") {
    query.type = type;
  }

  // STATUS
  if (st && st !== "all") {
    query.status = st;
  }

  // AMOUNT
  if (amount && !isNaN(amount)) {
    query.amount = { $gte: Number(amount) };
  }

  // DATE FILTER

  if (dt === "today") {
    const start = new Date();
    start.setHours(0,0,0,0);

    const end = new Date();
    end.setHours(23,59,59,999);

    query.createdAt = { $gte: start, $lte: end };
  }

  if (dt === "yesterday") {
    const start = new Date();
    start.setDate(start.getDate() - 1);
    start.setHours(0,0,0,0);

    const end = new Date();
    end.setDate(end.getDate() - 1);
    end.setHours(23,59,59,999);

    query.createdAt = { $gte: start, $lte: end };
  }

  if (dt === "week") {
    const past = new Date();
    past.setDate(past.getDate() - 7);

    query.createdAt = { $gte: past };
  }

  if (dt === "custom" && fromDate && toDate) {
    const start = new Date(fromDate);
    const end = new Date(toDate);

    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);

    query.createdAt = { $gte: start, $lte: end };
  }

  return query;
}



// ================= EXCEL EXPORT =================
router.post("/excel", async (req, res) => {
  try {

    const query = buildFilter(req.body);
    console.log("EXCEL QUERY:", query); // debug

    const list = await Transaction.find(query).sort({ createdAt: -1 });

    if (!list.length) {
      return res.status(400).send("No data found");
    }

    const formatted = list.map(tx => ({
      Date: tx.createdAt
        ? new Date(tx.createdAt).toLocaleString("en-IN")
        : "",
      TXN_ID: tx.txnId || "",
      Type: tx.type || "",
      Status: tx.status === "failed" ? "Failed" : "Success",
      Amount: tx.amount || 0,
      Balance: tx.balance || 0,
      Mobile: tx.mobile || "",
      Operator: tx.operator || "",
      Remark: tx.remark || ""
    }));

    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");

    const buffer = XLSX.write(wb, {
      type: "buffer",
      bookType: "xlsx"
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=NextSeva_Transactions.xlsx"
    );

    res.status(200).end(buffer);

  } catch (err) {
    console.error("EXCEL ERROR:", err);
    res.status(500).send("Excel Export Failed");
  }
});



// ================= PDF EXPORT =================
router.post("/pdf", async (req, res) => {
  try {

    const query = buildFilter(req.body);
    console.log("PDF QUERY:", query); // debug

    const list = await Transaction.find(query).sort({ createdAt: -1 });

    if (!list.length) {
      return res.status(400).send("No data");
    }

    const doc = new PDFDocument({ margin: 30, size: "A4" });

    const chunks = [];

    doc.on("data", chunk => chunks.push(chunk));

    doc.on("end", () => {
      const result = Buffer.concat(chunks);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=NextSeva_Transactions.pdf"
      );

      res.status(200).end(result);
    });

    // ===== CONTENT =====

    doc.fontSize(12).text("NextSeva Transaction Report", { align: "center" });
    doc.moveDown(1);

    doc.fontSize(8).font("Helvetica-Bold");

    const drawHeader = () => {
      const y = doc.y;
      doc.text("Date", 30, y);
      doc.text("TXN ID", 140, y);
      doc.text("Type", 280, y);
      doc.text("Status", 370, y);
      doc.text("Amount", 430, y);
      doc.text("Balance", 480, y);
      doc.moveDown(0.6);
    };

    drawHeader();

    doc.fontSize(7).font("Helvetica");

    list.forEach(tx => {

      const date = tx.createdAt
        ? new Date(tx.createdAt).toLocaleString("en-IN").replace(",", "")
        : "N/A";

      const statusText = tx.status === "failed" ? "Failed" : "Success";

      const y = doc.y;

      doc.text(date, 30, y, { width: 105, lineBreak: false });
      doc.text(tx.txnId, 140, y, { width: 130, lineBreak: false });
      doc.text(tx.type, 280, y, { width: 85, lineBreak: false });
      doc.text(statusText, 370, y, { width: 50, lineBreak: false });
      doc.text(String(tx.amount), 430, y, { width: 40, lineBreak: false });
      doc.text(String(tx.balance), 480, y, { width: 40, lineBreak: false });

      doc.moveDown(0.6);

      if (doc.y > 750) {
        doc.addPage();
        doc.fontSize(8).font("Helvetica-Bold");
        drawHeader();
        doc.fontSize(7).font("Helvetica");
      }
    });

    doc.end();

  } catch (err) {
    console.error("PDF ERROR:", err);
    res.status(500).send("PDF Error");
  }
});


module.exports = router;