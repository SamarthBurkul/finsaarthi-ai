const jwt = require('jsonwebtoken');

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
