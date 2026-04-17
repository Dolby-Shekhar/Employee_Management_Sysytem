const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "manager", "employee"], default: "employee" },
    position: String,
    salary: Number,
    department: String,
}, { timestamps: true });

module.exports = mongoose.model("Employee", employeeSchema);