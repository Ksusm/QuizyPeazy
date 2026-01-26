import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from '../request';
import { AuthTestHelper } from '../helpers/auth.helper';
import axios from 'axios';
import { Config } from '../../config';

describe('POST /sessions/:roomCode/start', () => {
    let roomCode: string;

    beforeAll(async () => {
        await AuthTestHelper.setupAdminUser();

        for (let i = 1; i <= 5; i++) {
            await axios.post(
                `${Config.questionService.url}/questions`,
                {
                    text: `Test question ${i}`,
                    answers: ['A', 'B', 'C', 'D'],
                    correctIndex: 0
                },
                { headers: { 'Authorization': `Bearer ${AuthTestHelper.getAdminToken()}` } }
            );
        }
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

    it('should start a game session', async () => {
        const response = await request
            .post(`/sessions/${roomCode}/start`)
            .set('Authorization', `Bearer ${AuthTestHelper.getAdminToken()}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('in-progress');
        expect(response.body.questions).toHaveLength(5);
        expect(response.body.currentRound).toBe(1);
    });

    it('should require authentication', async () => {
        const response = await request
            .post(`/sessions/${roomCode}/start`);

        expect(response.status).toBe(401);
    });
});