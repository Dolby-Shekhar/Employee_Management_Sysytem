const Report = require('../models/Report');
const Employee = require('../models/Employee');

// Create report (employee)
const createReport = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const report = await Report.create({
      employeeId: req.user.id,
      managerId: employee.managerId,
      ...req.body
    });

    await report.populate('employeeId managerId', 'name email');
    
    res.status(201).json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update report (employee - edit draft)
const updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    if (report.employeeId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Report.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('employeeId managerId', 'name email');

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get my reports (employee)
const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ employeeId: req.user.id })
      .populate('managerId', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, count: reports.length, data: reports });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get team reports (manager)
const getTeamReports = async (req, res) => {
  try {
    const team = await Employee.find({ managerId: req.user.id });
    const teamIds = team.map(e => e._id);
    
    const reports = await Report.find({ employeeId: { $in: teamIds } })
      .populate('employeeId managerId', 'name email department')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, count: reports.length, data: reports });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark report as read (manager)
const markAsRead = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    const manager = await Employee.findById(req.user.id);
    if (report.managerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    report.status = 'read';
    await report.save();

    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createReport,
  updateReport,
  getMyReports,
  getTeamReports,
  markAsRead
};
