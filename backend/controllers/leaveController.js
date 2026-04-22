const Leave = require("../models/Leave");
const Employee = require("../models/Employee");

// Create Leave Request
exports.createLeave = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id).populate('managerId', 'name email');
    if (!employee.managerId) {
      return res.status(400).json({ error: "No assigned manager found" });
    }
    
    const leave = new Leave({
      ...req.body,
      employeeId: req.user.id,
      managerId: employee.managerId._id
    });
    await leave.save();
    
    // Notify manager (future)
    
    res.status(201).json({ message: "Leave request submitted to your manager", leave });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get Employee's Leaves
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.user.id })
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Leaves for Approval (manager/admin)
exports.getLeavesForApproval = async (req, res) => {
  try {
    let query = { status: 'pending' };
    if (req.user.role === 'manager') {
      // Managers approve their team
      query.employeeId = { $in: (await Employee.find({ managerId: req.user.id, status: 'approved' })).map(e => e._id) };
    }
    const leaves = await Leave.find(query)
      .populate('employeeId', 'name email role')
      .populate('approvedBy', 'name');
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve/Reject Leave
exports.updateLeaveStatus = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate('employeeId', 'name email');
    if (!leave) return res.status(404).json({ error: 'Leave not found' });

    leave.status = req.body.status;
    leave.approvedBy = req.user.id;
    leave.approvedAt = new Date();
    await leave.save();

    res.json({ message: `Leave ${req.body.status}`, leave });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Leave Summary for Dashboard
exports.getLeaveSummary = async (req, res) => {
  try {
    const match = req.user.role === 'manager' 
      ? { managerId: req.user.id }
      : {};
    
    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: "leaves",
          localField: "_id",
          foreignField: "employeeId",
          as: "leaves"
        }
      },
      {
        $addFields: {
          totalLeaves: { $size: "$leaves" },
          pendingLeaves: {
            $size: {
              $filter: {
                input: "$leaves",
                cond: { $eq: ["$$this.status", "pending"] }
              }
            }
          }
        }
      }
    ];

    const summary = await Employee.aggregate(pipeline);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createLeave: exports.createLeave,
  getMyLeaves: exports.getMyLeaves,
  getLeavesForApproval: exports.getLeavesForApproval,
  updateLeaveStatus: exports.updateLeaveStatus,
  getLeaveSummary: exports.getLeaveSummary
};
