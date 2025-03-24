const protect = (req, res, next) => {
  const userId = req.headers['user-id']; // Mock user ID from frontend
  const isAdmin = req.headers['is-admin'] === 'true'; // Mock admin status from frontend
  if (!userId) {
    return res.status(401).json({ message: 'Not authorized, no user ID provided' });
  }
  req.user = { _id: userId, isAdmin };
  next();
};

module.exports = { protect };