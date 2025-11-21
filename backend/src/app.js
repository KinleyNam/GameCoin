const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const tokenRoutes = require("./routes/token");

const app = express();
app.use(helmet());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/token", tokenRoutes);

module.exports = app;
