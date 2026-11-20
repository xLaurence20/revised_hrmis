import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded; // { id, role, permissions: [] }
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token expired or invalid' });
  }
};

export const authorize = (requiredPermission) => {
  return (req, res, next) => {
    if (req.user.role === 'administrator') return next(); // Admin bypass
    if (!req.user.permissions.includes(requiredPermission)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};