import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import useAuth from '../hooks/useAuth';
import { validateLoginForm } from '../utils/validators';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const validationErrors = validateLoginForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <div className="border rounded p-4 bg-white">
            <h3 className="mb-1">Welcome Back</h3>
            <p className="text-muted mb-4">Login to your ShopSphere account</p>

            {serverError && <Alert variant="danger">{serverError}</Alert>}

            <Form onSubmit={handleSubmit} noValidate>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                  placeholder="you@example.com"
                />
                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                  placeholder="Your password"
                />
                <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
              </Form.Group>

              <div className="text-end mb-3">
                <Link to="/forgot-password" className="small">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-100" disabled={submitting}>
                {submitting ? 'Logging in...' : 'Login'}
              </Button>
            </Form>

            <p className="text-center mt-3 mb-0 small">
              Don&apos;t have an account? <Link to="/register">Register</Link>
            </p>
            <p className="text-center text-muted small mt-2">
              Demo: admin@example.com / admin123 &middot; user@example.com / user1234
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
