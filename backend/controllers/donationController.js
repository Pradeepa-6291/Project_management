const Donation = require("../models/Donation");
const asyncHandler = require("../utils/asyncHandler");

exports.getDonations = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const filter = q ? { donor: new RegExp(q, "i") } : {};
  const [donations, totalAgg] = await Promise.all([
    Donation.find(filter).sort({ createdAt: -1 }),
    Donation.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
  ]);
  const total = totalAgg[0]?.total || 0;
  res.json({ donations, total });
});

exports.getDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id);
  if (!donation) {
    const err = new Error("Donation not found");
    err.statusCode = 404;
    throw err;
  }
  res.json(donation);
});

exports.createDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.create({
    donor: req.body.donor,
    amount: Number(req.body.amount),
    date: req.body.date ? new Date(req.body.date) : new Date(),
    note: req.body.note || "",
  });
  res.status(201).json(donation);
});

exports.updateDonation = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (body.amount !== undefined) body.amount = Number(body.amount);
  if (body.date) body.date = new Date(body.date);
  const donation = await Donation.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
  if (!donation) {
    const err = new Error("Donation not found");
    err.statusCode = 404;
    throw err;
  }
  res.json(donation);
});

exports.deleteDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findByIdAndDelete(req.params.id);
  if (!donation) {
    const err = new Error("Donation not found");
    err.statusCode = 404;
    throw err;
  }
  res.json({ message: "Donation deleted" });
});
