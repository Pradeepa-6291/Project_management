const Event = require("../models/Event");

const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find().populate("attendees", "name email");
    res.json(events);
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.title = req.body.title ?? event.title;
    event.date = req.body.date ?? event.date;
    event.location = req.body.location ?? event.location;
    event.description = req.body.description ?? event.description;
    event.attendees = req.body.attendees ?? event.attendees;
    const updated = await event.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = { getEvents, createEvent, updateEvent };
