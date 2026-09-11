import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express from 'express';
import authRoutes from '../src/routes/authRoutes';
import employeeRoutes from '../src/routes/employeeRoutes';
import { connectDB, disconnectDB } from '../src/config/db';

let app: express.Express;
let mongoServer: MongoMemoryServer;

describe('auth flow', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongoServer.getUri();
    await connectDB();
    app = express();
    app.use(express.json());
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/employees', employeeRoutes);
  });

  afterAll(async () => {
    await disconnectDB();
    await mongoServer.stop();
  });

  it('registers an employee as pending and allows admin approval', async () => {
    const adminRegisterRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Grace Hopper',
      email: 'grace@example.com',
      password: 'password123',
      role: 'admin'
    });

    expect(adminRegisterRes.status).toBe(201);

    const adminLoginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'grace@example.com',
      password: 'password123'
    });

    expect(adminLoginRes.status).toBe(200);
    const adminToken = adminLoginRes.body.data.token;

    const registerRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'password123'
    });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.success).toBe(true);

    const pendingLoginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'ada@example.com',
      password: 'password123'
    });

    expect(pendingLoginRes.status).toBe(403);
    expect(pendingLoginRes.body.message).toBe('Account pending approval');

    const employeeId = registerRes.body.data.user.id;
    const approvalRes = await request(app)
      .put(`/api/v1/employees/${employeeId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(approvalRes.status).toBe(200);
    expect(approvalRes.body.message).toBe('Employee approved');

    const approvedLoginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'ada@example.com',
      password: 'password123'
    });

    expect(approvedLoginRes.status).toBe(200);
    expect(approvedLoginRes.body.success).toBe(true);
  });
});
