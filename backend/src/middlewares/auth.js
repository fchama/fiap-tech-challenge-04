const jwt = require('jsonwebtoken');

const getSecret = () => process.env.JWT_SECRET || 'dev-secret';

const signToken = (user, role) =>
  jwt.sign({ id: user.id, role }, getSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/** Exige um token Bearer válido e popula req.auth = { id, role }. */
const authenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  try {
    const payload = jwt.verify(token, getSecret());
    req.auth = { id: payload.id, role: payload.role };
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

/** Restringe a rota aos perfis informados. Use depois de `authenticate`. */
const authorize = (...roles) => (req, res, next) => {
  if (!req.auth || !roles.includes(req.auth.role)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to perform this action',
    });
  }
  return next();
};

module.exports = { signToken, authenticate, authorize };
