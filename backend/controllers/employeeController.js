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
        // Optionally, create Employee record for admin
        const emp = new Employee({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            role: "admin"
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

        // Hash password for both Employee and User
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create Employee
        const emp = new Employee({ ...req.body, password: hashedPassword });
        await emp.save();

        // Create User
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role || "employee"
        });
        await user.save();

        res.json(emp);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get All
exports.getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update
exports.updateEmployee = async (req, res) => {
    try {
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

// Delete
exports.deleteEmployee = async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ msg: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};