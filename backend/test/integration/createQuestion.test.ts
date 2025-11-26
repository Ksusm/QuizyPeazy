import {beforeEach, describe, expect, it} from "vitest";
import mongo from "../../src/database/mongo";
import request from "../request";

describe('POST /questions', () =>{
    beforeEach(async () =>{
        await  mongo.db.collection("questions").deleteMany({});
    });

    it('returns 201 for valid data', async () => {
        const res = await request
            .post('/questions')
            .send({
                text: 'What is the capital of France?',
                answers: ['Paris', 'London', 'Berlin', 'Madrid'],
                correctIndex: 0
            });
        console.log(res.body);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.text).toBe('What is the capital of France?');
    });

    it('returns 400 for empty text', async () => {
        const res = await request
            .post('/questions')
            .send({
                text: '',
                answers: ['Paris', 'London', 'Berlin', 'Madrid'],
                correctIndex: 0
            });
        console.log(res.body);
        expect(res.status).toBe(400);
    });

    it('returns 400 for less than 2 answers', async () => {
        const res = await request
            .post('/questions')
            .send({
                text: 'What is the capital of France?',
                answers: ['Paris'],
                correctIndex: 0
            });
        console.log(res.body);
        expect(res.status).toBe(400);
    });

    it('returns 400 for negative correct index', async () => {
        const res = await request
            .post('/questions')
            .send({
                text: 'What is the capital of France?',
                answers: ['Paris', 'London', 'Berlin', 'Madrid'],
                correctIndex: -1
            });
        console.log(res.body);
        expect(res.status).toBe(400);
    });

    it('returns 400 for correct index out of bounds', async () => {
        const res = await request
            .post('/questions')
            .send({
                text: 'What is the capital of France?',
                answers: ['Paris', 'London', 'Berlin', 'Madrid'],
                correctIndex: 5
            });
        console.log(res.body);
        expect(res.status).toBe(400);
    });
});