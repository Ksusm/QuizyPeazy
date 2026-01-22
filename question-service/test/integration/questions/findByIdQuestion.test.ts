import { beforeEach, describe, expect, it } from "vitest";
import mongo from "../../../src/database/mongo";
import { ObjectId } from "mongodb";
import request from "../../request";

describe('GET /questions/:id', () => {
    let questionId: ObjectId;

    beforeEach(async () => {
        await mongo.db.collection("questions").deleteMany({});

        questionId = new ObjectId();

        await mongo.db.collection("questions").insertOne({
            _id: questionId,
            text: 'What is the capital of France?',
            answers: ['Paris', 'London', 'Berlin', 'Madrid'],
            correctIndex: 0,
        });
    });

    it('returns 200 for existing question', async () => {
        const res = await request.get(`/questions/${questionId.toHexString()}`);

        console.log(res.body);
        expect(res.status).toBe(200);
        expect(res.body.text).toBe('What is the capital of France?');
    });

    it('returns 404 for non-existing question', async () => {
        const nonExistingId = new ObjectId();
        const res = await request.get(`/questions/${nonExistingId.toHexString()}`);

        console.log(res.body);
        expect(res.status).toBe(404);
    });

    it('returns 400 for invalid ObjectId', async () => {
        const res = await request.get('/questions/invalid-id');

        console.log(res.body);
        expect(res.status).toBe(400);
    });
});