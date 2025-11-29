const request = require('supertest');
const express = require('express');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.json());

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

app.post('/register', validate([
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('name').notEmpty().withMessage('Name is required')
]), (req, res) => {
  res.status(201).json({ message: 'User created' });
});

describe('Registration Validation', () => {
  it('should return 400 if email is invalid', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User'
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors[0].msg).toEqual('Invalid email address');
  });

  it('should return 400 if password is too short', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        email: 'test@example.com',
        password: '123',
        name: 'Test User'
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors[0].msg).toEqual('Password must be at least 6 characters long');
  });

  it('should return 201 if input is valid', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
    expect(res.statusCode).toEqual(201);
  });
});
