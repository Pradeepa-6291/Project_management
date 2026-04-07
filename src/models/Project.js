const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Ongoing", "Completed"],
      default: "Pending",
    },
    volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
