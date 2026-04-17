const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  period: {
    month: { type: Number, required: true }, // 1-12
    year: { type: Number, required: true }
  },
  baseSalary: { type: Number, required: true },
  workedDays: Number,
  paidDays: Number,
  overtimeHours: Number,
  overtimeRate: Number,
  deductions: [{
    type: String,
    amount: Number
  }],
  bonuses: [{
    type: String,
    amount: Number
  }],
  totalEarnings: Number,
  totalDeductions: Number,
  netPay: Number,
  status: {
    type: String,
    enum: ["draft", "generated", "paid"],
    default: "draft"
  },
  paidAt: Date,
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee"
  }
}, { timestamps: true });

module.exports = mongoose.model("Payroll", payrollSchema);
