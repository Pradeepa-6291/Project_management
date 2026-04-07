const Project = require("../models/Project");
const Volunteer = require("../models/Volunteer");
const Donation = require("../models/Donation");

const getImpactSummary = async (req, res, next) => {
  try {
    const [totalProjects, totalVolunteers, donationAgg, projectStatusAgg] =
      await Promise.all([
        Project.countDocuments(),
        Volunteer.countDocuments(),
        Donation.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
        Project.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      ]);

    res.json({
      totalProjects,
      totalVolunteers,
      totalDonations: donationAgg[0]?.total || 0,
      projectStatus: projectStatusAgg,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getImpactSummary };
