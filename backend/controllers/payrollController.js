const Payroll = require("../models/Payroll");
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

// Generate Payroll for Employee
exports.generatePayroll = async (req, res) => {
  try {
    const { month, year } = req.params;
    const employeeId = req.user.id;

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    // Get attendance for period
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendanceRecords = await Attendance.find({
      "user._id": employeeId,
      date: { $gte: startDate, $lte: endDate }
    });

    const workedDays = attendanceRecords.length;
    const paidDays = attendanceRecords.filter(r => r.clockIn && r.clockOut).length;

    // Calculate payroll
    const baseSalary = employee.salary;
    const dailyRate = baseSalary / 30;
    const grossPay = paidDays * dailyRate;

    const payroll = new Payroll({
      employeeId,
      period: { month: parseInt(month), year: parseInt(year) },
      baseSalary,
      workedDays,
      paidDays,
      totalEarnings: grossPay,
      netPay: grossPay,
      generatedBy: req.user.id
    });

    await payroll.save();
    await payroll.populate("employeeId generatedBy", "name email");

    res.status(201).json({ message: "Payroll generated", payroll });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get My Payroll History
exports.getMyPayroll = async (req, res) => {
  try {
    const payrolls = await Payroll.find({ 
      employeeId: req.user.id 
    }).populate("generatedBy", "name")
      .sort({ "period.year": -1, "period.month": -1 });
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Team Payroll (Manager/Admin)
exports.getTeamPayroll = async (req, res) => {
  try {
    let match = {};
    if (req.user.role === 'manager') {
      match.managerId = req.user.id;
    }

    const employees = await Employee.find({ ...match, status: 'approved' });
    const employeeIds = employees.map(e => e._id);

    const payrolls = await Payroll.find({
      employeeId: { $in: employeeIds }
    }).populate("employeeId", "name email salary");

    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark Payroll as Paid
exports.markPaid = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) return res.status(404).json({ error: "Payroll not found" });

    payroll.status = "paid";
    payroll.paidAt = new Date();
    await payroll.save();

    res.json({ message: "Payroll marked as paid", payroll });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  generatePayroll: exports.generatePayroll,
  getMyPayroll: exports.getMyPayroll,
  getTeamPayroll: exports.getTeamPayroll,
  markPaid: exports.markPaid
};
