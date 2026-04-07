const express = require("express");
const {
  getVolunteers,
  addVolunteer,
  updateVolunteer,
} = require("../controllers/volunteerController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getVolunteers);
router.post("/", protect, authorizeRoles("Admin"), addVolunteer);
router.put("/:id", protect, authorizeRoles("Admin"), updateVolunteer);

module.exports = router;
