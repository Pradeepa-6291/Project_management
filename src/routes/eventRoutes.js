const express = require("express");
const {
  getEvents,
  createEvent,
  updateEvent,
} = require("../controllers/eventController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getEvents);
router.post("/", protect, authorizeRoles("Admin"), createEvent);
router.put("/:id", protect, authorizeRoles("Admin"), updateEvent);

module.exports = router;
