require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const fs = require("fs");
const https = require("https");

const sslOptions = {
  key: fs.readFileSync("./certs/localhost-key.pem"),
  cert: fs.readFileSync("./certs/localhost.pem"),
};

const { morganMiddleware } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/users");

const { globalLimiter } = require("./middleware/rateLimit");

const app = express();

app.use(express.json());
app.use(cookieParser());

// Logging
app.use(morganMiddleware);

// CORS - allow credentials for cookies
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "https://localhost:5173",
  credentials: true
}));

// Rate limiting (global)
app.use(globalLimiter);

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Error handler (last)
app.use(errorHandler);

// Connect to MongoDB first, then start HTTPS server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    const PORT = process.env.PORT || 5000;
    https.createServer(sslOptions, app).listen(PORT, () => {
      console.log(`HTTPS server running on https://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("Failed to connect to DB:", err);
    process.exit(1);
  });
