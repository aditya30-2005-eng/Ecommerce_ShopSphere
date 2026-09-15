// Small dependency-free validation helpers shared by the controllers.

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(String(email || '').trim());

const isStrongPassword = (password) => typeof password === 'string' && password.length >= 6;

module.exports = { isValidEmail, isStrongPassword };
