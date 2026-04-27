# Fix Plan Tracker

## Backend Fixes
- [x] Fix `authController.js`: Ensure `_id: user._id` is set when creating Employee record so IDs align with User.
- [x] Fix `employeeController.js`: Align Employee `_id` with User `_id` in `createEmployee`, `addAdmin`, and `addManager`. Fix `updateEmployee` to sync User by email instead of mis-matched `_id`.
- [x] Fix `profileController.js`: Fix `getProfile` fallback and `updateProfile` User sync by aligned _id.

## Frontend Fixes
- [x] Fix `AdminDashboard.js`: Correct leave approval endpoint to `/leaves/{id}/status`. Add missing "Add Employee" dialog JSX. Add Attendance, Payroll, and Pending Approvals tabs. Fix JSX syntax errors.
- [x] Fix `ManagerDashboard.js`: Add missing "Add Employee" dialog JSX.

## Project Hygiene
- [x] Create `backend/.env.example` with required environment variables.
- [x] Fix `.gitignore` to allow `frontend/build` for Render deployment.
- [x] Remove temporary helper scripts.

## Build & Deployment
- [x] Frontend production build succeeds (React 19).
- [x] Backend starts with `node server.js` and connects to MongoDB Atlas.
- [x] All 3 login flows verified (Admin, Manager, Employee).
- [x] Profile/Leave/Payroll/Performance flows verified.

## Render Deployment Checklist
- [x] `Procfile` present (`web: node server.js`)
- [x] `backend/server.js` serves `frontend/build` in production (`NODE_ENV=production`)
- [x] `frontend/build` exists and is not ignored by `.gitignore`
- [x] Frontend build succeeds with `npm run build`
- [x] `backend/.env.example` created with all required variables
- [x] `backend/package.json` has correct `build` script for Render
