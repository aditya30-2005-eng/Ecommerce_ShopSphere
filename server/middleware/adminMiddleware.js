// Must run after `protect`. Only allows the request through if the
// authenticated user has the "admin" role.
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('Not authorized as an admin');
};

module.exports = { admin };
