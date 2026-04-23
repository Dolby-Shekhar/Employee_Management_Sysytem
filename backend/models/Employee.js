const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
role: { type: String, enum: ["admin", "manager", "employee"], default: "employee" },
    status: { type: String, enum: ["pending", "approved"], default: "pending" },
    position: String,
    salary: Number,
    department: String,
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
}, { timestamps: true });

module.exports = mongoose.model("Employee", employeeSchema);