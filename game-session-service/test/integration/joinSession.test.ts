import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from '../request';
import { AuthTestHelper } from '../helpers/auth.helper';

describe('POST /sessions/:roomCode/join', () => {
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

    it('should allow a player to join a session', async () => {
        const response = await request
            .post(`/sessions/${roomCode}/join`)
            .send({ userId: 'user456' });

        expect(response.status).toBe(200);
        expect(response.body.players).toContain('user456');
        expect(response.body.scores).toHaveProperty('user456');
    });

    it('should return 404 for non-existent session', async () => {
        const response = await request
            .post('/sessions/INVALID/join')
            .send({ userId: 'user456' });

        expect(response.status).toBe(404);
    });

    it('should prevent joining already started game', async () => {
        await request
            .post(`/sessions/${roomCode}/start`)
            .set('Authorization', `Bearer ${AuthTestHelper.getAdminToken()}`);

        const response = await request
            .post(`/sessions/${roomCode}/join`)
            .send({ userId: 'user789' });

        expect(response.status).toBe(400);
    });
});