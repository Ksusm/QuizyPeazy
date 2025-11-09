/**
 * @openapi
 * /status:
 *   get:
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Server is healthy
 */
import * as express from 'express'

const statusController = {
    getStatus(req: express.Request, res: express.Response) {
        res.sendStatus(200)
    }
}

export default statusController
