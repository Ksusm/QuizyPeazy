import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import request from '../request';
import { AuthTestHelper } from '../helpers/auth.helper';
import axios from 'axios';
import { Config } from '../../config';

describe('POST /sessions/:roomCode/answer', () => {
    let roomCode: string;
    const originalAxiosGet = axios.get;

    beforeAll(async () => {
        // ✅ Setup admin user FIRST (uses real axios for Auth Service)
        await AuthTestHelper.setupAdminUser();

        // ✅ THEN mock only GET requests to Question Service
        vi.spyOn(axios, 'get').mockImplementation((url: string, ...args: any[]) => {
            // Mock only Question Service calls
            if (url.includes(Config.questionService.url)) {
                // If requesting all questions
                if (url.endsWith('/questions')) {
                    return Promise.resolve({
                        status: 200,
                        data: [
                            { _id: 'q1', text: 'Question 1', answers: ['A', 'B', 'C', 'D'], correctIndex: 0 },
                            { _id: 'q2', text: 'Question 2', answers: ['A', 'B', 'C', 'D'], correctIndex: 1 },
                            { _id: 'q3', text: 'Question 3', answers: ['A', 'B', 'C', 'D'], correctIndex: 2 },
                            { _id: 'q4', text: 'Question 4', answers: ['A', 'B', 'C', 'D'], correctIndex: 3 },
                            { _id: 'q5', text: 'Question 5', answers: ['A', 'B', 'C', 'D'], correctIndex: 0 },
                        ]
                    } as any);
                }

                // If requesting specific question by ID
                const questionId = url.split('/').pop();
                return Promise.resolve({
                    status: 200,
                    data: {
                        _id: questionId,
                        text: `Question ${questionId}`,
                        answers: ['A', 'B', 'C', 'D'],
                        correctIndex: 0  // First answer is always correct in mock
                    }
                } as any);
            }

            // Pass through all other requests (like Auth Service)
            return originalAxiosGet(url, ...args);
        });
    });

    afterAll(async () => {
        vi.restoreAllMocks();
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