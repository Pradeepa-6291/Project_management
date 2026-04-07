const express = require("express");
const { getImpactSummary } = require("../controllers/impactController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/summary", protect, getImpactSummary);

module.exports = router;
