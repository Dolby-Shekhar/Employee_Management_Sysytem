const PerformanceReview = require("../models/PerformanceReview");
const Employee = require("../models/Employee");

// Create/Update Self Review (Employee)
exports.createSelfReview = async (req, res) => {
  try {
    const { period, scores, comments, goals } = req.body;
    const averageScore = (scores.productivity + scores.teamwork + scores.quality + scores.initiative) / 4;

    let review = await PerformanceReview.findOne({
      employeeId: req.user.id,
      reviewerId: req.user.id,
      "period.quarter": period.quarter,
      "period.year": period.year
    });

    if (review) {
      // Update existing
      review.scores = scores;
      review.averageScore = averageScore;
      review.comments = comments;
      review.goals = goals;
      review.status = "submitted";
      review.submittedAt = new Date();
    } else {
      // Create new
      review = new PerformanceReview({
        employeeId: req.user.id,
        reviewerId: req.user.id,
        period,
        scores,
        averageScore,
        comments,
        goals,
        status: "submitted"
      });
    }

    await review.save();
    await review.populate("employeeId reviewerId", "name role");

    res.json({ message: "Self-review saved", review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get My Reviews (as employee)
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await PerformanceReview.find({ 
      $or: [
        { employeeId: req.user.id },
        { reviewerId: req.user.id }
      ]
    }).populate("employeeId reviewerId", "name email role")
      .sort({ "period.year": -1, "period.quarter": -1 });
    
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Submit Manager Review
exports.submitManagerReview = async (req, res) => {
  try {
    const { employeeId, period, scores, comments } = req.body;
    const averageScore = (scores.productivity + scores.teamwork + scores.quality + scores.initiative) / 4;

    const review = await PerformanceReview.findOne({
      employeeId,
      reviewerId: req.user.id,
      "period.quarter": period.quarter,
      "period.year": period.year
    });

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    review.scores = scores;
    review.averageScore = averageScore;
    review.comments = comments;
    review.status = "finalized";
    review.reviewedAt = new Date();

    await review.save();
    await review.populate("employeeId reviewerId", "name role");

    res.json({ message: "Review submitted", review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Team Reviews for Manager
exports.getTeamReviews = async (req, res) => {
  try {
    const employees = await Employee.find({ managerId: req.user.id, status: 'approved' });
    const employeeIds = employees.map(e => e._id);

    const reviews = await PerformanceReview.find({ 
      employeeId: { $in: employeeIds } 
    }).populate("employeeId reviewerId", "name email role")
      .sort({ "period.year": -1, "period.quarter": -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createSelfReview: exports.createSelfReview,
  getMyReviews: exports.getMyReviews,
  submitManagerReview: exports.submitManagerReview,
  getTeamReviews: exports.getTeamReviews
};
