const jwt = require('jsonwebtoken');

<<<<<<< HEAD
function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  // Dev/testing shortcut: allow explicit user id header when not in production.
  if (!token && process.env.NODE_ENV !== 'production' && req.headers['x-user-id']) {
    req.user = { id: String(req.headers['x-user-id']) };
    return next();
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ success: false, message: 'Missing JWT_SECRET in environment' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    const id = decoded?.id || decoded?._id || decoded?.userId || decoded?.sub;

    if (!id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    req.user = { id: String(id), claims: decoded };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
}

module.exports = auth;
=======
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.email = decoded.email;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
>>>>>>> b3c1955d92a5c127cb5cc3d8a59af6689d34bc23
