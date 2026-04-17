# Manager + Approval Workflow TODO

## Status: 🚀 In Progress

### 1. Backend Model Update ✅
   - Employee.js: Added `status` + `managerId` fields

### 2. Backend Controller Updates ✅
   - employeeController.js: 
     - createEmployee: role-based status + managerId
     - getEmployees: role-filtered views
     - approveEmployee: admin only
     - updateEmployee: manager perms

### 3. Backend Routes + Middleware ✅
   - employeeRoutes.js: Added approve route, manager permissions

### 4. Frontend ManagerDashboard ✅
   - Created ManagerClock.js component
   - Added to ManagerDashboard + AddEmployee + status chips

### 5. Frontend AdminDashboard ✅
   - Added pending review dialog + approve workflow
   - Enhanced main table (status/manager columns)
   - Separate approved/pending lists

### 6. Test Flow
   - Manager adds employee → pending
   - Admin approves → active
   - Manager clocks in/out
