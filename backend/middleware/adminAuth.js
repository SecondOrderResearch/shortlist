const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'change-me');
    if (payload.role !== 'restaurant_admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.adminUser = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};