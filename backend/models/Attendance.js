const mongoose = require("mongoose");


const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  clockIn: { type: Date },
  clockOut: { type: Date },
  date: { type: Date, required: true },
  late: { type: Boolean, default: false },
  earlyLeave: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);