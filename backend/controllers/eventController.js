const Event = require("../models/Event");
const asyncHandler = require("../utils/asyncHandler");

exports.getEvents = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const filter = q
    ? {
        $or: [
          { title: new RegExp(q, "i") },
          { location: new RegExp(q, "i") },
          { description: new RegExp(q, "i") },
        ],
      }
    : {};
  const events = await Event.find(filter).sort({ date: 1 });
  res.json(events);
});

exports.getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    const err = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }
  res.json(event);
});

exports.createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({
    title: req.body.title,
    date: req.body.date,
    location: req.body.location,
    description: req.body.description || "",
  });
  res.status(201).json(event);
});

exports.updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!event) {
    const err = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }
  res.json(event);
});

exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) {
    const err = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }
  res.json({ message: "Event deleted" });
});
