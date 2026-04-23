const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Employee = require('./models/Employee');
const Attendance = require('./models/Attendance');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

// Clear existing data - removes ALL users/employees/attendance
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Attendance.deleteMany({});

    // Create Admin
    const hashedAdmin = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@company.com',
      password: hashedAdmin,
      role: 'admin'
    });
    await Employee.create({
      name: 'Admin User',
      email: 'admin@company.com',
      password: hashedAdmin,
      role: 'admin',
      position: 'System Administrator',
      salary: 120000
    });

    // Create Manager
    const hashedManager = await bcrypt.hash('manager123', 10);
    const manager = await User.create({
      name: 'John Manager',
      email: 'manager@company.com',
      password: hashedManager,
      role: 'manager'
    });
    const managerEmp = await Employee.create({
      name: 'John Manager',
      email: 'manager@company.com',
      password: hashedManager,
      role: 'manager',
      position: 'Department Manager',
      salary: 90000,
      department: 'Management'
    });

    // Create Employee
    const hashedEmp = await bcrypt.hash('emp123', 10);
    const employee = await User.create({
      name: 'Jane Employee',
      email: 'employee@company.com',
      password: hashedEmp,
      role: 'employee'
    });
    await Employee.create({
      name: 'Jane Employee',
      email: 'employee@company.com',
      password: hashedEmp,
      role: 'employee',
      position: 'Software Engineer',
      salary: 75000,
      department: 'Engineering',
      managerId: managerEmp._id
    });

    // Create sample attendance
    const today = new Date();
    today.setHours(9, 30, 0, 0);
    await Attendance.create({
      user: employee._id,
      clockIn: today,
      date: new Date().setHours(0,0,0,0),
      late: false
    });

    console.log('✅ Seeding complete!');
    console.log('Admin: admin@company.com / admin123');
    console.log('Manager: manager@company.com / manager123');
    console.log('Employee: employee@company.com / emp123');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedData();

