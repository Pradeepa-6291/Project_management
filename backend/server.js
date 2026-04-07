const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const dashboardRoutes = require("./routes/dashboardRoutes");
const projectRoutes = require("./routes/projectRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const eventRoutes = require("./routes/eventRoutes");
const donationRoutes = require("./routes/donationRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (_req, res) => {
  res.json({ message: "Social Impact Project Management System API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", authMiddleware, dashboardRoutes);
app.use("/api/projects", authMiddleware, projectRoutes);
app.use("/api/volunteers", authMiddleware, volunteerRoutes);
app.use("/api/events", authMiddleware, eventRoutes);
app.use("/api/donations", authMiddleware, donationRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
