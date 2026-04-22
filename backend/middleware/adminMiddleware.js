module.exports = function (req, res, next) {
  if (req.user && (req.user.role === "admin" || req.user.role === "leader")) {
    return next();
  }
  return res.status(403).json({ message: "Admin or leader access required" });
};
