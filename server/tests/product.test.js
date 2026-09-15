require('./setup');
const request = require('supertest');
const app = require('../server');
const Product = require('../models/Product');

const sampleProduct = {
  name: 'Test Product',
  description: 'A product used for testing',
  price: 1000,
  discountPrice: 800,
  category: 'Electronics',
  brand: 'TestBrand',
  stock: 10,
};

const registerAdmin = async () => {
  const User = require('../models/User');
  const user = await User.create({
    name: 'Admin',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
  });
  const generateToken = require('../utils/generateToken');
  return generateToken(user._id);
};

describe('Product API', () => {
  it('lists products with pagination metadata', async () => {
    await Product.create(sampleProduct);
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBe(1);
    expect(res.body.page).toBe(1);
  });

  it('returns 404 for a non-existent product id', async () => {
    const res = await request(app).get('/api/products/64b64b64b64b64b64b64b64b');
    expect(res.statusCode).toBe(404);
  });

  it('blocks product creation without admin rights', async () => {
    const res = await request(app).post('/api/products').send(sampleProduct);
    expect(res.statusCode).toBe(401);
  });

  it('allows an admin to create a product', async () => {
    const token = await registerAdmin();
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleProduct);
    expect(res.statusCode).toBe(201);
    expect(res.body.product.name).toBe(sampleProduct.name);
  });

  it('filters products by category', async () => {
    await Product.create(sampleProduct);
    await Product.create({ ...sampleProduct, name: 'Other', category: 'Fashion' });
    const res = await request(app).get('/api/products?category=Fashion');
    expect(res.body.products.length).toBe(1);
    expect(res.body.products[0].category).toBe('Fashion');
  });
});
