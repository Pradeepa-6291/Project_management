const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const eventRoutes = require("./routes/eventRoutes");
const donationRoutes = require("./routes/donationRoutes");
const impactRoutes = require("./routes/impactRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/impact", impactRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
