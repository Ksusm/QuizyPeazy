import { beforeEach, afterAll, describe, expect, it } from "vitest";
import mongo from "../../../src/database/mongo";
import request from "../../request";
import { AuthTestHelper } from "../../helpers/auth.helper";

describe('POST /auth/register', () => {
    const createdUsernames: string[] = [];

    beforeEach(async () => {
        await mongo.db.collection("users").deleteMany({});
    });

    afterAll(async () => {
        for (const username of createdUsernames) {
            await AuthTestHelper.deleteUserByUsername(username);
        }
    });

    it('returns 201 for valid registration', async () => {
        const username = `test-user-${Date.now()}`;
        createdUsernames.push(username);

        const res = await request
            .post('/auth/register')
            .send({
                username,
                password: 'password123'
            });

        expect(res.status).toBe(201);
        expect(res.body.username).toBe(username);
    });

    it('returns 400 for username less than 3 characters', async () => {
        const res = await request
            .post('/auth/register')
            .send({
                username: 'ab',
                password: 'password123'
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('Username must be at least 3 characters');
    });

    it('returns 400 for password less than 6 characters', async () => {
        const res = await request
            .post('/auth/register')
            .send({
                username: 'testuser',
                password: '12345'
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('Password must be at least 6 characters');
    });

    it('returns 400 for empty username', async () => {
        const res = await request
            .post('/auth/register')
            .send({
                username: '',
                password: 'password123'
            });

        expect(res.status).toBe(400);
    });

    it('returns 400 for empty password', async () => {
        const res = await request
            .post('/auth/register')
            .send({
                username: 'testuser',
                password: ''
            });

        expect(res.status).toBe(400);
    });

    it('returns 409 for duplicate username', async () => {
        const username = `test-user-dup-${Date.now()}`;
        createdUsernames.push(username);

        await request
            .post('/auth/register')
            .send({ username, password: 'password123' });

        const res = await request
            .post('/auth/register')
            .send({ username, password: 'password456' });

        expect(res.status).toBe(409);
        expect(res.body.message).toContain('already exists');
    });
});