# Fix Edit Profile Tab

## Status: 🔍 Analysis Complete

**Problem:** EmployeePortal.js Profile tab has placeholder "Edit Profile" button with no functionality.

**Root Cause:** No backend API for profile updates, frontend stub only.

### Plan
1. **Backend:** Add /api/profile PUT endpoint (update name, email in User/Employee)
2. **Frontend:** Replace Profile tab with EditProfile form (name, email, password change)
3. **Auth:** Update JWT after profile change
4. **Test:** Restart servers, test profile edit for member/leader

**Files:**
- NEW: backend/controllers/profileController.js
- NEW route: backend/routes/profileRoutes.js  
- EDIT: frontend/src/components/EmployeePortal.js (Profile tab)
- Sync User & Employee records

Ready to proceed? (Y/N)
