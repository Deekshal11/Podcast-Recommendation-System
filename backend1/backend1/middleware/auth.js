const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = "Podcast";

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

exports.roleCheck = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role.toLowerCase())) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  };
};
