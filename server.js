require("dotenv").config(); // 🔥 MUST ADD (env load)

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const app = express();

// 🔥 DB connect
connectDB();

// 🔥 middleware
app.use(cors());
app.use(express.json());

// 🔥 Routes
app.use("/api", require("./routes/authRoutes"));
app.use("/api", require("./routes/profileRoutes"));
app.use("/api", require("./routes/serviceRoutes"));
app.use("/api/wallet", require("./routes/walletRoutes"));
app.use("/api/transaction", require("./routes/transactionRoutes"));
app.use("/api/export", require("./routes/exportRoutes"));

// 🔥 Test route
app.get("/", (req, res) => {
  res.send("NextSeva Backend Running 🚀");
});

// 🔥 PORT (IMPORTANT for deploy)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


//================================= FOR ADMIN PANEL ===============================================
const adminAuthRoutes = require("./routes/admin/adminAuthRoutes");
app.use("/api/admin", adminAuthRoutes);

const adminUserRoutes = require("./routes/admin/adminUserRoutes");
app.use("/api/admin", adminUserRoutes);

const adminExportRoutes = require("./routes/admin/adminExportRoutes");
app.use("/api/admin/export", adminExportRoutes);

const adminServiceRoutes = require("./routes/admin/adminServiceRoutes");
app.use("/api/admin", adminServiceRoutes);

const adminNoticeRoutes = require("./routes/admin/adminNoticeRoutes");
app.use("/api/admin", adminNoticeRoutes);