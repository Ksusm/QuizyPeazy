import {describe, it} from "vitest";
import request from "./request";

describe('status', () => {
    it('returns 200 on /status', async () => {
        await request
            .get('/status')
            .expect(200)
    })
})
