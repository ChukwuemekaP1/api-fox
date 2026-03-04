const crypto = require('crypto');
const request = require('supertest');

jest.mock('../models/User.model', () => ({
  findOne: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  decode: jest.fn(),
}));

const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../app');

describe('POST /api/auth/login', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns access and refresh tokens for valid credentials', async () => {
    const user = {
      _id: '507f1f77bcf86cd799439011',
      email: 'john@example.com',
      role: 'user',
      isVerified: true,
      password: 'hashed-password',
      save: jest.fn().mockResolvedValue(undefined),
    };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(user),
    });

    bcrypt.compare.mockResolvedValue(true);
    jwt.sign
      .mockReturnValueOnce('access-token')
      .mockReturnValueOnce('refresh-token');
    jwt.decode.mockReturnValue({ exp: 1735689600 });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'password123' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.data).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');

    const expectedHash = crypto
      .createHash('sha256')
      .update('refresh-token')
      .digest('hex');

    expect(user.refreshTokenHash).toBe(expectedHash);
    expect(user.refreshTokenExpiresAt).toEqual(new Date(1735689600 * 1000));
    expect(user.save).toHaveBeenCalledTimes(1);
  });

  it('returns 401 for invalid credentials', async () => {
    const user = {
      _id: '507f1f77bcf86cd799439011',
      email: 'john@example.com',
      role: 'user',
      isVerified: true,
      password: 'hashed-password',
      save: jest.fn(),
    };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(user),
    });

    bcrypt.compare.mockResolvedValue(false);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'wrong-password' })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid credentials');
    expect(user.save).not.toHaveBeenCalled();
  });

  it('returns 401 when user is not verified', async () => {
    const user = {
      _id: '507f1f77bcf86cd799439011',
      email: 'john@example.com',
      role: 'user',
      isVerified: false,
      password: 'hashed-password',
      save: jest.fn(),
    };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(user),
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'password123' })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid credentials');
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });
});
