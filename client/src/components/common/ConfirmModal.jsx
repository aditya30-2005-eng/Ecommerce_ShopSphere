import React from 'react';
import { Modal, Button } from 'react-bootstrap';

// Reusable confirmation dialog for destructive actions (delete product,
// cancel order, remove cart item, etc.)
const ConfirmModal = ({ show, title = 'Please confirm', body, onConfirm, onCancel, confirmText = 'Confirm', confirmVariant = 'danger' }) => (
  <Modal show={show} onHide={onCancel} centered>
    <Modal.Header closeButton>
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>{body}</Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
      <Button variant={confirmVariant} onClick={onConfirm}>
        {confirmText}
      </Button>
    </Modal.Footer>
  </Modal>
);

export default ConfirmModal;
