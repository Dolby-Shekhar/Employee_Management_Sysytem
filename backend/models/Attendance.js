const mongoose = require("mongoose");


const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  clockIn: { 
    time: { type: Date },
    location: { 
      lat: { type: Number },
      lng: { type: Number },
      accuracy: { type: Number }
    }
  },
  clockOut: { 
    time: { type: Date },
    location: { 
      lat: { type: Number },
      lng: { type: Number },
      accuracy: { type: Number }
    }
  },
  date: { type: Date, required: true },
  late: { type: Boolean, default: false },
  earlyLeave: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);