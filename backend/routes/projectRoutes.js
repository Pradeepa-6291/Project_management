const express = require("express");
const { upload } = require("../middleware/upload");
const projectController = require("../controllers/projectController");

const router = express.Router();

router.get("/", projectController.getProjects);
router.get("/:id", projectController.getProject);
router.post("/", upload.single("image"), projectController.createProject);
router.put("/:id", upload.single("image"), projectController.updateProject);
router.delete("/:id", projectController.deleteProject);

module.exports = router;
