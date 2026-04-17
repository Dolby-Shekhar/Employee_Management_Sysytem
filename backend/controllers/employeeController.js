// Add Admin (only by admin, max 2 admins)
exports.addAdmin = async (req, res) => {
    try {
        // Only allow admins (enforced by middleware)
        // Check current admin count
        const adminCount = await User.countDocuments({ role: "admin" });
        if (adminCount >= 2) {
            return res.status(400).json({ error: "Maximum of 2 admins allowed." });
        }
        // Check if user already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists" });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        // Create User
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            role: "admin"
        });
        await user.save();
        // Create Employee record for admin
        const emp = new Employee({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            role: "admin",
            status: "approved"
        });
        await emp.save();
        res.json({ message: "Admin added successfully", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const Employee = require("../models/Employee");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Create
exports.createEmployee = async (req, res) => {
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create User first
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role || "employee"
        });
        await user.save();

        // Create Employee with status based on role and creator
        const status = req.user.role === 'admin' ? 'approved' : 'pending';
        const managerId = req.user.role === 'manager' ? req.user.id : null;

        const emp = new Employee({
            ...req.body,
            password: hashedPassword,
            status,
            managerId,
        });
        await emp.save();

        res.json(emp);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get All - role-based filtering
exports.getEmployees = async (req, res) => {
    try {
        const { role } = req.user;
        let query = {};

        if (role === 'manager') {
            // Managers see their team (approved) + their pending
            query = { 
                $or: [
                    { managerId: req.user.id, status: 'pending' },
                    { managerId: req.user.id, status: 'approved' }
                ]
            };
        }
        // Admin sees all

        const employees = await Employee.find(query).populate('managerId', 'name');
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update
exports.updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ error: 'Employee not found' });

        // Managers can only update their own team
        if (req.user.role === 'manager' && employee.managerId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const updated = await Employee.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Approve Employee (admin only)
exports.approveEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ error: 'Employee not found' });
        
        employee.status = 'approved';
        await employee.save();
        
        res.json({ message: 'Employee approved', employee });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Delete
exports.deleteEmployee = async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ msg: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};