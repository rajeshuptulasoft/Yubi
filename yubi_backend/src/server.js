const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();
const { ensureCoreTables } = require("./config/db_init");

const foodRoutes = require("./routes/food");
const adminRoutes = require("./routes/admin");
const deliveryPartnerRoutes = require("./routes/deliveryPartner");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN ? process.env.FRONTEND_ORIGIN.split(",") : true,
    credentials: true
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve(process.cwd(), "..", "uploads")));

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "Yubi backend is running" });
});

app.use("/api/food", foodRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/delivery-partner", deliveryPartnerRoutes);

app.use((error, _req, res, _next) => {
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    error: error.message
  });
});

const port = Number(process.env.PORT || 4000);

async function startServer() {
  try {
    await ensureCoreTables();
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Yubi backend running on port ${port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
