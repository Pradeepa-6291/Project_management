const mongoose = require("mongoose");
const Project = require("../models/Project");
const Volunteer = require("../models/Volunteer");
const asyncHandler = require("../utils/asyncHandler");

function parseAssignedVolunteers(raw) {
  if (raw === undefined || raw === null || raw === "") return [];
  if (Array.isArray(raw)) return raw.filter(Boolean).map(String);
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

async function syncVolunteersForProject(projectId, assignedIds) {
  const pid = new mongoose.Types.ObjectId(projectId);
  await Volunteer.updateMany({ projects: pid }, { $pull: { projects: pid } });
  const ids = (assignedIds || []).filter(Boolean).map((id) => new mongoose.Types.ObjectId(id));
  if (ids.length) {
    await Volunteer.updateMany({ _id: { $in: ids } }, { $addToSet: { projects: pid } });
  }
}

exports.getProjects = asyncHandler(async (req, res) => {
  const { q, status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (q) {
    filter.$or = [{ title: new RegExp(q, "i") }, { description: new RegExp(q, "i") }];
  }
  const projects = await Project.find(filter).populate("assignedVolunteers").sort({ createdAt: -1 });
  res.json(projects);
});

exports.getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate("assignedVolunteers");
  if (!project) {
    const err = new Error("Project not found");
    err.statusCode = 404;
    throw err;
  }
  res.json(project);
});

exports.createProject = asyncHandler(async (req, res) => {
  const assignedVolunteers = parseAssignedVolunteers(req.body.assignedVolunteers);
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";
  const project = await Project.create({
    title: req.body.title,
    description: req.body.description || "",
    status: req.body.status || "Pending",
    deadline: req.body.deadline || undefined,
    imageUrl,
    assignedVolunteers,
  });
  await syncVolunteersForProject(project._id, assignedVolunteers);
  const populated = await Project.findById(project._id).populate("assignedVolunteers");
  res.status(201).json(populated);
});

exports.updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    const err = new Error("Project not found");
    err.statusCode = 404;
    throw err;
  }

  let assignedVolunteers = project.assignedVolunteers.map((id) => id.toString());
  if (req.body.assignedVolunteers !== undefined) {
    assignedVolunteers = parseAssignedVolunteers(req.body.assignedVolunteers);
  }

  const updates = {
    title: req.body.title !== undefined ? req.body.title : project.title,
    description: req.body.description !== undefined ? req.body.description : project.description,
    status: req.body.status !== undefined ? req.body.status : project.status,
    deadline: req.body.deadline !== undefined ? req.body.deadline || null : project.deadline,
    assignedVolunteers,
  };
  if (req.file) updates.imageUrl = `/uploads/${req.file.filename}`;

  const updated = await Project.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).populate(
    "assignedVolunteers"
  );
  await syncVolunteersForProject(req.params.id, assignedVolunteers);
  res.json(updated);
});

exports.deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    const err = new Error("Project not found");
    err.statusCode = 404;
    throw err;
  }
  await Volunteer.updateMany({ projects: project._id }, { $pull: { projects: project._id } });
  await project.deleteOne();
  res.json({ message: "Project deleted" });
});
