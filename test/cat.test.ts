import {describe, it} from "vitest";
import request from "./request";

describe('status', () => {
    it('returns 201 on /cats', async () => {
        const payload = {"name": "Bert"}
        await request
            .post('/cats')
            .send(payload)
            .expect(201)
    })
})
