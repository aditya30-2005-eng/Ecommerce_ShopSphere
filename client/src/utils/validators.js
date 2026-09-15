// Shared frontend validation helpers - kept dependency-free and pure so
// they are trivial to unit test.

export const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(String(email || '').trim());

export const isStrongPassword = (password) => typeof password === 'string' && password.length >= 6;

export const validateRegisterForm = ({ name, email, password, confirmPassword }) => {
  const errors = {};
  if (!name || !name.trim()) errors.name = 'Name is required';
  if (!email || !email.trim()) errors.email = 'Email is required';
  else if (!isValidEmail(email)) errors.email = 'Please enter a valid email address';
  if (!password) errors.password = 'Password is required';
  else if (!isStrongPassword(password)) errors.password = 'Password must be at least 6 characters';
  if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match';
  return errors;
};

export const validateLoginForm = ({ email, password }) => {
  const errors = {};
  if (!email || !email.trim()) errors.email = 'Email is required';
  else if (!isValidEmail(email)) errors.email = 'Please enter a valid email address';
  if (!password) errors.password = 'Password is required';
  return errors;
};
