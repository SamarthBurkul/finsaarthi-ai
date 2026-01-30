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
/**
 * JWT Authentication Middleware
 * Protects routes by verifying JWT tokens
 * Supports both production tokens and development x-user-id header
 */
>>>>>>> 83e71685da1a350e93201aa233b2fa10ae7fe1c2
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    // Development mode bypass (only for local testing)
    // NEVER enable this in production
    if (!token && process.env.NODE_ENV !== 'production' && req.headers['x-user-id']) {
      console.warn('⚠️  Using development auth bypass with x-user-id header');
      req.user = { id: String(req.headers['x-user-id']) };
      req.userId = req.user.id;
      return next();
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required',
        message: 'No token provided. Please include Authorization: Bearer <token> header'
      });
    }

    // Verify JWT_SECRET is configured
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('🔴 CRITICAL: JWT_SECRET not configured in environment');
      return res.status(500).json({ 
        success: false, 
        error: 'Server configuration error',
        message: 'Authentication system is not properly configured'
      });
    }

    // Verify and decode token
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (jwtError) {
      // Handle specific JWT errors
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          error: 'Token expired',
          message: 'Your session has expired. Please log in again.',
          expiredAt: jwtError.expiredAt
        });
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid token',
          message: 'The provided token is invalid or malformed'
        });
      }
      
      // Generic JWT error
      return res.status(401).json({ 
        success: false, 
        error: 'Token verification failed',
        message: jwtError.message
      });
    }
    
    // Extract user ID from token (support multiple formats)
    const id = decoded?.userId || decoded?.id || decoded?._id || decoded?.sub;

    if (!id) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token claims',
        message: 'Token does not contain valid user identification'
      });
    }

    // Attach user info to request object for use in controllers
    req.user = { 
      id: String(id), 
      email: decoded.email,
      claims: decoded 
    };
    req.userId = String(id);
    req.email = decoded.email;

    // Log successful authentication in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ Authenticated user: ${req.userId} (${req.email || 'no email'})`);
    }

    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Authentication error',
      message: 'An error occurred during authentication'
    });
  }
};

/**
 * Optional middleware to verify user ownership of a resource
 * Use after authMiddleware for additional protection
 */
const verifyOwnership = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (resourceUserId && String(resourceUserId) !== String(req.userId)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to access this resource'
      });
    }
    
    next();
  };
};

module.exports = authMiddleware;
<<<<<<< HEAD
=======
module.exports.verifyOwnership = verifyOwnership;
>>>>>>> 83e71685da1a350e93201aa233b2fa10ae7fe1c2
