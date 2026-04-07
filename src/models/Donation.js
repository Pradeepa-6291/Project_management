const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    donorName: { type: String, required: true },
    donorEmail: { type: String, required: true },
    amount: { type: Number, required: true, min: 1 },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);
