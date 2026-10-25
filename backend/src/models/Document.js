const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [120, "Title must be at most 120 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must be at most 500 characters"],
      default: "",
    },
    branch: {
      type: String,
      required: [true, "Branch is required"],
      trim: true,
      uppercase: true,
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: [1, "Semester must be between 1 and 8"],
      max: [8, "Semester must be between 1 and 8"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    year: {
      type: Number,
      min: [2000, "Year is not valid"],
      max: [2100, "Year is not valid"],
    },
    type: {
      type: String,
      enum: ["paper", "notes"],
      required: [true, "Type must be paper or notes"],
    },
    fileUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    fileSize: { type: Number },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    downloads: { type: Number, default: 0 },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Speeds up the main browse/filter query
documentSchema.index({ status: 1, branch: 1, semester: 1, subject: 1 });

module.exports = mongoose.model("Document", documentSchema);