const Project = require("../models/Project");

const getProjects = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.search) query.title = { $regex: req.query.search, $options: "i" };

    const projects = await Project.find(query).populate("volunteers", "name email role");
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const project = await Project.create({
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      image: req.file ? `/uploads/${req.file.filename}` : "",
    });
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.title = req.body.title ?? project.title;
    project.description = req.body.description ?? project.description;
    project.status = req.body.status ?? project.status;
    if (req.file) project.image = `/uploads/${req.file.filename}`;
    const updated = await project.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    await project.deleteOne();
    res.json({ message: "Project deleted" });
  } catch (error) {
    next(error);
  }
};

const assignVolunteers = async (req, res, next) => {
  try {
    const { volunteerIds } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    project.volunteers = volunteerIds || [];
    const updated = await project.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  assignVolunteers,
};
