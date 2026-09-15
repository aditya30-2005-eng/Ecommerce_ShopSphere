import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import useAuth from '../hooks/useAuth';

// Sidebar layout used by every /admin/* page.
const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      <div className="app-navbar py-2 px-3 d-flex justify-content-between align-items-center">
        <Link to="/" className="navbar-brand mb-0">
          Shop<span>Sphere</span> <small className="text-white-50 fs-6">Admin</small>
        </Link>
        <div className="text-white-50 small">
          {user?.name} &nbsp;|&nbsp;
          <button className="btn btn-sm btn-outline-light ms-2" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      <Container fluid>
        <Row>
          <Col md={2} className="admin-sidebar p-3">
            <Nav className="flex-column">
              <Nav.Link as={NavLink} to="/admin" end>
                <i className="bi bi-speedometer2 me-2"></i>Dashboard
              </Nav.Link>
              <Nav.Link as={NavLink} to="/admin/products">
                <i className="bi bi-box-seam me-2"></i>Products
              </Nav.Link>
              <Nav.Link as={NavLink} to="/admin/orders">
                <i className="bi bi-receipt me-2"></i>Orders
              </Nav.Link>
              <Nav.Link as={NavLink} to="/admin/promo-codes">
                <i className="bi bi-ticket-perforated me-2"></i>Promo Codes
              </Nav.Link>
              <Nav.Link as={Link} to="/">
                <i className="bi bi-shop me-2"></i>Back to Store
              </Nav.Link>
            </Nav>
          </Col>
          <Col md={10} className="p-4">
            <Outlet />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminLayout;
