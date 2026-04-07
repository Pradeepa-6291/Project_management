const Volunteer = require("../models/Volunteer");

const getVolunteers = async (req, res, next) => {
  try {
    const volunteers = await Volunteer.find().populate("user", "name email role");
    res.json(volunteers);
  } catch (error) {
    next(error);
  }
};

const addVolunteer = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.create(req.body);
    res.status(201).json(volunteer);
  } catch (error) {
    next(error);
  }
};

const updateVolunteer = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });

    volunteer.skills = req.body.skills ?? volunteer.skills;
    volunteer.assignedTasks = req.body.assignedTasks ?? volunteer.assignedTasks;
    volunteer.participationHours =
      req.body.participationHours ?? volunteer.participationHours;

    const updated = await volunteer.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = { getVolunteers, addVolunteer, updateVolunteer };
