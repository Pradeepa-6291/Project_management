const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Ongoing", "Completed"],
      default: "Pending",
    },
    deadline: { type: Date },
    imageUrl: { type: String, default: "" },
    assignedVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Volunteer" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
