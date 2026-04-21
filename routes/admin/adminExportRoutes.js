const express = require("express");
const router = express.Router();

const ExcelJS = require("exceljs");

// 📥 ADMIN EXPORT EXCEL
router.post("/excel", async (req, res) => {
  try {

    const data = req.body.data || [];

    if (!data.length) {
      return res.status(400).json({
        success: false,
        message: "No data"
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Admin Transactions");

    // 🔥 HEADER
    worksheet.columns = [
      { header: "Txn ID", key: "txnId", width: 25 },
      { header: "Type", key: "type", width: 20 },
      { header: "Amount", key: "amount", width: 12 },
      { header: "Status", key: "status", width: 12 },
      { header: "Flow", key: "flow", width: 10 },
      { header: "Date", key: "date", width: 15 },

      { header: "Retailer ID", key: "retailerId", width: 20 },
      { header: "Retailer Name", key: "name", width: 25 },
      { header: "Mobile", key: "mobile", width: 15 },

      { header: "Opening Bal", key: "opening", width: 15 },
      { header: "Closing Bal", key: "closing", width: 15 },

      { header: "Remark", key: "remark", width: 30 }
    ];

    // 🔥 DATA
    data.forEach(tx => {

      const openingBal = tx.flow === "credit"
        ? tx.balance - tx.amount
        : tx.balance + tx.amount;

      worksheet.addRow({
        txnId: tx.txnId,
        type: tx.type,
        amount: tx.amount,
        status: tx.status,
        flow: tx.flow,
        date: new Date(tx.createdAt).toLocaleDateString(),

        retailerId: tx.userId?.retailerId || "-",
        name: tx.userId?.name || "-",
        mobile: tx.userId?.mobile || "-",

        opening: openingBal,
        closing: tx.balance,

        remark: tx.remark || "-"
      });

    });

    worksheet.getRow(1).font = { bold: true };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=admin-transactions.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("Admin Export Error:", err);
    res.status(500).json({
      success: false,
      message: "Export failed"
    });
  }
});

module.exports = router;