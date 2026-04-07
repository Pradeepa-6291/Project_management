const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    skills: [{ type: String }],
    participationHours: { type: Number, default: 0 },
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Volunteer", volunteerSchema);
