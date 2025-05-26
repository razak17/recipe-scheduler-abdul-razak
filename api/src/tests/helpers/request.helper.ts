import request from 'supertest';
import { Express } from 'express';
import { generateTestToken } from './auth.helper';

export const authRequest = (app: Express, userId: string) => {
  const token = generateTestToken(userId);
  return {
    get: (url: string) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string, data?: any) => request(app).post(url).set('Authorization', `Bearer ${token}`).send(data),
    put: (url: string, data?: any) => request(app).put(url).set('Authorization', `Bearer ${token}`).send(data),
    delete: (url: string) => request(app).delete(url).set('Authorization', `Bearer ${token}`),
  };
};

