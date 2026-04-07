const Project = require("../models/Project");
const Volunteer = require("../models/Volunteer");
const Donation = require("../models/Donation");
const asyncHandler = require("../utils/asyncHandler");

exports.getSummary = asyncHandler(async (_req, res) => {
  const [totalProjects, totalVolunteers, donationAgg, statusAgg, recentDonations, monthlyDonations] =
    await Promise.all([
      Project.countDocuments(),
      Volunteer.countDocuments(),
      Donation.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
      Project.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Donation.find().sort({ createdAt: -1 }).limit(8).lean(),
      (async () => {
        const start = new Date();
        start.setMonth(start.getMonth() - 6);
        return Donation.aggregate([
          { $match: { date: { $gte: start } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
              total: { $sum: "$amount" },
            },
          },
          { $sort: { _id: 1 } },
        ]);
      })(),
    ]);

  const totalDonations = donationAgg[0]?.total || 0;
  const projectStatusChart = statusAgg.map((s) => ({
    name: s._id || "Unknown",
    value: s.count,
  }));

  const donationTrend =
    monthlyDonations.length > 0
      ? monthlyDonations.map((m) => ({ name: m._id, impact: m.total }))
      : [{ name: "No data", impact: 0 }];

  res.json({
    totals: {
      projects: totalProjects,
      volunteers: totalVolunteers,
      donations: totalDonations,
    },
    charts: {
      projectStatus: projectStatusChart.length ? projectStatusChart : [{ name: "None", value: 0 }],
      donationTrend,
    },
    recentDonations,
  });
});
