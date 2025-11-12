import { beforeEach, describe, expect, it } from "vitest";
import request from "../request";
import mongo from "../../src/database/mongo";
import { ObjectId } from "mongodb";

describe('PUT /questions/:id', () => {
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

    it('returns 200 for valid update', async () => {
        const res = await request
            .put(`/questions/${questionId.toHexString()}`)
            .send({
                text: 'What is the capital of Germany?',
                answers: ['Berlin', 'Munich', 'Hamburg'],
                correctIndex: 0,
            });

        console.log(res.body);

        expect(res.status).toBe(200);
        expect(res.body.text).toBe('What is the capital of Germany?');
        expect(res.body.answers).toEqual(['Berlin', 'Munich', 'Hamburg']);
        expect(res.body.correctIndex).toBe(0);
    });

    it('returns 404 for non-existing question', async () => {
        const nonExistingId = new ObjectId();
        const res = await request
            .put(`/questions/${nonExistingId.toHexString()}`)
            .send({
                text: 'What is the capital of Germany?',
                answers: ['Berlin', 'Munich'],
                correctIndex: 0,
            });

        console.log(res.body);
        expect(res.status).toBe(404);
    });

    it('returns 400 for invalid ObjectId', async () => {
        const res = await request
            .put('/questions/invalid-id')
            .send({
                text: 'What is the capital of Germany?',
                answers: ['Berlin', 'Munich'],
                correctIndex: 0,
            });

        console.log(res.body);
        expect(res.status).toBe(400);
    });

    it('returns 400 for empty text', async () => {
        const res = await request
            .put(`/questions/${questionId.toHexString()}`)
            .send({
                text: '',
                answers: ['Berlin', 'Munich'],
                correctIndex: 0,
            });

        console.log(res.body);
        expect(res.status).toBe(400);
    });

    it('returns 400 for correctIndex out of bounds', async () => {
        const res = await request
            .put(`/questions/${questionId.toHexString()}`)
            .send({
                text: 'What is the capital of Germany?',
                answers: ['Berlin', 'Munich'],
                correctIndex: 5,
            });

        console.log(res.body);
        expect(res.status).toBe(400);
    });
});
