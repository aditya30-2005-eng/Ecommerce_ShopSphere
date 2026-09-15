require('./setup');
const request = require('supertest');
const app = require('../server');
const Product = require('../models/Product');
const User = require('../models/User');
const PromoCode = require('../models/PromoCode');
const generateToken = require('../utils/generateToken');

const setupUserWithCart = async () => {
  const user = await User.create({ name: 'Buyer', email: 'buyer@promo.com', password: 'password123' });
  const product = await Product.create({
    name: 'Promo Test Product',
    description: 'desc',
    price: 1000,
    category: 'Electronics',
    brand: 'Brand',
    stock: 10,
  });
  const token = generateToken(user._id);
  await request(app)
    .post('/api/cart')
    .set('Authorization', `Bearer ${token}`)
    .send({ productId: product._id, quantity: 2 }); // subtotal = 2000
  return { token, product };
};

describe('Promo Code API', () => {
  it('applies a percentage discount capped by maxDiscountAmount', async () => {
    await PromoCode.create({
      code: 'BIG20',
      discountType: 'percentage',
      discountValue: 20,
      maxDiscountAmount: 300,
    });
    const { token } = await setupUserWithCart();

    const res = await request(app)
      .post('/api/promo/apply')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'big20' }); // lowercase input should still match

    expect(res.statusCode).toBe(200);
    // 20% of 2000 = 400, but capped at 300
    expect(res.body.promoDiscount).toBe(300);
  });

  it('applies a flat discount', async () => {
    await PromoCode.create({ code: 'FLAT50', discountType: 'flat', discountValue: 50 });
    const { token } = await setupUserWithCart();

    const res = await request(app)
      .post('/api/promo/apply')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'FLAT50' });

    expect(res.statusCode).toBe(200);
    expect(res.body.promoDiscount).toBe(50);
  });

  it('rejects a code below the minimum order amount', async () => {
    await PromoCode.create({ code: 'BIGORDER', discountType: 'flat', discountValue: 50, minOrderAmount: 5000 });
    const { token } = await setupUserWithCart(); // cart subtotal is only 2000

    const res = await request(app)
      .post('/api/promo/apply')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'BIGORDER' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/minimum order/i);
  });

  it('rejects an unknown code', async () => {
    const { token } = await setupUserWithCart();
    const res = await request(app)
      .post('/api/promo/apply')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'DOESNOTEXIST' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('rejects an inactive code', async () => {
    await PromoCode.create({ code: 'OFFCODE', discountType: 'flat', discountValue: 50, isActive: false });
    const { token } = await setupUserWithCart();
    const res = await request(app)
      .post('/api/promo/apply')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'OFFCODE' });
    expect(res.statusCode).toBe(400);
  });

  it('rejects a code that has hit its usage limit', async () => {
    await PromoCode.create({
      code: 'ONEUSE',
      discountType: 'flat',
      discountValue: 50,
      usageLimit: 1,
      usedCount: 1,
    });
    const { token } = await setupUserWithCart();
    const res = await request(app)
      .post('/api/promo/apply')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'ONEUSE' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/usage limit/i);
  });

  it('applies the promo discount to a real COD order and increments usedCount', async () => {
    await PromoCode.create({ code: 'ORDER10', discountType: 'flat', discountValue: 100 });
    const { token } = await setupUserWithCart();

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        promoCode: 'ORDER10',
        contactInfo: { name: 'Buyer', email: 'buyer@promo.com', phone: '9999999999' },
        shippingAddress: { address: '1 Main St', city: 'City', state: 'State', postalCode: '123456', country: 'India' },
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.order.promoCode).toBe('ORDER10');
    expect(res.body.order.promoDiscount).toBe(100);
    // itemsPrice 2000 + shipping (0, over free threshold) - 100 promo = 1900
    expect(res.body.order.totalAmount).toBe(1900);

    const promo = await PromoCode.findOne({ code: 'ORDER10' });
    expect(promo.usedCount).toBe(1);
  });

  it('blocks non-admins from creating promo codes', async () => {
    const { token } = await setupUserWithCart();
    const res = await request(app)
      .post('/api/admin/promo-codes')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'HACK', discountType: 'flat', discountValue: 50 });
    expect(res.statusCode).toBe(403);
  });

  it('lets an admin create a promo code', async () => {
    const admin = await User.create({ name: 'Admin', email: 'admin@promo.com', password: 'password123', role: 'admin' });
    const token = generateToken(admin._id);
    const res = await request(app)
      .post('/api/admin/promo-codes')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'newcode', discountType: 'percentage', discountValue: 15 });
    expect(res.statusCode).toBe(201);
    expect(res.body.promoCode.code).toBe('NEWCODE'); // stored uppercase
  });
});
