import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from '../request';
import { AuthTestHelper } from '../helpers/auth.helper';

describe('POST /sessions', () => {
    beforeAll(async () => {
        await AuthTestHelper.setupAdminUser();
    });

    afterAll(async () => {
        await AuthTestHelper.cleanupAdminUser();
    });

    it('should create a new session with valid data', async () => {
        const response = await request
            .post('/sessions')
            .set('Authorization', `Bearer ${AuthTestHelper.getAdminToken()}`)
            .send({ hostUserId: 'user123' });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('roomCode');
        expect(response.body.players).toContain('user123');
        expect(response.body.status).toBe('waiting');
    });

    it('should require authentication', async () => {
        const response = await request
            .post('/sessions')
            .send({ hostUserId: 'user123' });

        expect(response.status).toBe(401);
    });

    it('should reject invalid data', async () => {
        const response = await request
            .post('/sessions')
            .set('Authorization', `Bearer ${AuthTestHelper.getAdminToken()}`)
            .send({});

        expect(response.status).toBe(400);
    });
});