import { beforeEach, describe, expect, it } from "vitest";
import mongo from "../../../src/database/mongo";
import request from "../../request";

describe('POST /auth/login', () => {
    const testUsername = `test-user-${Date.now()}`;
    const testPassword = 'password123';

    beforeEach(async () => {
        await mongo.db.collection("users").deleteMany({});

        // Create a test user
        await request
            .post('/auth/register')
            .send({
                username: testUsername,
                password: testPassword
            });
    });

    it('returns 200 and tokens for valid credentials', async () => {
        const res = await request
            .post('/auth/login')
            .send({
                username: testUsername,
                password: testPassword
            });

        console.log(res.body);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');
        expect(res.body).toHaveProperty('expiresIn');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.username).toBe(testUsername);
        expect(res.body.user.totalScore).toBe(0);
    });

    it('returns 401 for invalid password', async () => {
        const res = await request
            .post('/auth/login')
            .send({
                username: testUsername,
                password: 'wrongpassword'
            });

        console.log(res.body);
        expect(res.status).toBe(401);
        expect(res.body.message).toContain('Invalid username or password');
    });

    it('returns 401 for non-existing username', async () => {
        const res = await request
            .post('/auth/login')
            .send({
                username: 'nonexistent',
                password: 'password123'
            });

        console.log(res.body);
        expect(res.status).toBe(401);
    });

    it('returns 400 for empty username', async () => {
        const res = await request
            .post('/auth/login')
            .send({
                username: '',
                password: 'password123'
            });

        console.log(res.body);
        expect(res.status).toBe(400);
    });

    it('returns 400 for empty password', async () => {
        const res = await request
            .post('/auth/login')
            .send({
                username: testUsername,
                password: ''
            });

        console.log(res.body);
        expect(res.status).toBe(400);
    });
});