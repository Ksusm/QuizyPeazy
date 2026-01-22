import { beforeEach, afterAll, describe, expect, it } from "vitest";
import mongo from "../../../src/database/mongo";
import request from "../../request";
import { AuthTestHelper } from "../../helpers/auth.helper";

describe('POST /auth/login', () => {
    const testUsername = `test-login-${Date.now()}`;
    const testPassword = 'password123';

    beforeEach(async () => {
        await mongo.db.collection("users").deleteMany({});

        await request
            .post('/auth/register')
            .send({
                username: testUsername,
                password: testPassword
            });
    });

    afterAll(async () => {
        await AuthTestHelper.deleteUserByUsername(testUsername);
    });

    it('returns 200 and tokens for valid credentials', async () => {
        const res = await request
            .post('/auth/login')
            .send({
                username: testUsername,
                password: testPassword
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body.user.username).toBe(testUsername);
    });

    it('returns 401 for invalid password', async () => {
        const res = await request
            .post('/auth/login')
            .send({
                username: testUsername,
                password: 'wrongpassword'
            });

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

        expect(res.status).toBe(401);
    });

    it('returns 400 for empty username', async () => {
        const res = await request
            .post('/auth/login')
            .send({
                username: '',
                password: 'password123'
            });

        expect(res.status).toBe(400);
    });

    it('returns 400 for empty password', async () => {
        const res = await request
            .post('/auth/login')
            .send({
                username: testUsername,
                password: ''
            });

        expect(res.status).toBe(400);
    });
});