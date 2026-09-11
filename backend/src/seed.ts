import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from './config/db';
import { User } from './models/User';
import { Employee } from './models/Employee';

import { Attendance } from './models/Attendance';
import { Leave } from './models/Leave';
import { Payroll } from './models/Payroll';
import { PerformanceReview } from './models/PerformanceReview';
import { Report } from './models/Report';

dotenv.config();

const seedData = async (): Promise<void> => {
  // Clear existing data across all collections
  await Promise.all([
    User.deleteMany({}),
    Employee.deleteMany({}),
    Attendance.deleteMany({}),
    Leave.deleteMany({}),
    Payroll.deleteMany({}),
    PerformanceReview.deleteMany({}),
    Report.deleteMany({})
  ]);

  console.log('Previous database data cleared');

  // Hash helper
  const hash = (password: string) => bcrypt.hash(password, 10);
  const defaultPw = await hash('company123');

  // 1. Admin
  const adminPassword = await hash('admin123');
  const adminUser = await User.create({
    name: 'Alexander Pierce (Admin)',
    email: 'admin@company.com',
    password: adminPassword,
    role: 'admin'
  });
  await Employee.create({
    _id: adminUser._id,
    name: 'Alexander Pierce (Admin)',
    email: 'admin@company.com',
    password: adminPassword,
    role: 'admin',
    status: 'approved',
    position: 'Chief Information Officer',
    department: 'Executive',
    salary: 145000
  });

  // 2. Engineering Manager
  const managerPassword = await hash('manager123');
  const managerUser = await User.create({
    name: 'Sophia Vance (Manager)',
    email: 'manager@company.com',
    password: managerPassword,
    role: 'manager'
  });
  const managerEmployee = await Employee.create({
    _id: managerUser._id,
    name: 'Sophia Vance (Manager)',
    email: 'manager@company.com',
    password: managerPassword,
    role: 'manager',
    status: 'approved',
    position: 'VP of Engineering',
    department: 'Engineering',
    salary: 110000
  });

  // 3. Product Manager
  const pmUser = await User.create({
    name: 'David Sterling (Manager)',
    email: 'david.pm@company.com',
    password: managerPassword,
    role: 'manager'
  });
  await Employee.create({
    _id: pmUser._id,
    name: 'David Sterling (Manager)',
    email: 'david.pm@company.com',
    password: managerPassword,
    role: 'manager',
    status: 'approved',
    position: 'Head of Product',
    department: 'Product',
    salary: 105000
  });

  // 4. Primary Employee (Jane)
  const empPassword = await hash('employee123');
  const empUser = await User.create({
    name: 'Jane Foster (Employee)',
    email: 'employee@company.com',
    password: empPassword,
    role: 'employee'
  });
  const empEmployee = await Employee.create({
    _id: empUser._id,
    name: 'Jane Foster (Employee)',
    email: 'employee@company.com',
    password: empPassword,
    role: 'employee',
    status: 'approved',
    position: 'Staff Frontend Engineer',
    department: 'Engineering',
    salary: 85000,
    managerId: managerEmployee._id
  });

  // 5. Additional Team Members
  const devUser = await User.create({
    name: 'Marcus Chen',
    email: 'marcus.chen@company.com',
    password: defaultPw,
    role: 'employee'
  });
  const devEmployee = await Employee.create({
    _id: devUser._id,
    name: 'Marcus Chen',
    email: 'marcus.chen@company.com',
    password: defaultPw,
    role: 'employee',
    status: 'approved',
    position: 'Senior Backend Engineer',
    department: 'Engineering',
    salary: 82000,
    managerId: managerEmployee._id
  });

  const designerUser = await User.create({
    name: 'Elena Rostova',
    email: 'elena.design@company.com',
    password: defaultPw,
    role: 'employee'
  });
  await Employee.create({
    _id: designerUser._id,
    name: 'Elena Rostova',
    email: 'elena.design@company.com',
    password: defaultPw,
    role: 'employee',
    status: 'approved',
    position: 'Lead UX Designer',
    department: 'Design',
    salary: 78000,
    managerId: managerEmployee._id
  });

  // 6. Pending Onboarding Employee (For testing Admin approval flow)
  const pendingUser = await User.create({
    name: 'Oliver Thorne (Pending)',
    email: 'oliver.thorne@company.com',
    password: defaultPw,
    role: 'employee'
  });
  await Employee.create({
    _id: pendingUser._id,
    name: 'Oliver Thorne (Pending)',
    email: 'oliver.thorne@company.com',
    password: defaultPw,
    role: 'employee',
    status: 'pending',
    position: 'Junior Security Analyst',
    department: 'Security',
    salary: 62000,
    managerId: managerEmployee._id
  });

  // 7. Seed Attendance Records
  const now = new Date();
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const yesterdayIn = new Date(Date.now() - 26 * 60 * 60 * 1000);
  const yesterdayOut = new Date(Date.now() - 18 * 60 * 60 * 1000);

  // Jane currently clocked in
  await Attendance.create({
    user: empUser._id,
    clockIn: twoHoursAgo,
    late: false,
    address: 'HQ Silicon Tower, Floor 8',
    latitude: 37.7749,
    longitude: -122.4194
  });

  // Marcus completed yesterday
  await Attendance.create({
    user: devUser._id,
    clockIn: yesterdayIn,
    clockOut: yesterdayOut,
    late: false,
    earlyLeave: false,
    address: 'Remote / Virtual Office'
  });

  // Manager clocked in today
  await Attendance.create({
    user: managerUser._id,
    clockIn: new Date(Date.now() - 4 * 60 * 60 * 1000),
    late: false,
    address: 'HQ Silicon Tower, Executive Wing'
  });

  // 8. Seed Leave Requests
  await Leave.create({
    employeeId: empUser._id,
    leaveType: 'Annual',
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    reason: 'Family vacation scheduled for summer',
    status: 'pending'
  });

  await Leave.create({
    employeeId: devUser._id,
    leaveType: 'Sick',
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    reason: 'Flu recovery',
    status: 'approved',
    managerComment: 'Approved. Get well soon!'
  });

  await Leave.create({
    employeeId: designerUser._id,
    leaveType: 'Casual',
    startDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
    reason: 'Personal errands',
    status: 'approved',
    managerComment: 'Approved with team coverage ensured.'
  });

  // 9. Seed Payroll Records
  await Payroll.create({
    employeeId: empUser._id,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    baseSalary: '7083.33',
    overtime: '450.00',
    bonuses: '500.00',
    deductions: '1200.00',
    netPay: '6833.33'
  });

  await Payroll.create({
    employeeId: devUser._id,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    baseSalary: '6833.33',
    overtime: '200.00',
    bonuses: '300.00',
    deductions: '1100.00',
    netPay: '6233.33'
  });

  await Payroll.create({
    employeeId: managerUser._id,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    baseSalary: '9166.67',
    overtime: '0.00',
    bonuses: '1200.00',
    deductions: '1800.00',
    netPay: '8566.67'
  });

  // 10. Seed Performance Reviews
  await PerformanceReview.create({
    employeeId: empUser._id,
    managerId: managerUser._id,
    reviewPeriod: '2026-Q1',
    rating: 5,
    comments: 'Exceptional ownership of the frontend modernization and architecture migration.',
    status: 'submitted'
  });

  await PerformanceReview.create({
    employeeId: devUser._id,
    managerId: managerUser._id,
    reviewPeriod: '2026-Q1',
    rating: 4,
    comments: 'Solid backend reliability and low latency API query optimizations.',
    status: 'submitted'
  });

  // 11. Seed Reports
  await Report.create({
    employeeId: empUser._id,
    createdBy: empUser._id,
    title: 'Frontend Modernization & Performance Milestone',
    content: 'All legacy dependencies have been removed. Vite build passes and bundle size has dropped by 45%.',
    managerResponse: 'Outstanding work, Jane. Ready for executive demo.'
  });

  await Report.create({
    employeeId: devUser._id,
    createdBy: devUser._id,
    title: 'Database Indexing & Query Benchmarking',
    content: 'Compound indexes on attendance and employee collections have reduced query time from 120ms to 8ms.',
    managerResponse: 'Great performance gains. Please document in wiki.'
  });

  console.log('Seed data created successfully!');
  console.log('----------------------------------------------------');
  console.log('Demo Logins:');
  console.log('  Admin:    admin@company.com    / admin123');
  console.log('  Manager:  manager@company.com  / manager123');
  console.log('  Employee: employee@company.com / employee123');
  console.log('----------------------------------------------------');
};

// CLI execution
const run = async (): Promise<void> => {
  try {
    await connectDB();
    await seedData();
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

run();
