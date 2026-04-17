const mongoose = require("mongoose");

const performanceReviewSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  period: {
    quarter: { type: String, enum: ["Q1", "Q2", "Q3", "Q4"], required: true },
    year: { type: Number, required: true }
  },
  scores: {
    productivity: { type: Number, min: 0, max: 10 },
    teamwork: { type: Number, min: 0, max: 10 },
    quality: { type: Number, min: 0, max: 10 },
    initiative: { type: Number, min: 0, max: 10 }
  },
  averageScore: { type: Number, min: 0, max: 10 },
  comments: String,
  goals: String,
  status: {
    type: String,
    enum: ["draft", "submitted", "reviewed", "finalized"],
    default: "draft"
  },
  submittedAt: Date,
  reviewedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("PerformanceReview", performanceReviewSchema);
