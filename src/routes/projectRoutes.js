const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  assignVolunteers,
} = require("../controllers/projectController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads"),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({ storage });

router.get("/", protect, getProjects);
router.post(
  "/",
  protect,
  authorizeRoles("Admin"),
  upload.single("image"),
  createProject
);
router.put(
  "/:id",
  protect,
  authorizeRoles("Admin"),
  upload.single("image"),
  updateProject
);
router.delete("/:id", protect, authorizeRoles("Admin"), deleteProject);
router.put("/:id/assign", protect, authorizeRoles("Admin"), assignVolunteers);

module.exports = router;
