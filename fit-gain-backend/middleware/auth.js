const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header (Bearer token)
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Secret should be in .env
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token, authorization denied' });
    }

    // Find user by ID from token payload
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found, authorization denied' });
    }

    // Attach user to request object
    req.user = {
      id: user._id,
      role: user.role,
    };

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

// Middleware to restrict access to admins only
const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, async () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      next();
    });
  } catch (error) {
    res.status(403).json({ message: 'Admin authorization failed', error: error.message });
  }
};

module.exports = { auth, adminAuth };