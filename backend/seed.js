require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Employee = require('./models/Employee');
const connectDB = require('./config/db');

const seedData = async () => {
  // Clear existing data
  await User.deleteMany();
  await Employee.deleteMany();

  console.log('Previous data cleared');

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);

  // Create admin user
  const adminUser = await User.create({
    name: 'System Admin',
    email: 'admin@company.com',
    password: hashedPassword,
    role: 'admin'
  });

  // Create admin employee record
  await Employee.create({
    _id: adminUser._id,
    name: 'System Admin',
    email: 'admin@company.com',
    password: hashedPassword,
    role: 'admin',
    status: 'approved',
    position: 'System Administrator',
    department: 'IT',
    salary: 100000
  });

  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', salt);
  const managerUser = await User.create({
    name: 'John Manager',
    email: 'manager@company.com',
    password: managerPassword,
    role: 'manager'
  });

  const managerEmployee = await Employee.create({
    _id: managerUser._id,
    name: 'John Manager',
    email: 'manager@company.com',
    password: managerPassword,
    role: 'manager',
    status: 'approved',
    position: 'Team Lead',
    department: 'Engineering',
    salary: 80000
  });

  // Create employee user
  const empPassword = await bcrypt.hash('employee123', salt);
  const empUser = await User.create({
    name: 'Jane Employee',
    email: 'employee@company.com',
    password: empPassword,
    role: 'employee'
  });

  await Employee.create({
    _id: empUser._id,
    name: 'Jane Employee',
    email: 'employee@company.com',
    password: empPassword,
    role: 'employee',
    status: 'approved',
    position: 'Software Developer',
    department: 'Engineering',
    salary: 60000,
    managerId: managerEmployee._id
  });

  console.log('Seed data created successfully!');
  console.log('Admin: admin@company.com / admin123');
  console.log('Manager: manager@company.com / manager123');
  console.log('Employee: employee@company.com / employee123');
};

// Export for programmatic use
module.exports = seedData;

// CLI execution
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedData();
      process.exit(0);
    } catch (err) {
      console.error('Seed error:', err);
      process.exit(1);
    }
  })();
}
