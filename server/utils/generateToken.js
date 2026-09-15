const jwt = require('jsonwebtoken');

// Creates a signed JWT that encodes only the user id.
// The frontend stores this token and sends it back on every request
// that needs authentication.
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
