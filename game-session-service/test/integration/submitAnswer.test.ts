import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from '../request';
import { AuthTestHelper } from '../helpers/auth.helper';
import axios from 'axios';
import { Config } from '../../config';

describe('POST /sessions/:roomCode/answer', () => {
    let roomCode: string;

    beforeAll(async () => {
        await AuthTestHelper.setupAdminUser();

        for (let i = 1; i <= 5; i++) {
            await axios.post(
                `${Config.questionService.url}/questions`,
                {
                    text: `Question ${i}`,
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
        const createRes = await request
            .post('/sessions')
            .set('Authorization', `Bearer ${AuthTestHelper.getAdminToken()}`)
            .send({ hostUserId: 'user123' });

        roomCode = createRes.body.roomCode;

        await request
            .post(`/sessions/${roomCode}/start`)
            .set('Authorization', `Bearer ${AuthTestHelper.getAdminToken()}`);
    });

    it('should accept a correct answer and update score', async () => {
        const response = await request
            .post(`/sessions/${roomCode}/answer`)
            .send({ userId: 'user123', answerIndex: 0 });

        expect(response.status).toBe(200);
        expect(response.body.scores['user123']).toBe(10);
        expect(response.body.answers['user123']).toHaveLength(1);
    });

    it('should not award points for wrong answer', async () => {
        const response = await request
            .post(`/sessions/${roomCode}/answer`)
            .send({ userId: 'user123', answerIndex: 2 });

        expect(response.status).toBe(200);
        expect(response.body.scores['user123']).toBe(0);
    });

    it('should return 404 for non-existent session', async () => {
        const response = await request
            .post('/sessions/INVALID/answer')
            .send({ userId: 'user123', answerIndex: 0 });

        expect(response.status).toBe(404);
    });
});