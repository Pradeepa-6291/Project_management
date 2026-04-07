const User = require("../models/User");

const getProfile = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name ?? user.name;
    user.phone = req.body.phone ?? user.phone;
    user.bio = req.body.bio ?? user.bio;
    const updated = await user.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const role = req.user.role;
    const messageByRole = {
      Admin: "Admin dashboard loaded",
      Volunteer: "Volunteer dashboard loaded",
      Donor: "Donor dashboard loaded",
    };
    res.json({ role, message: messageByRole[role] || "Dashboard loaded" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, getDashboard };
