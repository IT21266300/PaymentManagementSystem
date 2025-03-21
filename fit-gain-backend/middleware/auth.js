const auth = (req, res, next) => {
    // Mock authentication (assume user/admin is passed in request body for simplicity)
    const { email } = req.body;
    if (!email) return res.status(401).json({ message: 'Authentication required' });
    next();
  };
  
  const adminAuth = async (req, res, next) => {
    const { email } = req.body;
    const User = require('../models/User');
    const user = await User.findOne({ email });
    if (!user || !user.isAdmin) return res.status(403).json({ message: 'Admin access required' });
    next();
  };
  
  module.exports = { auth, adminAuth };