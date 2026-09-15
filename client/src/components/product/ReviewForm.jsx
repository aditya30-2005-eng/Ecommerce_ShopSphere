import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import StarRating from '../common/StarRating';

const ReviewForm = ({ onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!comment.trim()) {
      setError('Please write a comment for your review');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ rating, comment });
      setComment('');
      setRating(5);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="border rounded p-3 bg-white">
      <h6>Write a Review</h6>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group className="mb-2">
        <Form.Label className="small">Your Rating</Form.Label>
        <div>
          <StarRating value={rating} onChange={setRating} size="1.3rem" />
        </div>
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label className="small">Your Review</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product"
        />
      </Form.Group>
      <Button type="submit" size="sm" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </Form>
  );
};

export default ReviewForm;
