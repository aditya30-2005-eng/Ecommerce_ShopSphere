import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { isValidEmail } from '../utils/validators';

// UI-only "forgot password" flow (per project scope). In a production app
// this would call a backend endpoint that emails a reset link/token.
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <div className="border rounded p-4 bg-white">
            <h3 className="mb-1">Forgot Password</h3>
            <p className="text-muted mb-4">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            {submitted ? (
              <Alert variant="success">
                If an account exists for <strong>{email}</strong>, a password reset link has been sent.
              </Alert>
            ) : (
              <Form onSubmit={handleSubmit} noValidate>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </Form.Group>
                <Button type="submit" className="w-100">
                  Send Reset Link
                </Button>
              </Form>
            )}

            <p className="text-center mt-3 mb-0 small">
              <Link to="/login">Back to Login</Link>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;
