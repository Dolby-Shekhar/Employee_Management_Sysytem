const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  type: {
    type: String,
    enum: ["Sick", "Casual", "Annual", "Emergency"],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  days: {
    type: Number,
    required: true
  },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee"
  },
  approvedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Leave", leaveSchema);
