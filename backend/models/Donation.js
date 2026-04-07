const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donor: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    note: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);
