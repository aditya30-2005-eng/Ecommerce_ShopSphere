import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import NotificationCenter from '../components/common/NotificationCenter';

const MainLayout = () => (
  <div className="site-shell d-flex flex-column min-vh-100">
    <div className="ambient ambient-coral" />
    <div className="ambient ambient-fern" />
    <Navbar />
    <main className="flex-grow-1 position-relative">
      <Outlet />
    </main>
    <Footer />
    <NotificationCenter />
  </div>
);

export default MainLayout;
