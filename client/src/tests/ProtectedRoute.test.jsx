import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminRoute from '../components/common/AdminRoute';

const renderWithAuth = (authValue, initialPath = '/private') =>
  render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/" element={<div>Home Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/private" element={<div>Private Page</div>} />
          </Route>
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<div>Admin Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to /login', () => {
    renderWithAuth({ isAuthenticated: false, loading: false });
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders the protected content for authenticated users', () => {
    renderWithAuth({ isAuthenticated: true, loading: false });
    expect(screen.getByText('Private Page')).toBeInTheDocument();
  });

  it('shows a loader while the auth check is in progress', () => {
    renderWithAuth({ isAuthenticated: false, loading: true });
    expect(screen.getByText(/checking your session/i)).toBeInTheDocument();
  });
});

describe('AdminRoute', () => {
  it('redirects non-admin users away from admin pages', () => {
    renderWithAuth({ isAuthenticated: true, isAdmin: false, loading: false }, '/admin');
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('renders admin content for admin users', () => {
    renderWithAuth({ isAuthenticated: true, isAdmin: true, loading: false }, '/admin');
    expect(screen.getByText('Admin Page')).toBeInTheDocument();
  });
});
