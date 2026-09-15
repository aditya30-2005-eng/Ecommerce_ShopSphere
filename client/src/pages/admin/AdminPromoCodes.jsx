import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Alert } from 'react-bootstrap';
import adminService from '../../services/adminService';
import AdminTable from '../../components/admin/AdminTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatCurrency } from '../../utils/formatCurrency';

const emptyForm = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  minOrderAmount: '',
  maxDiscountAmount: '',
  usageLimit: '',
  isActive: true,
};

const AdminPromoCodes = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getPromoCodes();
      setPromoCodes(res.promoCodes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (promo) => {
    setEditingId(promo._id);
    setForm({
      code: promo.code,
      description: promo.description || '',
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      minOrderAmount: promo.minOrderAmount || '',
      maxDiscountAmount: promo.maxDiscountAmount || '',
      usageLimit: promo.usageLimit || '',
      isActive: promo.isActive,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.code.trim() || !form.discountValue) {
      setFormError('Please provide a code and discount value.');
      return;
    }

    const payload = {
      code: form.code.trim(),
      description: form.description,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrderAmount: Number(form.minOrderAmount) || 0,
      maxDiscountAmount: Number(form.maxDiscountAmount) || 0,
      usageLimit: Number(form.usageLimit) || 0,
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      if (editingId) {
        await adminService.updatePromoCode(editingId, payload);
      } else {
        await adminService.createPromoCode(payload);
      }
      setShowModal(false);
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.deletePromoCode(deleteTarget._id);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleActive = async (promo) => {
    try {
      await adminService.updatePromoCode(promo._id, { isActive: !promo.isActive });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Promo Codes</h3>
        <Button onClick={openCreateModal}>
          <i className="bi bi-plus-lg me-1"></i>New Code
        </Button>
      </div>

      {loading && <Loader text="Loading promo codes..." />}
      {error && <ErrorMessage message={error} onRetry={load} />}

      {!loading && !error && (
        <AdminTable columns={['Code', 'Discount', 'Min Order', 'Usage', 'Status', 'Actions']}>
          {promoCodes.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center text-muted py-4">
                No promo codes yet. Create one to offer shoppers a discount at checkout.
              </td>
            </tr>
          )}
          {promoCodes.map((promo) => (
            <tr key={promo._id}>
              <td>
                <strong>{promo.code}</strong>
                {promo.description && <div className="text-muted small">{promo.description}</div>}
              </td>
              <td>
                {promo.discountType === 'percentage'
                  ? `${promo.discountValue}%${promo.maxDiscountAmount ? ` (max ${formatCurrency(promo.maxDiscountAmount)})` : ''}`
                  : formatCurrency(promo.discountValue)}
              </td>
              <td>{promo.minOrderAmount ? formatCurrency(promo.minOrderAmount) : '—'}</td>
              <td>
                {promo.usedCount}
                {promo.usageLimit ? ` / ${promo.usageLimit}` : ''}
              </td>
              <td>
                <span
                  role="button"
                  className={`badge bg-${promo.isActive ? 'success' : 'secondary'}`}
                  onClick={() => toggleActive(promo)}
                  title="Click to toggle"
                >
                  {promo.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <Button size="sm" variant="outline-secondary" className="me-2" onClick={() => openEditModal(promo)}>
                  Edit
                </Button>
                <Button size="sm" variant="outline-danger" onClick={() => setDeleteTarget(promo)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit Promo Code' : 'New Promo Code'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}
            <div className="row g-3">
              <div className="col-md-7">
                <Form.Label className="small">Code</Form.Label>
                <Form.Control name="code" value={form.code} onChange={handleChange} placeholder="e.g. WELCOME20" />
              </div>
              <div className="col-md-5">
                <Form.Label className="small">Type</Form.Label>
                <Form.Select name="discountType" value={form.discountType} onChange={handleChange}>
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat Amount</option>
                </Form.Select>
              </div>
              <div className="col-12">
                <Form.Label className="small">Description (optional)</Form.Label>
                <Form.Control name="description" value={form.description} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <Form.Label className="small">
                  Discount Value {form.discountType === 'percentage' ? '(%)' : '(₹)'}
                </Form.Label>
                <Form.Control type="number" min="0" name="discountValue" value={form.discountValue} onChange={handleChange} />
              </div>
              {form.discountType === 'percentage' && (
                <div className="col-md-6">
                  <Form.Label className="small">Max Discount (₹, optional)</Form.Label>
                  <Form.Control type="number" min="0" name="maxDiscountAmount" value={form.maxDiscountAmount} onChange={handleChange} />
                </div>
              )}
              <div className="col-md-6">
                <Form.Label className="small">Minimum Order (₹, optional)</Form.Label>
                <Form.Control type="number" min="0" name="minOrderAmount" value={form.minOrderAmount} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <Form.Label className="small">Usage Limit (optional)</Form.Label>
                <Form.Control type="number" min="0" name="usageLimit" value={form.usageLimit} onChange={handleChange} placeholder="Unlimited" />
              </div>
              <div className="col-12">
                <Form.Check type="checkbox" id="isActive" name="isActive" label="Active" checked={form.isActive} onChange={handleChange} />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Code'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmModal
        show={!!deleteTarget}
        title="Delete Promo Code"
        body={`Are you sure you want to delete "${deleteTarget?.code}"? This cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminPromoCodes;
