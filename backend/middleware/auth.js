const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    // Dev shortcut: allow explicit user id header when not in production
    if (!token && process.env.NODE_ENV !== 'production' && req.headers['x-user-id']) {
      req.user = { id: String(req.headers['x-user-id']) };
      req.userId = req.user.id;
      return next();
    }

    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, error: 'Missing JWT_SECRET in environment' });
    }

    const decoded = jwt.verify(token, secret);
    
    // Support multiple ID formats from different auth providers
    const id = decoded?.userId || decoded?.id || decoded?._id || decoded?.sub;

    if (!id) {
      return res.status(401).json({ success: false, error: 'Invalid token claims' });
    }

    // Set both req.user and req.userId for compatibility with all routes
    req.user = { id: String(id), email: decoded.email, claims: decoded };
    req.userId = String(id);
    req.email = decoded.email;

    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;