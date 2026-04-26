const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');

// @desc    Generate payroll
// @route   POST /api/payroll
// @access  Private (Admin)
const generatePayroll = async (req, res) => {
  try {
    const { employeeId, month, year, baseSalary, workedDays, paidDays, overtimeHours, overtimeRate, deductions, bonuses } = req.body;

    // Validation
    if (!employeeId || !month || !year || !baseSalary) {
      return res.status(400).json({ message: 'Please provide employeeId, month, year, and baseSalary' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if payroll already exists for this period
    const existing = await Payroll.findOne({
      employeeId,
      'period.month': month,
      'period.year': year
    });

    if (existing) {
      return res.status(400).json({ message: 'Payroll already exists for this period' });
    }

    // Calculate totals
    const overtimePay = (overtimeHours || 0) * (overtimeRate || 0);
    const totalBonuses = (bonuses || []).reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalDeductions = (deductions || []).reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalEarnings = baseSalary + overtimePay + totalBonuses;
    const netPay = totalEarnings - totalDeductions;

    const payroll = await Payroll.create({
      employeeId,
      period: { month, year },
      baseSalary,
      workedDays: workedDays || 0,
      paidDays: paidDays || 0,
      overtimeHours: overtimeHours || 0,
      overtimeRate: overtimeRate || 0,
      deductions: deductions || [],
      bonuses: bonuses || [],
      totalEarnings,
      totalDeductions,
      netPay,
      status: 'generated',
      generatedBy: req.user.id
    });

    await payroll.populate('employeeId', 'name email department position');

    res.status(201).json({
      success: true,
      message: 'Payroll generated successfully',
      data: payroll
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all payrolls
// @route   GET /api/payroll
// @access  Private (Admin)
const getAllPayrolls = async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = {};

    if (month && year) {
      query = {
        'period.month': parseInt(month),
        'period.year': parseInt(year)
      };
    }

    const payrolls = await Payroll.find(query)
      .populate('employeeId', 'name email department position')
      .populate('generatedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: payrolls.length, data: payrolls });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get my payroll
// @route   GET /api/payroll/my
// @access  Private
const getMyPayroll = async (req, res) => {
  try {
    const payrolls = await Payroll.find({ employeeId: req.user.id })
      .sort({ 'period.year': -1, 'period.month': -1 });

    res.json({ success: true, count: payrolls.length, data: payrolls });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Mark payroll as paid
// @route   PUT /api/payroll/:id/pay
// @access  Private (Admin)
const markAsPaid = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }

    payroll.status = 'paid';
    payroll.paidAt = new Date();
    await payroll.save();

    res.json({ success: true, message: 'Payroll marked as paid', data: payroll });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete payroll
// @route   DELETE /api/payroll/:id
// @access  Private (Admin)
const deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }

    await Payroll.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Payroll deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  generatePayroll,
  getAllPayrolls,
  getMyPayroll,
  markAsPaid,
  deletePayroll
};

