const mongoose = require("mongoose");
const Volunteer = require("../models/Volunteer");
const Project = require("../models/Project");
const asyncHandler = require("../utils/asyncHandler");

function parseSkills(raw) {
  if (!raw && raw !== 0) return [];
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : raw.split(",").map((s) => s.trim()).filter(Boolean);
    } catch {
      return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

function parseProjectIds(raw) {
  if (raw === undefined || raw === null || raw === "") return [];
  if (Array.isArray(raw)) return raw.filter(Boolean).map(String);
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

async function syncProjectsForVolunteer(volunteerId, projectIds) {
  const vid = new mongoose.Types.ObjectId(volunteerId);
  await Project.updateMany({ assignedVolunteers: vid }, { $pull: { assignedVolunteers: vid } });
  const ids = (projectIds || []).filter(Boolean).map((id) => new mongoose.Types.ObjectId(id));
  if (ids.length) {
    await Project.updateMany({ _id: { $in: ids } }, { $addToSet: { assignedVolunteers: vid } });
  }
}

exports.getVolunteers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const filter = q ? { $or: [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }] } : {};
  const volunteers = await Volunteer.find(filter).populate("projects").sort({ createdAt: -1 });
  res.json(volunteers);
});

exports.getVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await Volunteer.findById(req.params.id).populate("projects");
  if (!volunteer) {
    const err = new Error("Volunteer not found");
    err.statusCode = 404;
    throw err;
  }
  res.json(volunteer);
});

exports.createVolunteer = asyncHandler(async (req, res) => {
  const skills = parseSkills(req.body.skills);
  const projectIds = parseProjectIds(req.body.projectIds);
  const volunteer = await Volunteer.create({
    name: req.body.name,
    email: req.body.email,
    skills,
    participationHours: Number(req.body.participationHours) || 0,
    projects: projectIds,
  });
  await syncProjectsForVolunteer(volunteer._id, projectIds);
  const populated = await Volunteer.findById(volunteer._id).populate("projects");
  res.status(201).json(populated);
});

exports.updateVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await Volunteer.findById(req.params.id);
  if (!volunteer) {
    const err = new Error("Volunteer not found");
    err.statusCode = 404;
    throw err;
  }
  let projectIds = volunteer.projects.map((id) => id.toString());
  if (req.body.projectIds !== undefined) {
    projectIds = parseProjectIds(req.body.projectIds);
  }
  const updates = {
    name: req.body.name !== undefined ? req.body.name : volunteer.name,
    email: req.body.email !== undefined ? req.body.email : volunteer.email,
    skills: req.body.skills !== undefined ? parseSkills(req.body.skills) : volunteer.skills,
    participationHours:
      req.body.participationHours !== undefined
        ? Number(req.body.participationHours)
        : volunteer.participationHours,
    projects: projectIds,
  };
  await Volunteer.findByIdAndUpdate(req.params.id, updates, { runValidators: true });
  await syncProjectsForVolunteer(req.params.id, projectIds);
  const updated = await Volunteer.findById(req.params.id).populate("projects");
  res.json(updated);
});

exports.deleteVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await Volunteer.findById(req.params.id);
  if (!volunteer) {
    const err = new Error("Volunteer not found");
    err.statusCode = 404;
    throw err;
  }
  await Project.updateMany({ assignedVolunteers: volunteer._id }, { $pull: { assignedVolunteers: volunteer._id } });
  await volunteer.deleteOne();
  res.json({ message: "Volunteer deleted" });
});
