import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Alert } from 'react-bootstrap';
import productService from '../../services/productService';
import uploadService from '../../services/uploadService';
import AdminTable from '../../components/admin/AdminTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import Pagination from '../../components/common/Pagination';
import { formatCurrency } from '../../utils/formatCurrency';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  discountPrice: '',
  category: '',
  brand: '',
  stock: '',
  images: [],
};

const AdminProducts = () => {
  const [data, setData] = useState({ products: [], page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await productService.getProducts({ page, limit: 10 });
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
  }, [page]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setUrlInput('');
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || '',
      category: product.category,
      brand: product.brand,
      stock: product.stock,
      images: product.images || [],
    });
    setFormError('');
    setUrlInput('');
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Uploads the selected files to the backend (multer -> /uploads) and
  // appends the returned public URLs to the product's image list.
  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setFormError('');
    setUploading(true);
    try {
      const res = await uploadService.uploadImages(files);
      setForm((f) => ({ ...f, images: [...f.images, ...res.urls] }));
    } catch (err) {
      setFormError(err.message);
    } finally {
      setUploading(false);
      e.target.value = ''; // allow re-selecting the same file again
    }
  };

  // Fallback for pasting an external image URL instead of uploading a file.
  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    setForm((f) => ({ ...f, images: [...f.images, urlInput.trim()] }));
    setUrlInput('');
  };

  const handleRemoveImage = (index) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name || !form.description || !form.price || !form.category || !form.brand || form.stock === '') {
      setFormError('Please fill in all required fields.');
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      discountPrice: Number(form.discountPrice) || 0,
      category: form.category,
      brand: form.brand,
      stock: Number(form.stock),
      images: form.images.length > 0 ? form.images : undefined,
    };

    setSaving(true);
    try {
      if (editingId) {
        await productService.updateProduct(editingId, payload);
      } else {
        await productService.createProduct(payload);
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
      await productService.deleteProduct(deleteTarget._id);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Products</h3>
        <Button onClick={openCreateModal}>
          <i className="bi bi-plus-lg me-1"></i>Add Product
        </Button>
      </div>

      {loading && <Loader text="Loading products..." />}
      {error && <ErrorMessage message={error} onRetry={load} />}

      {!loading && !error && (
        <>
          <AdminTable columns={['Image', 'Name', 'Category', 'Price', 'Stock', 'Rating', 'Actions']}>
            {data.products.map((product) => (
              <tr key={product._id}>
                <td>
                  <img src={product.images?.[0]} alt="" style={{ width: 44, height: 44, objectFit: 'cover' }} className="rounded" />
                </td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{formatCurrency(product.discountPrice || product.price)}</td>
                <td>
                  <span className={`badge bg-${product.stock > 0 ? 'success' : 'danger'}`}>{product.stock}</span>
                </td>
                <td>{product.rating?.toFixed(1)} ({product.numReviews})</td>
                <td>
                  <Button size="sm" variant="outline-secondary" className="me-2" onClick={() => openEditModal(product)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => setDeleteTarget(product)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </AdminTable>
          <Pagination page={data.page} pages={data.pages} onPageChange={setPage} />
        </>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit Product' : 'Add Product'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Label className="small">Name</Form.Label>
                <Form.Control name="name" value={form.name} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <Form.Label className="small">Category</Form.Label>
                <Form.Control name="category" value={form.category} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <Form.Label className="small">Brand</Form.Label>
                <Form.Control name="brand" value={form.brand} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <Form.Label className="small">Stock</Form.Label>
                <Form.Control type="number" min="0" name="stock" value={form.stock} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <Form.Label className="small">Price</Form.Label>
                <Form.Control type="number" min="0" name="price" value={form.price} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <Form.Label className="small">Discount Price (optional)</Form.Label>
                <Form.Control type="number" min="0" name="discountPrice" value={form.discountPrice} onChange={handleChange} />
              </div>
              <div className="col-12">
                <Form.Label className="small">Description</Form.Label>
                <Form.Control as="textarea" rows={3} name="description" value={form.description} onChange={handleChange} />
              </div>
              <div className="col-12">
                <Form.Label className="small">Product Images</Form.Label>

                {form.images.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    {form.images.map((url, idx) => (
                      <div key={url + idx} className="position-relative">
                        <img
                          src={url}
                          alt=""
                          className="rounded border"
                          style={{ width: 70, height: 70, objectFit: 'cover' }}
                        />
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => handleRemoveImage(idx)}
                          aria-label="Remove image"
                          className="position-absolute p-0 rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: 20, height: 20, top: -6, right: -6, lineHeight: 1 }}
                        >
                          <small>&times;</small>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Form.Control type="file" accept="image/*" multiple onChange={handleFileSelect} disabled={uploading} />
                {uploading && <div className="small text-muted mt-1">Uploading...</div>}
                <div className="text-muted small my-1">or</div>
                <div className="d-flex gap-2">
                  <Form.Control
                    size="sm"
                    placeholder="Paste an image URL"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddUrl();
                      }
                    }}
                  />
                  <Button type="button" size="sm" variant="outline-secondary" onClick={handleAddUrl}>
                    Add URL
                  </Button>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Product'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmModal
        show={!!deleteTarget}
        title="Delete Product"
        body={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminProducts;
