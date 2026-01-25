import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from '../request';
import { AuthTestHelper } from '../helpers/auth.helper';

describe('DELETE /sessions/:roomCode', () => {
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

    it('should delete a session', async () => {
        const response = await request
            .delete(`/sessions/${roomCode}`)
            .set('Authorization', `Bearer ${AuthTestHelper.getAdminToken()}`);

        expect(response.status).toBe(204);

        const getResponse = await request.get(`/sessions/${roomCode}`);
        expect(getResponse.status).toBe(404);
    });

    it('should require authentication', async () => {
        const response = await request
            .delete(`/sessions/${roomCode}`);

        expect(response.status).toBe(401);
    });
});