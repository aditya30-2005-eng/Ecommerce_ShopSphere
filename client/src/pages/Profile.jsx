import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import useAuth from '../hooks/useAuth';
import authService from '../services/authService';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address?.address || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        address: {
          address: form.address,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country,
        },
      };
      if (form.password) payload.password = form.password;

      const res = await authService.updateMe(payload);
      updateUser(res.user);
      setForm({ ...form, password: '' });
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={7}>
          <h3 className="mb-4">My Profile</h3>
          <Form onSubmit={handleSubmit} className="border rounded bg-white p-4">
            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            <Row className="g-3 mb-2">
              <Col md={6}>
                <Form.Label className="small">Full Name</Form.Label>
                <Form.Control name="name" value={form.name} onChange={handleChange} />
              </Col>
              <Col md={6}>
                <Form.Label className="small">Email</Form.Label>
                <Form.Control value={user?.email} disabled />
              </Col>
              <Col md={6}>
                <Form.Label className="small">Phone</Form.Label>
                <Form.Control name="phone" value={form.phone} onChange={handleChange} />
              </Col>
              <Col md={6}>
                <Form.Label className="small">New Password (optional)</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                />
              </Col>
            </Row>

            <h6 className="mt-3 mb-2">Default Address</h6>
            <Row className="g-3">
              <Col md={12}>
                <Form.Label className="small">Address</Form.Label>
                <Form.Control name="address" value={form.address} onChange={handleChange} />
              </Col>
              <Col md={6}>
                <Form.Label className="small">City</Form.Label>
                <Form.Control name="city" value={form.city} onChange={handleChange} />
              </Col>
              <Col md={6}>
                <Form.Label className="small">State</Form.Label>
                <Form.Control name="state" value={form.state} onChange={handleChange} />
              </Col>
              <Col md={6}>
                <Form.Label className="small">Postal Code</Form.Label>
                <Form.Control name="postalCode" value={form.postalCode} onChange={handleChange} />
              </Col>
              <Col md={6}>
                <Form.Label className="small">Country</Form.Label>
                <Form.Control name="country" value={form.country} onChange={handleChange} />
              </Col>
            </Row>

            <Button type="submit" className="mt-4" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
