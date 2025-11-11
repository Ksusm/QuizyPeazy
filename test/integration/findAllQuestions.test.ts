import {beforeEach, describe, expect, it} from "vitest";
import mongo from "../../src/database/mongo";
import {ObjectId} from "mongodb";
import request from "../request";

describe('GET /questions', () =>{
    beforeEach(async () => {
        await mongo.db.collection("questions").deleteMany({});

        await mongo.db.collection("questions").insertMany([
            {
                _id: new ObjectId('q10000000000000000000001'),
                text: 'What is the capital of France?',
                answers: ['Paris', 'London', 'Berlin', 'Madrid'],
                correctIndex: 0,
            },
            {
                _id: new ObjectId('q10000000000000000000002'),
                text: 'What is 2 + 2?',
                answers: ['3', '4', '5', '6'],
                correctIndex: 1,
            },
        ]);
    });

    it('returns 200 and all questions', async () => {
        const res = await request.get('/questions');

        console.log(res.body);
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0].text).toBe('What is the capital of France?');
    });

    it('returns 200 and empty array when no questions exist', async () => {
        await mongo.db.collection("questions").deleteMany({});
        const res = await request.get('/questions');

        console.log(res.body);
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(0);
    });
});