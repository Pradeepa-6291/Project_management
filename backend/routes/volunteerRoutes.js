const express = require("express");
const volunteerController = require("../controllers/volunteerController");

const router = express.Router();

router.get("/", volunteerController.getVolunteers);
router.get("/:id", volunteerController.getVolunteer);
router.post("/", volunteerController.createVolunteer);
router.put("/:id", volunteerController.updateVolunteer);
router.delete("/:id", volunteerController.deleteVolunteer);

module.exports = router;
