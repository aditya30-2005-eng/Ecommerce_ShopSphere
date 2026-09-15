require('./setup');
const request = require('supertest');
const app = require('../server');
const Product = require('../models/Product');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const setupUserAndProduct = async (stock = 5) => {
  const user = await User.create({ name: 'Buyer', email: 'buyer@test.com', password: 'password123' });
  const product = await Product.create({
    name: 'Cart Product',
    description: 'desc',
    price: 500,
    category: 'Electronics',
    brand: 'Brand',
    stock,
  });
  return { token: generateToken(user._id), product };
};

describe('Cart API', () => {
  it('adds an item to the cart', async () => {
    const { token, product } = await setupUserAndProduct();
    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id, quantity: 2 });
    expect(res.statusCode).toBe(201);
    expect(res.body.cart.items).toHaveLength(1);
    expect(res.body.cart.items[0].quantity).toBe(2);
  });

  it('prevents adding more items than the available stock', async () => {
    const { token, product } = await setupUserAndProduct(2);
    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id, quantity: 5 });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/stock/i);
  });

  it('updates item quantity', async () => {
    const { token, product } = await setupUserAndProduct(10);
    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id, quantity: 1 });
    const res = await request(app)
      .put(`/api/cart/${product._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 4 });
    expect(res.statusCode).toBe(200);
    expect(res.body.cart.items[0].quantity).toBe(4);
  });

  it('removes an item from the cart', async () => {
    const { token, product } = await setupUserAndProduct(10);
    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id, quantity: 1 });
    const res = await request(app)
      .delete(`/api/cart/${product._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.cart.items).toHaveLength(0);
  });
});
