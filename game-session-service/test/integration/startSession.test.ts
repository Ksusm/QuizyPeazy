import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import request from '../request';
import { AuthTestHelper } from '../helpers/auth.helper';
import axios from 'axios';
import { Config } from '../../config';

describe('POST /sessions/:roomCode/start', () => {
    let roomCode: string;
    const originalAxiosGet = axios.get;

    beforeAll(async () => {
        // ✅ Setup admin user FIRST (uses real axios for Auth Service)
        await AuthTestHelper.setupAdminUser();

        // ✅ THEN mock only GET requests to Question Service
        vi.spyOn(axios, 'get').mockImplementation((url: string, ...args: any[]) => {
            // Mock only Question Service calls
            if (url.includes(Config.questionService.url)) {
                return Promise.resolve({
                    status: 200,
                    data: [
                        { _id: 'q1', text: 'Test question 1', answers: ['A', 'B', 'C', 'D'], correctIndex: 0 },
                        { _id: 'q2', text: 'Test question 2', answers: ['A', 'B', 'C', 'D'], correctIndex: 1 },
                        { _id: 'q3', text: 'Test question 3', answers: ['A', 'B', 'C', 'D'], correctIndex: 2 },
                        { _id: 'q4', text: 'Test question 4', answers: ['A', 'B', 'C', 'D'], correctIndex: 3 },
                        { _id: 'q5', text: 'Test question 5', answers: ['A', 'B', 'C', 'D'], correctIndex: 0 },
                    ]
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