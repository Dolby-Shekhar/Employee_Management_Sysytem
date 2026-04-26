const managerMiddleware = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'manager')) {
    return next();
  }
  return res.status(403).json({ message: 'Manager or admin access required' });
};

module.exports = managerMiddleware;

