const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    skills: [{ type: String }],
    assignedTasks: [{ type: String }],
    participationHours: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Volunteer", volunteerSchema);
