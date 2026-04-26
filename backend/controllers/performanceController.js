const PerformanceReview = require('../models/PerformanceReview');
const Employee = require('../models/Employee');

// @desc    Create performance review
// @route   POST /api/performance
// @access  Private (Manager/Admin)
const createReview = async (req, res) => {
  try {
    const { employeeId, quarter, year, scores, comments, goals } = req.body;

    // Validation
    if (!employeeId || !quarter || !year || !scores) {
      return res.status(400).json({ message: 'Please provide employeeId, quarter, year, and scores' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Authorization check for managers
    if (req.user.role === 'manager' && employee.managerId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to review this employee' });
    }

    // Check for existing review
    const existing = await PerformanceReview.findOne({
      employeeId,
      'period.quarter': quarter,
      'period.year': year
    });

    if (existing) {
      return res.status(400).json({ message: 'Performance review already exists for this period' });
    }

    // Calculate average score
    const { productivity, teamwork, quality, initiative } = scores;
    const averageScore = ((productivity || 0) + (teamwork || 0) + (quality || 0) + (initiative || 0)) / 4;

    const review = await PerformanceReview.create({
      employeeId,
      reviewerId: req.user.id,
      period: { quarter, year },
      scores: {
        productivity: productivity || 0,
        teamwork: teamwork || 0,
        quality: quality || 0,
        initiative: initiative || 0
      },
      averageScore,
      comments: comments || '',
      goals: goals || '',
      status: 'submitted',
      submittedAt: new Date()
    });

    await review.populate('employeeId reviewerId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Performance review created successfully',
      data: review
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all performance reviews
// @route   GET /api/performance
// @access  Private (Admin)
const getAllReviews = async (req, res) => {
  try {
    const reviews = await PerformanceReview.find()
      .populate('employeeId', 'name email department')
      .populate('reviewerId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get my performance reviews
// @route   GET /api/performance/my
// @access  Private
const getMyReviews = async (req, res) => {
  try {
    const reviews = await PerformanceReview.find({ employeeId: req.user.id })
      .populate('reviewerId', 'name')
      .sort({ 'period.year': -1, 'period.quarter': -1 });

    res.json({ success: true, count: reviews.length, data: reviews });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get team performance reviews (manager)
// @route   GET /api/performance/team
// @access  Private (Manager)
const getTeamReviews = async (req, res) => {
  try {
    const teamMembers = await Employee.find({ managerId: req.user.id });
    const teamIds = teamMembers.map(e => e._id);

    const reviews = await PerformanceReview.find({ employeeId: { $in: teamIds } })
      .populate('employeeId', 'name email')
      .populate('reviewerId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update performance review
// @route   PUT /api/performance/:id
// @access  Private (Manager/Admin)
const updateReview = async (req, res) => {
  try {
    const review = await PerformanceReview.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Only reviewer or admin can update
    if (req.user.role !== 'admin' && review.reviewerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    const { scores, comments, goals, status } = req.body;

    if (scores) {
      const { productivity, teamwork, quality, initiative } = scores;
      review.scores = {
        productivity: productivity ?? review.scores.productivity,
        teamwork: teamwork ?? review.scores.teamwork,
        quality: quality ?? review.scores.quality,
        initiative: initiative ?? review.scores.initiative
      };
      review.averageScore = (
        review.scores.productivity +
        review.scores.teamwork +
        review.scores.quality +
        review.scores.initiative
      ) / 4;
    }

    if (comments !== undefined) review.comments = comments;
    if (goals !== undefined) review.goals = goals;
    if (status) {
      review.status = status;
      if (status === 'reviewed') review.reviewedAt = new Date();
    }

    await review.save();
    await review.populate('employeeId reviewerId', 'name email');

    res.json({ success: true, message: 'Review updated successfully', data: review });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete performance review
// @route   DELETE /api/performance/:id
// @access  Private (Admin)
const deleteReview = async (req, res) => {
  try {
    const review = await PerformanceReview.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await PerformanceReview.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getMyReviews,
  getTeamReviews,
  updateReview,
  deleteReview
};

