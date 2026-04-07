const express = require("express");
const {
  getDonations,
  addDonation,
  totalFunds,
} = require("../controllers/donationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getDonations);
router.post("/", protect, addDonation);
router.get("/total", protect, totalFunds);

module.exports = router;
