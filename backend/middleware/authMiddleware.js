const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  let token = req.header('Authorization');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // Remove Bearer prefix if present
  if (token.startsWith('Bearer ')) {
    token = token.slice(7);
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'Server configuration error - JWT_SECRET missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    res.status(401).json({ message: 'Invalid token. Please login again.' });
  }
};

module.exports = authMiddleware;

