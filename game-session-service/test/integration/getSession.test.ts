import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from '../request';
import { AuthTestHelper } from '../helpers/auth.helper';

describe('GET /sessions/:roomCode', () => {
    let roomCode: string;

    beforeAll(async () => {
        await AuthTestHelper.setupAdminUser();
    });

    afterAll(async () => {
        await AuthTestHelper.cleanupAdminUser();
    });

    beforeEach(async () => {
        const response = await request
            .post('/sessions')
            .set('Authorization', `Bearer ${AuthTestHelper.getAdminToken()}`)
            .send({ hostUserId: 'user123' });

        roomCode = response.body.roomCode;
    });

    it('should retrieve session details', async () => {
        const response = await request
            .get(`/sessions/${roomCode}`);

        expect(response.status).toBe(200);
        expect(response.body.roomCode).toBe(roomCode);
        expect(response.body.players).toContain('user123');
    });

    it('should return 404 for non-existent session', async () => {
        const response = await request
            .get('/sessions/INVALID');

        expect(response.status).toBe(404);
    });
});