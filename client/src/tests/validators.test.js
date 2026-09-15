import { describe, it, expect } from 'vitest';
import { validateLoginForm, validateRegisterForm, isValidEmail, isStrongPassword } from '../utils/validators';

describe('isValidEmail', () => {
  it('accepts a well-formed email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });
  it('rejects a malformed email', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
  });
});

describe('isStrongPassword', () => {
  it('accepts passwords of 6+ characters', () => {
    expect(isStrongPassword('secret1')).toBe(true);
  });
  it('rejects passwords shorter than 6 characters', () => {
    expect(isStrongPassword('123')).toBe(false);
  });
});

describe('validateLoginForm', () => {
  it('returns no errors for valid input', () => {
    const errors = validateLoginForm({ email: 'user@example.com', password: 'secret1' });
    expect(errors).toEqual({});
  });

  it('flags a missing email', () => {
    const errors = validateLoginForm({ email: '', password: 'secret1' });
    expect(errors.email).toBeDefined();
  });

  it('flags a missing password', () => {
    const errors = validateLoginForm({ email: 'user@example.com', password: '' });
    expect(errors.password).toBeDefined();
  });
});

describe('validateRegisterForm', () => {
  const validForm = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'secret1',
    confirmPassword: 'secret1',
  };

  it('returns no errors for valid input', () => {
    expect(validateRegisterForm(validForm)).toEqual({});
  });

  it('flags a weak password', () => {
    const errors = validateRegisterForm({ ...validForm, password: '123', confirmPassword: '123' });
    expect(errors.password).toBeDefined();
  });

  it('flags mismatched confirm password', () => {
    const errors = validateRegisterForm({ ...validForm, confirmPassword: 'different' });
    expect(errors.confirmPassword).toBeDefined();
  });

  it('flags a missing name', () => {
    const errors = validateRegisterForm({ ...validForm, name: '' });
    expect(errors.name).toBeDefined();
  });
});
