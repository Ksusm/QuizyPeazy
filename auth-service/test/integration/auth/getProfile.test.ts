import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import mongo from "../../../src/database/mongo";
import request from "../../request";
import { AuthTestHelper } from "../../helpers/auth.helper";
import { ObjectId } from "mongodb";

describe('GET /auth/profile/:id', () => {
    let testUserId: string;

    beforeAll(async () => {
        await AuthTestHelper.setupAdminUser();
    });

    afterAll(async () => {
        await AuthTestHelper.cleanupAdminUser();
    });

    beforeEach(async () => {
        await mongo.db.collection("users").deleteMany({});

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

    it('returns 200 for existing user with valid token', async () => {
        const res = await request
            .get(`/auth/profile/${testUserId}`)
            .set('Authorization', `Bearer ${AuthTestHelper.getAdminToken()}`);

        expect(res.status).toBe(200);
        expect(res.body.username).toBe('testuser');
    });

    it('returns 404 for non-existing user', async () => {
        const nonExistingId = new ObjectId();
        const res = await request
            .get(`/auth/profile/${nonExistingId.toHexString()}`)
            .set('Authorization', `Bearer ${AuthTestHelper.getAdminToken()}`);

        expect(res.status).toBe(404);
    });

    it('returns 400 for invalid ObjectId', async () => {
        const res = await request
            .get('/auth/profile/invalid-id')
            .set('Authorization', `Bearer ${AuthTestHelper.getAdminToken()}`);

        expect(res.status).toBe(400);
    });

    it('returns 401 without authentication', async () => {
        const res = await request.get(`/auth/profile/${testUserId}`);
        expect(res.status).toBe(401);
    });
});