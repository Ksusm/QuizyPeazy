import { beforeEach, describe, expect, it } from "vitest";
import mongo from "../../../src/database/mongo";
import request from "../../request";

describe('POST /auth/register', () => {
    beforeEach(async () => {
        await mongo.db.collection("users").deleteMany({});
    });

    it('returns 201 for valid registration', async () => {
        const username = `test-user-${Date.now()}`;
        const res = await request
            .post('/auth/register')
            .send({
                username,
                password: 'password123'
            });

        console.log(res.body);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('keycloakId');
        expect(res.body.username).toBe(username);
        expect(res.body.totalScore).toBe(0);
        expect(res.body.gamesPlayed).toBe(0);
    });

    it('returns 400 for username less than 3 characters', async () => {
        const res = await request
            .post('/auth/register')
            .send({
                username: 'ab',
                password: 'password123'
            });

        console.log(res.body);
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

        console.log(res.body);
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

        console.log(res.body);
        expect(res.status).toBe(400);
    });

    it('returns 400 for empty password', async () => {
        const res = await request
            .post('/auth/register')
            .send({
                username: 'testuser',
                password: ''
            });

        console.log(res.body);
        expect(res.status).toBe(400);
    });

    it('returns 409 for duplicate username', async () => {
        const username = `test-user-${Date.now()}`;

        // First registration
        await request
            .post('/auth/register')
            .send({
                username,
                password: 'password123'
            });

        // Second registration with same username
        const res = await request
            .post('/auth/register')
            .send({
                username,
                password: 'password456'
            });

        console.log(res.body);
        expect(res.status).toBe(409);
        expect(res.body.message).toContain('already exists');
    });
});