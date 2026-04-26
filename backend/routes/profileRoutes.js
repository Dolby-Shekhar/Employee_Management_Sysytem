const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes are protected
router.use(authMiddleware);

router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/password', changePassword);

module.exports = router;

