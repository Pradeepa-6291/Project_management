const Donation = require("../models/Donation");

const getDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    next(error);
  }
};

const addDonation = async (req, res, next) => {
  try {
    const payload = { ...req.body, donor: req.user?._id };
    const donation = await Donation.create(payload);
    res.status(201).json(donation);
  } catch (error) {
    next(error);
  }
};

const totalFunds = async (req, res, next) => {
  try {
    const result = await Donation.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    res.json({ totalFunds: result[0]?.total || 0 });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDonations, addDonation, totalFunds };
