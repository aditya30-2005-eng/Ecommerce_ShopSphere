import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import adminService from '../../services/adminService';
import StatCard from '../../components/admin/StatCard';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatCurrency } from '../../utils/formatCurrency';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getStats();
      setStats(res.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div>
      <h3 className="mb-4">Dashboard</h3>
      <Row className="g-3">
        <Col md={4}>
          <StatCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon="bi-currency-rupee" />
        </Col>
        <Col md={4}>
          <StatCard label="Total Products" value={stats.totalProducts} icon="bi-box-seam" />
        </Col>
        <Col md={4}>
          <StatCard label="Total Users" value={stats.totalUsers} icon="bi-people" />
        </Col>
        <Col md={4}>
          <StatCard label="Total Orders" value={stats.totalOrders} icon="bi-receipt" />
        </Col>
        <Col md={4}>
          <StatCard label="Pending Orders" value={stats.pendingOrders} icon="bi-hourglass-split" />
        </Col>
        <Col md={4}>
          <StatCard label="Delivered Orders" value={stats.deliveredOrders} icon="bi-check2-circle" />
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
