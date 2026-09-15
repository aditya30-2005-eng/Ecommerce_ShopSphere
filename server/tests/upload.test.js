require('./setup');
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Smallest possible valid PNG (1x1 transparent pixel), used so the test
// suite never depends on a real image file on disk.
const tinyPng = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6360000002000100ffff03000006000557bfabd40000000049454e44ae426082',
  'hex'
);

const createAdminToken = async () => {
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@upload.com',
    password: 'password123',
    role: 'admin',
  });
  return generateToken(admin._id);
};

describe('Upload API', () => {
  it('blocks uploads from unauthenticated users', async () => {
    const res = await request(app).post('/api/upload').attach('images', tinyPng, 'test.png');
    expect(res.statusCode).toBe(401);
  });

  it('lets an admin upload an image and returns a public URL', async () => {
    const token = await createAdminToken();
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('images', tinyPng, 'test.png');

    expect(res.statusCode).toBe(201);
    expect(res.body.urls).toHaveLength(1);
    expect(res.body.urls[0]).toMatch(/\/uploads\/.+\.png$/);
  });

  it('rejects non-image files', async () => {
    const token = await createAdminToken();
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('images', Buffer.from('not an image'), 'test.txt');

    expect(res.statusCode).toBe(400);
  });
});
