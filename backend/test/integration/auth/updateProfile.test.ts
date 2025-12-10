import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import mongo from "../../../src/database/mongo";
import request from "../../request";
import { AuthTestHelper } from "../../helpers/auth.helper";
import { ObjectId } from "mongodb";

describe('PUT /auth/profile/:id', () => {
    let testUserId: string;

    beforeAll(async () => {
        await AuthTestHelper.setupAdminUser();
    });

    afterAll(async () => {
        await AuthTestHelper.cleanupAdminUser();
    });

    beforeEach(async () => {
        await mongo.db.collection("users").deleteMany({});

        // Create a test user
        const userDoc = {
            username: 'testuser',
            keycloakId: 'test-keycloak-id',
            totalScore: 100,
            gamesPlayed: 5,
            createdAt: new Date()
        };

        const result = await mongo.db.collection("users").insertOne(userDoc);
        testUserId = result.insertedId.toString();
    });

    it('returns 200 for valid update', async () => {
        const res = await request
            .put(`/auth/profile/${testUserId}`)
            .set('Authorization', `Bearer ${AuthTestHelper.getAdminToken()}`)
            .send({
                username: 'updateduser'
            });

        console.log(res.body);
        expect(res.status).toBe(200);
        expect(res.body.username).toBe('updateduser');
        expect(res.body.totalScore).toBe(100); // Unchanged
        expect(res.body.gamesPlayed).toBe(5);  // Unchanged
    });

    it('returns 404 for non-existing user', async () => {
        const nonExistingId = new ObjectId();
        const res = await request
            .put(`/auth/profile/${nonExistingId.toHexString()}`)
            .set('Authorization', `Bearer ${AuthTestHelper.getAdminToken()}`)
            .send({
                username: 'updateduser'
            });

        console.log(res.body);
        expect(res.status).toBe(404);
    });

    it('returns 400 for invalid ObjectId', async () => {
        const res = await request
            .put('/auth/profile/invalid-id')
            .set('Authorization', `Bearer ${AuthTestHelper.getAdminToken()}`)
            .send({
                username: 'updateduser'
            });

        console.log(res.body);
        expect(res.status).toBe(400);
    });

    it('returns 400 for username less than 3 characters', async () => {
        const res = await request
            .put(`/auth/profile/${testUserId}`)
            .set('Authorization', `Bearer ${AuthTestHelper.getAdminToken()}`)
            .send({
                username: 'ab'
            });

        console.log(res.body);
        expect(res.status).toBe(400);
        expect(res.body.message).toContain('Username must be at least 3 characters');
    });

    it('returns 400 for empty username', async () => {
        const res = await request
            .put(`/auth/profile/${testUserId}`)
            .set('Authorization', `Bearer ${AuthTestHelper.getAdminToken()}`)
            .send({
                username: ''
            });

        console.log(res.body);
        expect(res.status).toBe(400);
    });

    it('returns 409 for duplicate username', async () => {
        // Create another user with different username
        const anotherUserDoc = {
            username: 'anotheruser',
            keycloakId: 'another-keycloak-id',
            totalScore: 0,
            gamesPlayed: 0,
            createdAt: new Date()
        };

        await mongo.db.collection("users").insertOne(anotherUserDoc);

        // Try to update testuser to anotheruser (conflict)
        const res = await request
            .put(`/auth/profile/${testUserId}`)
            .set('Authorization', `Bearer ${AuthTestHelper.getAdminToken()}`)
            .send({
                username: 'anotheruser'
            });

        console.log(res.body);
        expect(res.status).toBe(409);
        expect(res.body.message).toContain('already exists');
    });

    it('returns 401 without authentication', async () => {
        const res = await request
            .put(`/auth/profile/${testUserId}`)
            .send({
                username: 'updateduser'
            });

        console.log(res.body);
        expect(res.status).toBe(401);
    });
});
