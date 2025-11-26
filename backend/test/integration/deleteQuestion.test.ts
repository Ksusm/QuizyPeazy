import { beforeEach, describe, expect, it } from "vitest";
import mongo from "../../src/database/mongo";
import { ObjectId } from "mongodb";
import request from "../request";

describe('DELETE /questions/:id', () => {
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

    it('returns 204 for successful deletion', async () => {
        const res = await request.delete(`/questions/${questionId.toHexString()}`);

        console.log(res.body);
        expect(res.status).toBe(204);

        const deletedQuestion = await mongo.db.collection("questions").findOne({ _id: questionId });
        expect(deletedQuestion).toBeNull();
    });

    it('returns 204 for non-existing question', async () => {
        const nonExistingId = new ObjectId();
        const res = await request.delete(`/questions/${nonExistingId.toHexString()}`);

        console.log(res.body);
        expect(res.status).toBe(204);
    });

    it('returns 400 for invalid ObjectId', async () => {
        const res = await request.delete('/questions/invalid-id');

        console.log(res.body);
        expect(res.status).toBe(400);
    });
});
