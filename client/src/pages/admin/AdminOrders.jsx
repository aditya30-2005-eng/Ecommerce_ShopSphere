import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import orderService from '../../services/orderService';
import AdminTable from '../../components/admin/AdminTable';
import OrderStatusBadge from '../../components/order/OrderStatusBadge';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import Pagination from '../../components/common/Pagination';
import { formatCurrency } from '../../utils/formatCurrency';

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const AdminOrders = () => {
  const [data, setData] = useState({ orders: [], page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await orderService.getAllOrders({ page, limit: 10, status: statusFilter || undefined });
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const handleStatusChange = async (orderId, status) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Orders</h3>
        <Form.Select style={{ width: 200 }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Form.Select>
      </div>

      {loading && <Loader text="Loading orders..." />}
      {error && <ErrorMessage message={error} onRetry={load} />}

      {!loading && !error && (
        <>
          <AdminTable columns={['Order ID', 'Customer', 'Total', 'Payment', 'Status', 'Date', '']}>
            {data.orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id.slice(-8).toUpperCase()}</td>
                <td>{order.user?.name || 'N/A'}</td>
                <td>{formatCurrency(order.totalAmount)}</td>
                <td>
                  <span className={`badge bg-${order.paymentStatus === 'Paid' ? 'success' : 'secondary'}`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td style={{ minWidth: 140 }}>
                  <Form.Select
                    size="sm"
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Form.Select>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <Link to={`/orders/${order._id}`} className="btn btn-sm btn-outline-primary">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </AdminTable>
          <Pagination page={data.page} pages={data.pages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default AdminOrders;
